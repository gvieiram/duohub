// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

const requireAdminMock = vi.fn();
const signInMagicLinkMock = vi.fn();
const auditWriteMock = vi.fn();
const findUniqueMock = vi.fn();
const createMock = vi.fn();
const updateMock = vi.fn();
const deleteManyMock = vi.fn();
const transactionMock = vi.fn();
const revalidatePathMock = vi.fn();
let mockHeaders = new Headers();

vi.mock("@/lib/auth/helpers", () => ({
	requireAdmin: requireAdminMock,
}));

vi.mock("@/lib/auth/auth", () => ({
	auth: {
		api: {
			signInMagicLink: signInMagicLinkMock,
		},
	},
}));

vi.mock("@/lib/audit/log", () => ({
	auditLog: { write: auditWriteMock },
}));

vi.mock("@/lib/db", () => ({
	db: {
		user: {
			findUnique: findUniqueMock,
			create: createMock,
			update: updateMock,
		},
		session: {
			deleteMany: deleteManyMock,
		},
		$transaction: transactionMock,
	},
}));

vi.mock("next/cache", () => ({
	revalidatePath: revalidatePathMock,
}));

vi.mock("next/headers", () => ({
	headers: async () => mockHeaders,
}));

const { inviteUserAction, revokeUserAction } = await import("./actions");

const SESSION = { user: { id: "admin_1", email: "admin@x.com" } };

describe("inviteUserAction", () => {
	beforeEach(() => {
		requireAdminMock.mockReset();
		requireAdminMock.mockResolvedValue(SESSION);
		signInMagicLinkMock.mockReset();
		signInMagicLinkMock.mockResolvedValue({});
		auditWriteMock.mockReset();
		auditWriteMock.mockResolvedValue(undefined);
		findUniqueMock.mockReset();
		findUniqueMock.mockResolvedValue(null);
		createMock.mockReset();
		createMock.mockResolvedValue({
			id: "user_new",
			email: "newadmin@x.com",
		});
		revalidatePathMock.mockReset();
		mockHeaders = new Headers();
	});

	it("happy path: creates user, audits, sends magic link, returns { success: true }", async () => {
		const r = await inviteUserAction({
			email: "newadmin@x.com",
			name: "New Admin",
		});

		expect(r).toEqual({ success: true });
		expect(createMock).toHaveBeenCalledWith({
			data: {
				email: "newadmin@x.com",
				name: "New Admin",
				emailVerified: true,
				role: "ADMIN",
			},
		});
		expect(auditWriteMock).toHaveBeenCalledOnce();
		expect(auditWriteMock).toHaveBeenCalledWith(
			expect.objectContaining({
				action: "USER_INVITED",
				actorId: "admin_1",
				actorEmail: "admin@x.com",
				resourceType: "User",
				resourceId: "user_new",
				metadata: { email: "newadmin@x.com" },
			}),
		);
		expect(signInMagicLinkMock).toHaveBeenCalledWith({
			body: { email: "newadmin@x.com", callbackURL: "/post-login" },
			headers: expect.any(Headers),
		});
		expect(revalidatePathMock).toHaveBeenCalledWith("/admin/users");
	});

	it("happy path: passes ipAddress and userAgent to auditLog.write", async () => {
		mockHeaders = new Headers({
			"x-forwarded-for": "203.0.113.42, 10.0.0.1",
			"user-agent": "Mozilla/5.0 (Test)",
		});
		createMock.mockResolvedValue({
			id: "user_new",
			email: "newadmin@x.com",
		});

		await inviteUserAction({ email: "newadmin@x.com" });

		expect(auditWriteMock).toHaveBeenCalledWith(
			expect.objectContaining({
				ipAddress: "203.0.113.42",
				userAgent: "Mozilla/5.0 (Test)",
			}),
		);
	});

	it("invalid input: returns { success: false } without calling create/audit/magic-link", async () => {
		const r = await inviteUserAction({ email: "" });

		expect(r).toEqual({ success: false, error: "Dados inválidos." });
		expect(createMock).not.toHaveBeenCalled();
		expect(auditWriteMock).not.toHaveBeenCalled();
		expect(signInMagicLinkMock).not.toHaveBeenCalled();
	});

	it("invalid input: missing email field returns { success: false }", async () => {
		const r = await inviteUserAction({});

		expect(r).toEqual({ success: false, error: "Dados inválidos." });
	});

	it("duplicate email: returns error without calling create/audit/magic-link", async () => {
		findUniqueMock.mockResolvedValue({
			id: "existing_user",
			email: "existing@x.com",
		});

		const r = await inviteUserAction({ email: "existing@x.com" });

		expect(r).toEqual({
			success: false,
			error: "Já existe um administrador com este e-mail.",
		});
		expect(createMock).not.toHaveBeenCalled();
		expect(auditWriteMock).not.toHaveBeenCalled();
		expect(signInMagicLinkMock).not.toHaveBeenCalled();
	});

	it("magic link failure: still returns { success: true } and logs error", async () => {
		createMock.mockResolvedValue({
			id: "user_new",
			email: "newadmin@x.com",
		});
		signInMagicLinkMock.mockRejectedValueOnce(new Error("SMTP down"));
		const consoleSpy = vi
			.spyOn(console, "error")
			.mockImplementation(() => undefined);

		const r = await inviteUserAction({ email: "newadmin@x.com" });

		expect(r).toEqual({ success: true });
		expect(auditWriteMock).toHaveBeenCalledOnce();
		expect(consoleSpy).toHaveBeenCalled();

		consoleSpy.mockRestore();
	});

	it("magic link failure: revalidatePath still called", async () => {
		createMock.mockResolvedValue({
			id: "user_new",
			email: "newadmin@x.com",
		});
		signInMagicLinkMock.mockRejectedValueOnce(new Error("SMTP down"));
		const consoleSpy = vi
			.spyOn(console, "error")
			.mockImplementation(() => undefined);

		await inviteUserAction({ email: "newadmin@x.com" });

		expect(revalidatePathMock).toHaveBeenCalledWith("/admin/users");
		consoleSpy.mockRestore();
	});
});

