// @vitest-environment node

// biome-ignore-all lint/style/useNamingConvention: env vars use SCREAMING_SNAKE_CASE by convention

import { beforeEach, describe, expect, it, vi } from "vitest";

describe("resend client", () => {
	beforeEach(() => {
		process.env.SKIP_ENV_VALIDATION = "true";
		process.env.RESEND_API_KEY = "re_test_xxxxx";
	});

	it("exports a resend client instance with an emails.send method", async () => {
		const { resend } = await import("./resend");
		expect(resend).toBeDefined();
		expect(resend.emails).toBeDefined();
		expect(typeof resend.emails.send).toBe("function");
	});

	it("reuses the same instance across imports", async () => {
		const { resend: resend1 } = await import("./resend");
		const { resend: resend2 } = await import("./resend");
		expect(resend1).toBe(resend2);
	});
});

describe("getInternalRecipient", () => {
	beforeEach(() => {
		vi.resetModules();
	});

	it("returns INTERNAL_CONTACT_EMAIL when VERCEL_ENV is production", async () => {
		vi.doMock("./env", () => ({
			env: {
				INTERNAL_CONTACT_EMAIL: "contato@duohubcontabil.com.br",
				VERCEL_ENV: "production",
			},
			RESEND_API_KEY: "re_test_xxxxx",
		}));

		const { getInternalRecipient } = await import("./resend");
		expect(getInternalRecipient()).toBe("contato@duohubcontabil.com.br");
	});

	it("returns the Resend test address when VERCEL_ENV is preview", async () => {
		vi.doMock("./env", () => ({
			env: {
				INTERNAL_CONTACT_EMAIL: "contato@duohubcontabil.com.br",
				VERCEL_ENV: "preview",
			},
			RESEND_API_KEY: "re_test_xxxxx",
		}));

		const { getInternalRecipient } = await import("./resend");
		expect(getInternalRecipient()).toBe("delivered@resend.dev");
	});

	it("returns the Resend test address when VERCEL_ENV is development", async () => {
		vi.doMock("./env", () => ({
			env: {
				INTERNAL_CONTACT_EMAIL: "contato@duohubcontabil.com.br",
				VERCEL_ENV: "development",
			},
			RESEND_API_KEY: "re_test_xxxxx",
		}));

		const { getInternalRecipient } = await import("./resend");
		expect(getInternalRecipient()).toBe("delivered@resend.dev");
	});

	it("returns the Resend test address when VERCEL_ENV is undefined (local dev)", async () => {
		vi.doMock("./env", () => ({
			env: {
				INTERNAL_CONTACT_EMAIL: "contato@duohubcontabil.com.br",
				VERCEL_ENV: undefined,
			},
			RESEND_API_KEY: "re_test_xxxxx",
		}));

		const { getInternalRecipient } = await import("./resend");
		expect(getInternalRecipient()).toBe("delivered@resend.dev");
	});
});
