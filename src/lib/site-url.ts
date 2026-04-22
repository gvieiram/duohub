/**
 * Resolves the canonical site URL used for SEO artefacts (JSON-LD, etc.) and
 * email templates.
 *
 * Reads `process.env` directly so it can run in contexts that do not go
 * through `@/lib/env` validation — notably the `react-email` preview binary,
 * which bundles templates in isolation and does not load server env schemas.
 *
 * Resolution order:
 * 1. `NEXT_PUBLIC_SITE_URL` — explicit override set in production.
 * 2. `VERCEL_URL` — current deploy URL, so preview deploys point at
 *    themselves (useful for JSON-LD debugging and preview email assets).
 * 3. `VERCEL_PROJECT_PRODUCTION_URL` — canonical production URL, used as a
 *    safety net when the deploy URL is missing.
 * 4. `http://localhost:3000` — local development fallback.
 */
export function getSiteUrl(): string {
	const override = process.env.NEXT_PUBLIC_SITE_URL;
	if (override) {
		return stripTrailingSlash(override);
	}

	const vercelUrl = process.env.VERCEL_URL;
	if (vercelUrl) {
		return `https://${vercelUrl}`;
	}

	const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
	if (productionUrl) {
		return `https://${productionUrl}`;
	}

	return "http://localhost:3000";
}

function stripTrailingSlash(url: string): string {
	return url.endsWith("/") ? url.slice(0, -1) : url;
}
