import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
	schema: "prisma/schema.prisma",
	migrations: {
		path: "prisma/migrations",
	},
	datasource: {
		// DIRECT_URL is required by Prisma Migrate (DDL on Neon needs a non-pooled connection).
		// Runtime code uses DATABASE_URL (pooled) via a driver adapter in src/lib/db.ts.
		// Uses process.env (lazy) instead of the `env()` helper (eager) to avoid
		// failing during `prisma generate` in contexts where DIRECT_URL is absent
		// (e.g. GitHub Actions running postinstall before env vars are sourced).
		url: process.env.DIRECT_URL,
	},
});
