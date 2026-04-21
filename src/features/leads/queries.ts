import "server-only";
import { db } from "@/lib/db";

export async function listLeads({ limit = 50 }: { limit?: number } = {}) {
	return db.lead.findMany({
		take: limit,
		orderBy: { createdAt: "desc" },
	});
}

export async function getLeadById(id: string) {
	return db.lead.findUnique({ where: { id } });
}
