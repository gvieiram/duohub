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

if (process.env.NEXT_PUBLIC_POSTHOG_TOKEN) {
	posthog.init(process.env.NEXT_PUBLIC_POSTHOG_TOKEN, {
		api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "/ingest",
		ui_host: "https://us.posthog.com",
		defaults: "2026-01-30",
		person_profiles: "always",
		session_recording: {
			maskAllInputs: true,
		},
	});
}