describe("revokeUserAction", () => {
	beforeEach(() => {
		requireAdminMock.mockReset();
		requireAdminMock.mockResolvedValue(SESSION);
		auditWriteMock.mockReset();
		auditWriteMock.mockResolvedValue(undefined);
		findUniqueMock.mockReset();
		findUniqueMock.mockResolvedValue({ email: "target@x.com" });
		transactionMock.mockReset();
		transactionMock.mockResolvedValue([{}, {}]);
		revalidatePathMock.mockReset();
		mockHeaders = new Headers();
	});

	it("happy path: runs transaction, audits with target email, returns { success: true }", async () => {
		const r = await revokeUserAction({ userId: "user_target" });

		expect(r).toEqual({ success: true });
		expect(transactionMock).toHaveBeenCalledOnce();
		expect(auditWriteMock).toHaveBeenCalledOnce();
		expect(auditWriteMock).toHaveBeenCalledWith(
			expect.objectContaining({
				action: "USER_REVOKED",
				actorId: "admin_1",
				actorEmail: "admin@x.com",
				resourceType: "User",
				resourceId: "user_target",
				metadata: { email: "target@x.com" },
			}),
		);
		expect(revalidatePathMock).toHaveBeenCalledWith("/admin/users");
	});

	it("happy path: passes ipAddress and userAgent to auditLog.write", async () => {
		mockHeaders = new Headers({
			"x-real-ip": "198.51.100.7",
			"user-agent": "Mozilla/5.0 (Admin)",
		});

		await revokeUserAction({ userId: "user_target" });

		expect(auditWriteMock).toHaveBeenCalledWith(
			expect.objectContaining({
				ipAddress: "198.51.100.7",
				userAgent: "Mozilla/5.0 (Admin)",
			}),
		);
	});

	it("self-revoke: returns error without calling transaction", async () => {
		const r = await revokeUserAction({ userId: "admin_1" });

		expect(r).toEqual({
			success: false,
			error: "Você não pode revogar seu próprio acesso.",
		});
		expect(transactionMock).not.toHaveBeenCalled();
		expect(auditWriteMock).not.toHaveBeenCalled();
	});

	it("invalid input: empty userId returns { success: false }", async () => {
		const r = await revokeUserAction({ userId: "" });

		expect(r).toEqual({ success: false, error: "Dados inválidos." });
		expect(transactionMock).not.toHaveBeenCalled();
		expect(auditWriteMock).not.toHaveBeenCalled();
	});

	it("invalid input: missing userId field returns { success: false }", async () => {
		const r = await revokeUserAction({} as { userId: string });

		expect(r).toEqual({ success: false, error: "Dados inválidos." });
	});

	it("target lookup returns null: still revokes and audits with null email", async () => {
		findUniqueMock.mockResolvedValue(null);

		const r = await revokeUserAction({ userId: "user_target" });

		expect(r).toEqual({ success: true });
		expect(transactionMock).toHaveBeenCalledOnce();
		expect(auditWriteMock).toHaveBeenCalledWith(
			expect.objectContaining({
				metadata: { email: null },
			}),
		);
	});

	it("propagates db.$transaction rejection without writing audit or revalidating", async () => {
		findUniqueMock.mockResolvedValue({ email: "target@x.com" });
		transactionMock.mockRejectedValueOnce(new Error("FK violation"));

		await expect(revokeUserAction({ userId: "user_2" })).rejects.toThrow(
			"FK violation",
		);

		expect(auditWriteMock).not.toHaveBeenCalled();
		expect(revalidatePathMock).not.toHaveBeenCalled();
	});
});
