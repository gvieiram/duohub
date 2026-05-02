// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

const auditLogCreateMock = vi.fn();

vi.mock("@/lib/db", () => ({
	db: { auditLog: { create: auditLogCreateMock } },
}));

const { auditLog } = await import("./log");

describe("auditLog.write — happy path", () => {
	beforeEach(() => {
		auditLogCreateMock.mockReset();
		auditLogCreateMock.mockResolvedValue({ id: "log_1" });
	});

	it("writes an entry with the provided fields", async () => {
		await auditLog.write({
			action: "USER_LOGIN_SUCCESS",
			actorId: "user_1",
			actorEmail: "admin@duohubcontabil.com.br",
		});

		expect(auditLogCreateMock).toHaveBeenCalledWith({
			data: {
				action: "USER_LOGIN_SUCCESS",
				actorId: "user_1",
				actorEmail: "admin@duohubcontabil.com.br",
				resourceType: undefined,
				resourceId: undefined,
				metadata: undefined,
				ipAddress: null,
				userAgent: null,
			},
		});
	});

	it("forwards resource fields when given", async () => {
		await auditLog.write({
			action: "CLIENT_CREATED",
			actorId: "user_1",
			actorEmail: "admin@duohubcontabil.com.br",
			resourceType: "Client",
			resourceId: "client_42",
			metadata: { legalName: "ACME LTDA" },
		});

		const call = auditLogCreateMock.mock.calls[0]?.[0];
		expect(call?.data.resourceType).toBe("Client");
		expect(call?.data.resourceId).toBe("client_42");
		expect(call?.data.metadata).toEqual({ legalName: "ACME LTDA" });
	});
});
