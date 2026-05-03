import type { NextConfig } from "next";

// CSP applied only to /admin and /app (the authenticated areas).
// Marketing pages are intentionally excluded — they have different needs
// (third-party fonts, analytics scripts, etc.) and run under their own
// security profile.
//
// `'unsafe-inline'` is allowed in script-src and style-src because Next.js 16
// still emits inline runtime/styles. Tightening to nonce-based CSP is
// deferred hardening (out of scope for F1a).
const ADMIN_CSP = [
	"default-src 'self'",
	"script-src 'self' 'unsafe-inline' https://us-assets.i.posthog.com",
	"style-src 'self' 'unsafe-inline'",
	"img-src 'self' data: https:",
	"font-src 'self' data:",
	"connect-src 'self' https://us.i.posthog.com",
	"frame-ancestors 'none'",
	// Defence-in-depth directives with no Next.js cost:
	// - object-src: blocks Flash/PDF embed XSS
	// - base-uri: prevents <base> injection from rerouting relative URLs
	// - form-action: pins form submissions to first-party + auth endpoints
	"object-src 'none'",
	"base-uri 'self'",
	"form-action 'self'",
].join("; ");

const ADMIN_HEADERS = [
	{ key: "Content-Security-Policy", value: ADMIN_CSP },
	{ key: "X-Frame-Options", value: "DENY" },
	{ key: "X-Content-Type-Options", value: "nosniff" },
	{ key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
];

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

	async headers() {
		return [
			{ source: "/admin/:path*", headers: ADMIN_HEADERS },
			{ source: "/app/:path*", headers: ADMIN_HEADERS },
		];
	},
};

export default nextConfig;
