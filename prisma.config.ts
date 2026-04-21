import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

// Next.js uses .env.local for secrets; loaded here for Prisma CLI (migrate/pull).
loadEnv({ path: ".env.local", override: true });

export default defineConfig({
	schema: "prisma/schema.prisma",
	migrations: {
		path: "prisma/migrations",
	},
	datasource: {
		// DIRECT_URL is required by Prisma Migrate (DDL on Neon needs a non-pooled connection).
		// Runtime code uses DATABASE_URL (pooled) via a driver adapter in src/lib/db.ts.
		url: process.env.DIRECT_URL,
	},
});
