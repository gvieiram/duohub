import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { auditLog } from "@/lib/audit/log";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";

export { defaultDestinationForRole } from "./role-destination";

export async function getCurrentUser() {
	const session = await auth.api.getSession({ headers: await headers() });
	return session?.user ?? null;
}

export async function getSession() {
	return auth.api.getSession({ headers: await headers() });
}

function extractClientContext(reqHeaders: Headers) {
	const ipAddress =
		reqHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ??
		reqHeaders.get("x-real-ip")?.trim() ??
		null;
	const userAgent = reqHeaders.get("user-agent")?.trim() ?? null;
	return { ipAddress, userAgent };
}

/**
 * Guard for admin-only Server Components.
 *
 * Wrapped in `React.cache` so the layout, page, and any nested Server
 * Component can call `requireAdmin()` without paying multiple
 * `db.user.findUnique` round-trips per request — React deduplicates the
 * call within the same render tree.
 *
 * On a role mismatch (CLIENT user reaching `/admin`) this guard is a
 * second line of defence — `/post-login` should already have routed CLIENT
 * to `/app`. Reaching here means the client bypassed the trampoline (URL
 * manipulation, stale tab, cookie passed across roles). We:
 *
 *   1. Write a `USER_ACCESS_DENIED` audit row for incident review.
 *   2. Invalidate the session (Better Auth `signOut`) so the stale cookie
 *      can't drive subsequent requests. Best-effort — if signOut throws,
 *      the redirect still happens.
 *   3. Redirect to `/login?error=forbidden`.
 *
 * Audit + signOut run only on the role-mismatch branch — happy-path admins
 * pay zero overhead.
 */
export const requireAdmin = cache(async () => {
	const reqHeaders = await headers();
	const session = await auth.api.getSession({ headers: reqHeaders });

	if (!session) {
		redirect("/login");
	}

	const user = await db.user.findUnique({
		where: { id: session.user.id },
		select: { role: true, revokedAt: true },
	});

	if (!user || user.revokedAt) {
		redirect("/login?error=session_invalidated");
	}

	if (user.role !== "ADMIN") {
		const { ipAddress, userAgent } = extractClientContext(reqHeaders);

		await auditLog.write({
			action: "USER_ACCESS_DENIED",
			actorId: session.user.id,
			actorEmail: session.user.email,
			metadata: { area: "admin", role: user.role },
			ipAddress,
			userAgent,
		});

		try {
			await auth.api.signOut({ headers: reqHeaders });
		} catch {
			// Swallow — the redirect below still happens. The stale cookie is
			// best-effort cleanup; even if it survives, every protected layout
			// re-runs this guard on the next request.
		}

		redirect("/login?error=forbidden");
	}

	return session;
});
