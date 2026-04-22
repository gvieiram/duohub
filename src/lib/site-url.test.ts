// @vitest-environment node

// biome-ignore-all lint/style/useNamingConvention: env vars use SCREAMING_SNAKE_CASE by convention

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const baseServerEnv = {
	DATABASE_URL: "postgresql://u:p@h/d?sslmode=require",
	DIRECT_URL: "postgresql://u:p@h/d?sslmode=require",
	RESEND_API_KEY: "re_test_key",
	INTERNAL_CONTACT_EMAIL: "contato@example.com",
	UPSTASH_REDIS_REST_URL: "https://example.upstash.io",
	UPSTASH_REDIS_REST_TOKEN: "token",
	SKIP_ENV_VALIDATION: undefined as string | undefined,
};

describe("getSiteUrl", () => {
	const originalEnv = process.env;

	beforeEach(() => {
		vi.resetModules();
	});

	afterEach(() => {
		process.env = originalEnv;
	});

	it("prefers NEXT_PUBLIC_SITE_URL when defined", async () => {
		process.env = {
			...originalEnv,
			...baseServerEnv,
			NEXT_PUBLIC_SITE_URL: "https://duohubcontabil.com.br",
			VERCEL_PROJECT_PRODUCTION_URL: "fallback.example.com",
			VERCEL_URL: "preview.example.com",
		};

		const { getSiteUrl } = await import("./site-url");
		expect(getSiteUrl()).toBe("https://duohubcontabil.com.br");
	});

	it("strips trailing slash from NEXT_PUBLIC_SITE_URL", async () => {
		process.env = {
			...originalEnv,
			...baseServerEnv,
			NEXT_PUBLIC_SITE_URL: "https://duohubcontabil.com.br/",
		};

		const { getSiteUrl } = await import("./site-url");
		expect(getSiteUrl()).toBe("https://duohubcontabil.com.br");
	});

	it("prefers VERCEL_URL over VERCEL_PROJECT_PRODUCTION_URL when override is missing", async () => {
		process.env = {
			...originalEnv,
			...baseServerEnv,
			NEXT_PUBLIC_SITE_URL: undefined,
			VERCEL_PROJECT_PRODUCTION_URL: "duohubcontabil.com.br",
			VERCEL_URL: "duohub-git-feat-xyz.vercel.app",
		};

		const { getSiteUrl } = await import("./site-url");
		expect(getSiteUrl()).toBe("https://duohub-git-feat-xyz.vercel.app");
	});

	it("falls back to VERCEL_PROJECT_PRODUCTION_URL when VERCEL_URL is missing", async () => {
		process.env = {
			...originalEnv,
			...baseServerEnv,
			NEXT_PUBLIC_SITE_URL: undefined,
			VERCEL_PROJECT_PRODUCTION_URL: "duohubcontabil.com.br",
			VERCEL_URL: undefined,
		};

		const { getSiteUrl } = await import("./site-url");
		expect(getSiteUrl()).toBe("https://duohubcontabil.com.br");
	});

	it("falls back to localhost when no Vercel env is available", async () => {
		process.env = {
			...originalEnv,
			...baseServerEnv,
			NEXT_PUBLIC_SITE_URL: undefined,
			VERCEL_PROJECT_PRODUCTION_URL: undefined,
			VERCEL_URL: undefined,
		};

		const { getSiteUrl } = await import("./site-url");
		expect(getSiteUrl()).toBe("http://localhost:3000");
	});
});
