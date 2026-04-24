// biome-ignore-all lint/style/useNamingConvention: PostHog config options and env vars are snake_case by design

import posthog from "posthog-js";

/**
 * Initializes posthog-js on the client before the first render.
 *
 * Next.js calls this file automatically on every client boot (both App and Pages
 * routers). Keeping the init here — instead of a useEffect inside a provider —
 * avoids the short window where the app renders before analytics boots, which
 * would miss the very first $pageview of fresh loads.
 *
 * Environment gating (single PostHog project, free plan):
 * - The SDK is always initialized when a token exists, so feature flags can be
 *   evaluated in every environment (dev, preview, prod).
 * - Outside production, analytics capture and session recording are turned off
 *   by default (`opt_out_capturing_by_default`, `disable_session_recording`)
 *   to keep the project's data clean of dev/preview noise.
 * - All events get an `environment` super-property via `register()` so the
 *   `Test account filter` in PostHog can hide non-production traffic globally
 *   (and so the rare event captured in dev — after `posthog.opt_in_capturing()`
 *   in the browser console — is easy to identify and bulk-delete later).
 *
 * Notes on config:
 * - `defaults: "2026-01-30"` opts into PostHog's "Jan 30 2026" recommended preset,
 *   which includes history-change based $pageview capture, $pageleave, $web_vitals,
 *   and dead-click heatmaps. We don't need to wire any of these manually.
 * - `person_profiles: "always"` keeps anonymous visits in the timeline so that
 *   after `posthog.identify()` (called on form submit), first-touch UTM
 *   attribution is preserved end-to-end — critical for a public marketing site.
 * - `session_recording.maskAllInputs: true` masks every form input by default
 *   (LGPD). Opt-in with `data-ph-capture="true"` on a specific element if ever
 *   needed.
 */

const token = process.env.NEXT_PUBLIC_POSTHOG_TOKEN;
const environment = process.env.NEXT_PUBLIC_VERCEL_ENV ?? "development";
const isProduction = environment === "production";

if (token) {
	posthog.init(token, {
		api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "/ingest",
		ui_host: "https://us.posthog.com",
		defaults: "2026-01-30",
		person_profiles: "always",
		opt_out_capturing_by_default: !isProduction,
		disable_session_recording: !isProduction,
		session_recording: {
			maskAllInputs: true,
		},
	});

	posthog.register({ environment });
}
