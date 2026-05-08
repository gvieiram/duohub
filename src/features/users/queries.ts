import "server-only";

import { db } from "@/lib/db";
import type { UserListItem } from "./types";

export async function listUsers(): Promise<UserListItem[]> {
	const users = await db.user.findMany({
		where: { role: "ADMIN" },
		select: {
			id: true,
			email: true,
			name: true,
			createdAt: true,
			revokedAt: true,
			sessions: {
				select: { createdAt: true },
				orderBy: { createdAt: "desc" },
				take: 1,
			},
		},
		orderBy: [
			{ revokedAt: { sort: "asc", nulls: "first" } },
			{ createdAt: "desc" },
		],
	});

	return users.map((u) => ({
		id: u.id,
		email: u.email,
		name: u.name,
		createdAt: u.createdAt,
		revokedAt: u.revokedAt,
		lastAccessAt: u.sessions[0]?.createdAt ?? null,
	}));
}
