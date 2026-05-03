import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";

export async function getCurrentUser() {
	const session = await auth.api.getSession({ headers: await headers() });
	return session?.user ?? null;
}

export async function getSession() {
	return auth.api.getSession({ headers: await headers() });
}

/**
 * Guard for admin-only Server Components.
 *
 * Wrapped in `React.cache` so the layout, page, and any nested Server
 * Component can call `requireAdmin()` without paying multiple
 * `db.user.findUnique` round-trips per request — React deduplicates the
 * call within the same render tree.
 */
export const requireAdmin = cache(async () => {
	const session = await auth.api.getSession({ headers: await headers() });

	if (!session) {
		redirect("/admin/login");
	}

	const user = await db.user.findUnique({
		where: { id: session.user.id },
		select: { role: true, revokedAt: true },
	});

	if (!user || user.revokedAt) {
		redirect("/admin/login?error=session_invalidated");
	}

	if (user.role !== "ADMIN") {
		redirect("/admin/login?error=forbidden");
	}

	return session;
});
