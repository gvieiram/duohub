"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { auditLog } from "@/lib/audit/log";
import { auth } from "@/lib/auth/auth";
import { requireAdmin } from "@/lib/auth/helpers";
import { db } from "@/lib/db";
import { inviteUserSchema, revokeUserSchema } from "./schemas";

export type ActionResult =
	| { success: true }
	| { success: false; error: string };

/**
 * Extract the client IP and User-Agent from incoming request headers.
 * Mirrors the private helper in `src/features/auth/actions.ts` — deduplication
 * is deferred to a later PR to avoid scope creep here.
 */
function extractClientContext(reqHeaders: Headers) {
	const ipAddress =
		reqHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ??
		reqHeaders.get("x-real-ip")?.trim() ??
		null;
	const userAgent = reqHeaders.get("user-agent")?.trim() ?? null;
	return { ipAddress, userAgent };
}

/**
 * Invite a new admin user by email.
 *
 * Creates a `User` row with role ADMIN (emailVerified: true so the account is
 * usable immediately), writes a `USER_INVITED` audit row, then sends a
 * magic-link email so the invitee can set their password / activate the session.
 *
 * The magic-link send is best-effort: if Better Auth / Resend throws, we log
 * the error but still return `{ success: true }` because the user row and
 * audit record are already committed. The admin can re-send the invite manually.
 */
export async function inviteUserAction(input: unknown): Promise<ActionResult> {
	const session = await requireAdmin();

	const parsed = inviteUserSchema.safeParse(input);
	if (!parsed.success) return { success: false, error: "Dados inválidos." };

	const { email, name } = parsed.data;

	const existing = await db.user.findUnique({ where: { email } });
	if (existing) {
		return {
			success: false,
			error: "Já existe um administrador com este e-mail.",
		};
	}

	const created = await db.user.create({
		data: { email, name: name ?? null, emailVerified: true, role: "ADMIN" },
	});

	const reqHeaders = await headers();
	const { ipAddress, userAgent } = extractClientContext(reqHeaders);

	await auditLog.write({
		action: "USER_INVITED",
		actorId: session.user.id,
		actorEmail: session.user.email,
		resourceType: "User",
		resourceId: created.id,
		metadata: { email: created.email },
		ipAddress,
		userAgent,
	});

	try {
		await auth.api.signInMagicLink({
			body: { email, callbackURL: "/post-login" },
			headers: reqHeaders,
		});
	} catch (e) {
		console.error("Magic link failed", e);
	}

	revalidatePath("/admin/users");
	return { success: true };
}

/**
 * Revoke an admin user's access.
 *
 * Sets `revokedAt` on the user row and deletes all their active sessions in a
 * single transaction so the revocation takes effect immediately. Writes a
 * `USER_REVOKED` audit row including the target's email for incident
 * traceability. The email lookup is best-effort — we still revoke if it returns
 * null (e.g. user deleted by a concurrent operation).
 */
export async function revokeUserAction(input: unknown): Promise<ActionResult> {
	const session = await requireAdmin();

	const parsed = revokeUserSchema.safeParse(input);
	if (!parsed.success) return { success: false, error: "Dados inválidos." };

	const { userId } = parsed.data;

	if (userId === session.user.id) {
		return {
			success: false,
			error: "Você não pode revogar seu próprio acesso.",
		};
	}

	// Best-effort lookup for audit metadata. There's a tiny race between this
	// read and the transaction below — acceptable at our scale; if we ever
	// need stronger guarantees we'd move the email lookup inside the
	// transaction.
	const target = await db.user.findUnique({
		where: { id: userId },
		select: { email: true },
	});

	await db.$transaction([
		db.user.update({
			where: { id: userId },
			data: { revokedAt: new Date() },
		}),
		db.session.deleteMany({ where: { userId } }),
	]);

	const reqHeaders = await headers();
	const { ipAddress, userAgent } = extractClientContext(reqHeaders);

	await auditLog.write({
		action: "USER_REVOKED",
		actorId: session.user.id,
		actorEmail: session.user.email,
		resourceType: "User",
		resourceId: userId,
		metadata: { email: target?.email ?? null },
		ipAddress,
		userAgent,
	});

	revalidatePath("/admin/users");
	return { success: true };
}
