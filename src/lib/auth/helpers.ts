import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";

export async function getCurrentUser() {
	const session = await auth.api.getSession({ headers: await headers() });
	return session?.user ?? null;
}

export async function getSession() {
	return auth.api.getSession({ headers: await headers() });
}

export async function requireAdmin() {
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
}
