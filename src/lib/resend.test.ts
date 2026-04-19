// @vitest-environment node

// biome-ignore-all lint/style/useNamingConvention: env vars use SCREAMING_SNAKE_CASE by convention

import { beforeEach, describe, expect, it } from "vitest";

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
