import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
	schema: "prisma/schema.prisma",
	migrations: {
		path: "prisma/migrations",
	},
	datasource: {
		// DIRECT_URL is required by Prisma Migrate (DDL on Neon needs a non-pooled connection).
		// Runtime code uses DATABASE_URL (pooled) via a driver adapter in src/lib/db.ts.
		url: env("DIRECT_URL"),
	},
});
