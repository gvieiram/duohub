import "server-only";

import type { AuditAction } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { extractRequestContext } from "./extract-request-context";

export type AuditWriteInput = {
	action: AuditAction;
	actorId?: string | null;
	actorEmail?: string | null;
	resourceType?: string;
	resourceId?: string;
	metadata?: Record<string, unknown>;
	request?: Request;
};

async function write(input: AuditWriteInput): Promise<void> {
	const { ipAddress, userAgent } = extractRequestContext(input.request);

	await db.auditLog.create({
		data: {
			action: input.action,
			actorId: input.actorId ?? null,
			actorEmail: input.actorEmail ?? null,
			resourceType: input.resourceType,
			resourceId: input.resourceId,
			metadata: input.metadata as never,
			ipAddress,
			userAgent,
		},
	});
}

export const auditLog = { write };
