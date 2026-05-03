// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

const signInMagicLinkMock = vi.fn();
let mockHeaders = new Headers();

vi.mock("@/lib/auth/auth", () => ({
	auth: { api: { signInMagicLink: signInMagicLinkMock } },
}));

vi.mock("next/headers", () => ({
	headers: async () => mockHeaders,
}));

const { sendLoginMagicLinkAction } = await import("./actions");

describe("sendLoginMagicLinkAction", () => {
	beforeEach(() => {
		signInMagicLinkMock.mockReset();
		signInMagicLinkMock.mockResolvedValue({});
		mockHeaders = new Headers();
	});

	it("returns ok:true with uniform shape on valid input", async () => {
		const r = await sendLoginMagicLinkAction({
			email: "user@test.com",
			next: "/admin",
		});
		expect(r).toEqual({ ok: true });
	});

	it("returns ok:true even when email is invalid (uniform response)", async () => {
		const r = await sendLoginMagicLinkAction({
			email: "not-an-email",
		});
		expect(r).toEqual({ ok: true });
		expect(signInMagicLinkMock).not.toHaveBeenCalled();
	});

	it("returns ok:true even when better-auth throws (uniform response)", async () => {
		signInMagicLinkMock.mockRejectedValueOnce(new Error("transient"));
		const r = await sendLoginMagicLinkAction({ email: "user@test.com" });
		expect(r).toEqual({ ok: true });
	});

	it("forwards next callback to better-auth", async () => {
		await sendLoginMagicLinkAction({
			email: "user@test.com",
			next: "/admin/clients",
		});
		const arg = signInMagicLinkMock.mock.calls[0]?.[0];
		expect(arg?.body?.callbackURL).toBe("/admin/clients");
		expect(arg?.body?.errorCallbackURL).toBe("/admin/login");
	});

	it("falls back to /admin when next is missing", async () => {
		await sendLoginMagicLinkAction({ email: "user@test.com" });
		const arg = signInMagicLinkMock.mock.calls[0]?.[0];
		expect(arg?.body?.callbackURL).toBe("/admin");
	});

	it("sends users back to /admin/login on verification errors", async () => {
		await sendLoginMagicLinkAction({ email: "user@test.com" });
		const arg = signInMagicLinkMock.mock.calls[0]?.[0];
		expect(arg?.body?.errorCallbackURL).toBe("/admin/login");
	});

	it("forwards client IP and User-Agent via body.metadata", async () => {
		mockHeaders = new Headers({
			"x-forwarded-for": "203.0.113.42, 10.0.0.1",
			"user-agent": "Mozilla/5.0 (Test)",
		});
		await sendLoginMagicLinkAction({ email: "user@test.com" });
		const arg = signInMagicLinkMock.mock.calls[0]?.[0];
		expect(arg?.body?.metadata).toEqual({
			ipAddress: "203.0.113.42",
			userAgent: "Mozilla/5.0 (Test)",
		});
	});

	it("falls back to x-real-ip when x-forwarded-for is absent", async () => {
		mockHeaders = new Headers({ "x-real-ip": "198.51.100.7" });
		await sendLoginMagicLinkAction({ email: "user@test.com" });
		const arg = signInMagicLinkMock.mock.calls[0]?.[0];
		expect(arg?.body?.metadata?.ipAddress).toBe("198.51.100.7");
	});

	it("sends metadata with null IP/UA when no headers present", async () => {
		await sendLoginMagicLinkAction({ email: "user@test.com" });
		const arg = signInMagicLinkMock.mock.calls[0]?.[0];
		expect(arg?.body?.metadata).toEqual({
			ipAddress: null,
			userAgent: null,
		});
	});
});
