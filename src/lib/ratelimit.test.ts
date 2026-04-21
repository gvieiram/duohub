// @vitest-environment node

// biome-ignore-all lint/style/useNamingConvention: env vars use SCREAMING_SNAKE_CASE by convention

import { beforeEach, describe, expect, it } from "vitest";

describe("leadRatelimit", () => {
	beforeEach(() => {
		process.env.SKIP_ENV_VALIDATION = "true";
		process.env.UPSTASH_REDIS_REST_URL = "https://fake.upstash.io";
		process.env.UPSTASH_REDIS_REST_TOKEN = "fake-token";
	});

	it("exports a ratelimit instance with a limit function", async () => {
		const { leadRatelimit } = await import("./ratelimit");
		expect(leadRatelimit).toBeDefined();
		expect(typeof leadRatelimit.limit).toBe("function");
	});

	it("reuses the same instance across imports (singleton)", async () => {
		const { leadRatelimit: first } = await import("./ratelimit");
		const { leadRatelimit: second } = await import("./ratelimit");
		expect(first).toBe(second);
	});
});
