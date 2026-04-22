import "server-only";
import { db } from "@/lib/db";

export async function listContacts({ limit = 50 }: { limit?: number } = {}) {
	return db.contact.findMany({
		take: limit,
		orderBy: { createdAt: "desc" },
	});
}

export async function getContactById(id: string) {
	return db.contact.findUnique({ where: { id } });
}
