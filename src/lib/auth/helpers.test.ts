// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

const getSessionMock = vi.fn();
const signOutMock = vi.fn();
const findUniqueMock = vi.fn();
const auditWriteMock = vi.fn();
const redirectMock = vi.fn((_url: string) => {
	throw new Error("REDIRECT");
});
let mockHeaders = new Headers();

vi.mock("@/lib/auth/auth", () => ({
	auth: {
		api: { getSession: getSessionMock, signOut: signOutMock },
	},
}));

vi.mock("@/lib/audit/log", () => ({
	auditLog: { write: auditWriteMock },
}));

vi.mock("@/lib/db", () => ({
	db: { user: { findUnique: findUniqueMock } },
}));

vi.mock("next/headers", () => ({
	headers: async () => mockHeaders,
}));

vi.mock("next/navigation", () => ({
	redirect: (url: string) => redirectMock(url),
}));

const { defaultDestinationForRole, requireAdmin } = await import("./helpers");

describe("defaultDestinationForRole", () => {
	it("maps ADMIN to /admin", () => {
		expect(defaultDestinationForRole("ADMIN")).toBe("/admin");
	});

	it("maps CLIENT to /app", () => {
		expect(defaultDestinationForRole("CLIENT")).toBe("/app");
	});
});

describe("requireAdmin", () => {
	beforeEach(() => {
		getSessionMock.mockReset();
		signOutMock.mockReset();
		signOutMock.mockResolvedValue(undefined);
		findUniqueMock.mockReset();
		auditWriteMock.mockReset();
		auditWriteMock.mockResolvedValue(undefined);
		redirectMock.mockClear();
		mockHeaders = new Headers();
	});

	it("redirects to /login when no session", async () => {
		getSessionMock.mockResolvedValueOnce(null);
		await expect(requireAdmin()).rejects.toThrow("REDIRECT");
		expect(redirectMock).toHaveBeenCalledWith("/login");
		expect(auditWriteMock).not.toHaveBeenCalled();
		expect(signOutMock).not.toHaveBeenCalled();
	});

	it("redirects when session exists but user lookup is null (orphan session)", async () => {
		getSessionMock.mockResolvedValueOnce({
			user: { id: "u1", email: "a@b.com" },
			session: { id: "s1" },
		});
		findUniqueMock.mockResolvedValueOnce(null);
		await expect(requireAdmin()).rejects.toThrow("REDIRECT");
		expect(redirectMock).toHaveBeenCalledWith(
			"/login?error=session_invalidated",
		);
		expect(auditWriteMock).not.toHaveBeenCalled();
	});

	it("redirects with session_invalidated when user is revoked", async () => {
		getSessionMock.mockResolvedValueOnce({
			user: { id: "u1", email: "a@b.com" },
			session: { id: "s1" },
		});
		findUniqueMock.mockResolvedValueOnce({
			role: "ADMIN",
			revokedAt: new Date(),
		});
		await expect(requireAdmin()).rejects.toThrow("REDIRECT");
		expect(redirectMock).toHaveBeenCalledWith(
			"/login?error=session_invalidated",
		);
		expect(auditWriteMock).not.toHaveBeenCalled();
	});

	it("audits, signs out and redirects forbidden when role is not ADMIN", async () => {
		mockHeaders = new Headers({
			"x-forwarded-for": "203.0.113.42, 10.0.0.1",
			"user-agent": "Mozilla/5.0 (Test)",
		});
		getSessionMock.mockResolvedValueOnce({
			user: { id: "u1", email: "client@duohub.com" },
			session: { id: "s1" },
		});
		findUniqueMock.mockResolvedValueOnce({ role: "CLIENT", revokedAt: null });

		await expect(requireAdmin()).rejects.toThrow("REDIRECT");

		expect(auditWriteMock).toHaveBeenCalledWith({
			action: "USER_ACCESS_DENIED",
			actorId: "u1",
			actorEmail: "client@duohub.com",
			metadata: { area: "admin", role: "CLIENT" },
			ipAddress: "203.0.113.42",
			userAgent: "Mozilla/5.0 (Test)",
		});
		expect(signOutMock).toHaveBeenCalledTimes(1);
		expect(redirectMock).toHaveBeenCalledWith("/login?error=forbidden");
	});

	it("redirects forbidden even when signOut throws (best-effort cleanup)", async () => {
		getSessionMock.mockResolvedValueOnce({
			user: { id: "u1", email: "client@duohub.com" },
			session: { id: "s1" },
		});
		findUniqueMock.mockResolvedValueOnce({ role: "CLIENT", revokedAt: null });
		signOutMock.mockRejectedValueOnce(new Error("transient"));

		await expect(requireAdmin()).rejects.toThrow("REDIRECT");

		expect(auditWriteMock).toHaveBeenCalledTimes(1);
		expect(redirectMock).toHaveBeenCalledWith("/login?error=forbidden");
	});

	it("returns the session when user is active admin", async () => {
		const session = {
			user: { id: "u1", email: "a@b.com", name: "Admin" },
			session: { id: "s1" },
		};
		getSessionMock.mockResolvedValueOnce(session);
		findUniqueMock.mockResolvedValueOnce({ role: "ADMIN", revokedAt: null });
		const result = await requireAdmin();
		expect(result).toEqual(session);
		expect(redirectMock).not.toHaveBeenCalled();
		expect(auditWriteMock).not.toHaveBeenCalled();
		expect(signOutMock).not.toHaveBeenCalled();
	});
});
