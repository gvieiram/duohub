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
			INTERNAL_CONTACT_EMAIL: "",
			UPSTASH_REDIS_REST_URL: "",
			UPSTASH_REDIS_REST_TOKEN: "",
			NEXT_PUBLIC_SITE_URL: "",
			NEXT_PUBLIC_POSTHOG_TOKEN: "",
			NEXT_PUBLIC_POSTHOG_HOST: "",
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
			INTERNAL_CONTACT_EMAIL: "contato@example.com",
			UPSTASH_REDIS_REST_URL: "https://example.upstash.io",
			UPSTASH_REDIS_REST_TOKEN: "token",
			NEXT_PUBLIC_SITE_URL: "https://example.com",
			NEXT_PUBLIC_POSTHOG_TOKEN: "phc_test_key",
			NEXT_PUBLIC_POSTHOG_HOST: "https://us.i.posthog.com",
			SKIP_ENV_VALIDATION: undefined,
		};

		const mod = await import("./env");
		expect(mod.env.RESEND_API_KEY).toBe("re_test_key");
		expect(mod.env.NEXT_PUBLIC_SITE_URL).toBe("https://example.com");
		expect(mod.env.NEXT_PUBLIC_POSTHOG_TOKEN).toBe("phc_test_key");

		process.env = original;
	});

	it("loads when optional client variables are not set", async () => {
		vi.resetModules();
		const original = process.env;
		process.env = {
			...original,
			DATABASE_URL: "postgresql://u:p@h/d?sslmode=require",
			DIRECT_URL: "postgresql://u:p@h/d?sslmode=require",
			RESEND_API_KEY: "re_test_key",
			INTERNAL_CONTACT_EMAIL: "contato@example.com",
			UPSTASH_REDIS_REST_URL: "https://example.upstash.io",
			UPSTASH_REDIS_REST_TOKEN: "token",
			NEXT_PUBLIC_SITE_URL: undefined,
			NEXT_PUBLIC_POSTHOG_TOKEN: undefined,
			NEXT_PUBLIC_POSTHOG_HOST: undefined,
			SKIP_ENV_VALIDATION: undefined,
		};

		const mod = await import("./env");
		expect(mod.env.NEXT_PUBLIC_SITE_URL).toBeUndefined();
		expect(mod.env.NEXT_PUBLIC_POSTHOG_TOKEN).toBeUndefined();

		process.env = original;
	});
});
