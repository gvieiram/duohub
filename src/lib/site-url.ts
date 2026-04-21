import { env } from "./env";

/**
 * Resolves the canonical site URL used for SEO artefacts (JSON-LD, sitemap,
 * OpenGraph absolute URLs, etc.).
 *
 * Resolution order:
 * 1. `NEXT_PUBLIC_SITE_URL` — explicit override (production or custom staging).
 * 2. `VERCEL_PROJECT_PRODUCTION_URL` — canonical production URL, also
 *    injected by Vercel into preview deploys so SEO metadata keeps pointing
 *    at the real domain.
 * 3. `VERCEL_URL` — current deploy URL, used for previews that have no
 *    production domain configured yet.
 * 4. `http://localhost:3000` — local development fallback.
 */
export function getSiteUrl(): string {
	if (env.NEXT_PUBLIC_SITE_URL) {
		return stripTrailingSlash(env.NEXT_PUBLIC_SITE_URL);
	}

	const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
	if (productionUrl) {
		return `https://${productionUrl}`;
	}

	const vercelUrl = process.env.VERCEL_URL;
	if (vercelUrl) {
		return `https://${vercelUrl}`;
	}

	return "http://localhost:3000";
}

function stripTrailingSlash(url: string): string {
	return url.endsWith("/") ? url.slice(0, -1) : url;
}
