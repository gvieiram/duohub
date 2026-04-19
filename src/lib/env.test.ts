// @vitest-environment node

// biome-ignore-all lint/style/useNamingConvention: env vars use SCREAMING_SNAKE_CASE by convention

import { describe, expect, it, vi } from "vitest";

describe("env", () => {
	it("throws when required server variable is missing", async () => {
		vi.resetModules();
		const original = process.env;
		process.env = {
			...original,
			DATABASE_URL: "",
			DIRECT_URL: "",
			RESEND_API_KEY: "",
			INTERNAL_LEADS_EMAIL: "",
			UPSTASH_REDIS_REST_URL: "",
			UPSTASH_REDIS_REST_TOKEN: "",
			NEXT_PUBLIC_SITE_URL: "",
			SKIP_ENV_VALIDATION: undefined,
		};

		await expect(async () => {
			await import("./env");
		}).rejects.toThrow();

		process.env = original;
	});

	it("loads when all required variables are present", async () => {
		vi.resetModules();
		const original = process.env;
		process.env = {
			...original,
			DATABASE_URL: "postgresql://u:p@h/d?sslmode=require",
			DIRECT_URL: "postgresql://u:p@h/d?sslmode=require",
			RESEND_API_KEY: "re_test_key",
			INTERNAL_LEADS_EMAIL: "lead@example.com",
			UPSTASH_REDIS_REST_URL: "https://example.upstash.io",
			UPSTASH_REDIS_REST_TOKEN: "token",
			NEXT_PUBLIC_SITE_URL: "https://example.com",
			SKIP_ENV_VALIDATION: undefined,
		};

		const mod = await import("./env");
		expect(mod.env.RESEND_API_KEY).toBe("re_test_key");
		expect(mod.env.NEXT_PUBLIC_SITE_URL).toBe("https://example.com");

		process.env = original;
	});
});
