import "server-only";

import { PostHog } from "posthog-node";
import { env } from "@/lib/env";

let cachedClient: PostHog | null = null;

/**
 * Returns a singleton PostHog Node client for server-side flag evaluation.
 *
 * Configuration choices:
 * - **Project token, not personal API key.** `posthog-node` accepts the
 *   same `<ph_project_token>` that `posthog-js` uses on the client; it's
 *   what the official docs show and it's all that remote feature-flag
 *   evaluation needs. A personal API key is only required for local
 *   evaluation (which we explicitly avoid — see below).
 * - **Remote evaluation** (default mode): each request fetches the current
 *   flag state from PostHog. Local evaluation is intentionally avoided —
 *   it polls definitions and evaluates locally, which doesn't fit
 *   stateless serverless functions on Vercel (cold starts re-poll, costs
 *   add up, and there's no shared cache between instances). Remote
 *   evaluation paired with Next.js `unstable_cache` (in `flags/resolve.ts`)
 *   gives us fresh-enough data with a single network call per ISR window.
 * - `flushAt: 1` + `flushInterval: 0`: flush events immediately. Serverless
 *   functions can be killed at any moment; we don't want events stuck in
 *   memory.
 * - The token is **optional** (see `env.ts`). When missing (e.g. CI builds
 *   without secrets), `getServerPostHog()` still returns a client; PostHog's
 *   SDK no-ops on calls when the key is invalid, and `resolveAll()` falls
 *   back to schema defaults.
 */
export function getServerPostHog(): PostHog {
	if (cachedClient) return cachedClient;

	cachedClient = new PostHog(env.NEXT_PUBLIC_POSTHOG_TOKEN ?? "", {
		host: env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
		flushAt: 1,
		flushInterval: 0,
	});

	return cachedClient;
}
