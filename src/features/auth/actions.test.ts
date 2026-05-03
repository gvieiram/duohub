// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

const signInMagicLinkMock = vi.fn();

vi.mock("@/lib/auth/auth", () => ({
	auth: { api: { signInMagicLink: signInMagicLinkMock } },
}));

vi.mock("next/headers", () => ({
	headers: async () => new Headers(),
}));

const { sendLoginMagicLinkAction } = await import("./actions");

describe("sendLoginMagicLinkAction", () => {
	beforeEach(() => {
		signInMagicLinkMock.mockReset();
		signInMagicLinkMock.mockResolvedValue({});
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
	});

	it("falls back to /admin when next is missing", async () => {
		await sendLoginMagicLinkAction({ email: "user@test.com" });
		const arg = signInMagicLinkMock.mock.calls[0]?.[0];
		expect(arg?.body?.callbackURL).toBe("/admin");
	});
});
