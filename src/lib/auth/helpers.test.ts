// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

const getSessionMock = vi.fn();
const findUniqueMock = vi.fn();
const redirectMock = vi.fn((_url: string) => {
	throw new Error("REDIRECT");
});

vi.mock("@/lib/auth/auth", () => ({
	auth: { api: { getSession: getSessionMock } },
}));

vi.mock("@/lib/db", () => ({
	db: { user: { findUnique: findUniqueMock } },
}));

vi.mock("next/headers", () => ({
	headers: async () => new Headers(),
}));

vi.mock("next/navigation", () => ({
	redirect: (url: string) => redirectMock(url),
}));

const { requireAdmin } = await import("./helpers");

describe("requireAdmin", () => {
	beforeEach(() => {
		getSessionMock.mockReset();
		findUniqueMock.mockReset();
		redirectMock.mockClear();
	});

	it("redirects to /admin/login when no session", async () => {
		getSessionMock.mockResolvedValueOnce(null);
		await expect(requireAdmin()).rejects.toThrow("REDIRECT");
		expect(redirectMock).toHaveBeenCalledWith("/admin/login");
	});

	it("redirects when session exists but user lookup is null (orphan session)", async () => {
		getSessionMock.mockResolvedValueOnce({
			user: { id: "u1", email: "a@b.com" },
			session: { id: "s1" },
		});
		findUniqueMock.mockResolvedValueOnce(null);
		await expect(requireAdmin()).rejects.toThrow("REDIRECT");
		expect(redirectMock).toHaveBeenCalledWith(
			"/admin/login?error=session_invalidated",
		);
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
			"/admin/login?error=session_invalidated",
		);
	});

	it("redirects with forbidden when role is not ADMIN", async () => {
		getSessionMock.mockResolvedValueOnce({
			user: { id: "u1", email: "a@b.com" },
			session: { id: "s1" },
		});
		findUniqueMock.mockResolvedValueOnce({ role: "CLIENT", revokedAt: null });
		await expect(requireAdmin()).rejects.toThrow("REDIRECT");
		expect(redirectMock).toHaveBeenCalledWith("/admin/login?error=forbidden");
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
	});
});
