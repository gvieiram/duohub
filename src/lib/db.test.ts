// @vitest-environment node

// biome-ignore-all lint/style/useNamingConvention: env vars use SCREAMING_SNAKE_CASE by convention

import { beforeEach, describe, expect, it } from "vitest";

describe("db client", () => {
	beforeEach(() => {
		process.env.SKIP_ENV_VALIDATION = "true";
		process.env.DATABASE_URL = "postgresql://u:p@neon.test/db?sslmode=require";
	});

	it("exports a prisma client instance", async () => {
		const { db } = await import("./db");
		expect(db).toBeDefined();
		expect(typeof db.$connect).toBe("function");
	});

	it("reuses the same instance to prevent exhausting connections", async () => {
		const { db: db1 } = await import("./db");
		const { db: db2 } = await import("./db");
		expect(db1).toBe(db2);
	});
});
