"use server";

import { headers } from "next/headers";

import { auditLog } from "@/lib/audit/log";
import { auth } from "@/lib/auth/auth";
import { loginSchema } from "./schemas";

export type LoginActionResult = { ok: true };
export type LogoutActionResult = { ok: true };

function extractClientContext(reqHeaders: Headers) {
	const ipAddress =
		reqHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ??
		reqHeaders.get("x-real-ip")?.trim() ??
		null;
	const userAgent = reqHeaders.get("user-agent")?.trim() ?? null;
	return { ipAddress, userAgent };
}

export async function sendLoginMagicLinkAction(
	input: unknown,
): Promise<LoginActionResult> {
	const parsed = loginSchema.safeParse(input);

	if (!parsed.success) {
		return { ok: true };
	}

	const reqHeaders = await headers();
	// Better Auth does not synthesise `ctx.request` when the endpoint is
	// invoked from a Server Action, so IP and User-Agent must travel through
	// `body.metadata` to reach the `sendMagicLink` callback (and the audit
	// log) intact.
	const { ipAddress, userAgent } = extractClientContext(reqHeaders);

	try {
		await auth.api.signInMagicLink({
			body: {
				email: parsed.data.email,
				// `callbackURL` stays as `/admin` by default. The action can't
				// peek at the email's role here without leaking existence info
				// (anti-enumeration), so the destination layout (`requireAdmin`)
				// is what redirects mismatched roles to `/login?error=forbidden`.
				// See spec §6.2 — this is intentional, not a leftover.
				callbackURL: parsed.data.next ?? "/admin",
				// Without `errorCallbackURL`, Better Auth appends `?error=...` to
				// `callbackURL`, which would land users with an expired/invalid
				// link on `/admin?error=EXPIRED_TOKEN` — a route they can't reach
				// without a session. Sending them back to `/login` lets the
				// form surface the error and request a fresh link.
				errorCallbackURL: "/login",
				metadata: { ipAddress, userAgent },
			},
			headers: reqHeaders,
		});
	} catch {
		// Swallow — anti-enumeration. Failures are auditable on the server.
	}

	return { ok: true };
}

/**
 * Sign the user out and write a `USER_LOGOUT` audit row.
 *
 * The audit row is written BEFORE `signOut()` so the actor identity (which
 * Better Auth wipes once the session is gone) is still readable. We always
 * return `{ ok: true }` — even on signOut failure — because the client
 * relies on the redirect happening regardless. Any failure is logged
 * server-side via auditLog's own fail-soft path.
 */
export async function logoutAction(): Promise<LogoutActionResult> {
	const reqHeaders = await headers();
	const { ipAddress, userAgent } = extractClientContext(reqHeaders);

	try {
		const session = await auth.api.getSession({ headers: reqHeaders });
		if (session) {
			await auditLog.write({
				action: "USER_LOGOUT",
				actorId: session.user.id,
				actorEmail: session.user.email,
				ipAddress,
				userAgent,
			});
		}
		await auth.api.signOut({ headers: reqHeaders });
	} catch {
		// Swallow — the client-side authClient.signOut() also wipes the cookie
		// as a fallback. Audit failures are visible in `auditLog.write` logs.
	}

	return { ok: true };
}
