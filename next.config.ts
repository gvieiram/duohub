import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	// Expose Vercel's server-side `VERCEL_ENV` to the client bundle as
	// `NEXT_PUBLIC_VERCEL_ENV`. Used by `instrumentation-client.ts` to gate
	// PostHog analytics capture (off outside production) while keeping the
	// SDK initialized everywhere so feature flags still work.
	// In local dev `VERCEL_ENV` is `undefined`; the client code falls back
	// to `"development"`.
	env: {
		// biome-ignore lint/style/useNamingConvention: Next.js requires SCREAMING_SNAKE_CASE for env keys
		NEXT_PUBLIC_VERCEL_ENV: process.env.VERCEL_ENV,
	},

	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "images.unsplash.com",
			},
		],
	},
	allowedDevOrigins: ["192.168.*.*", "10.*.*.*"],

	// Reverse proxy for PostHog. Routing analytics through a same-origin path
	// ("/ingest") drastically reduces losses to ad blockers / privacy extensions
	// that match the "us.i.posthog.com" domain in their blocklists.
	// Ref: https://posthog.com/docs/advanced/proxy/nextjs
	skipTrailingSlashRedirect: true,
	async rewrites() {
		return [
			// Static SDK assets (recorder bundle, survey widget, etc.) live on a
			// separate CDN host (`us-assets.i.posthog.com`) — keep this rule above
			// the catch-all so it matches first.
			{
				source: "/ingest/static/:path*",
				destination: "https://us-assets.i.posthog.com/static/:path*",
			},
			{
				source: "/ingest/:path*",
				destination: "https://us.i.posthog.com/:path*",
			},
		];
	},
};

export default nextConfig;
