import "server-only";

import { unstable_cache } from "next/cache";
import type { z } from "zod";
import { getServerPostHog } from "../server";
import { type AllFlagsMap, allFlags } from "./config";

/**
 * Strongly-typed snapshot of every defined config flag, parsed against
 * its Zod schema. Each key is the JS-side identifier from `allFlags`
 * (e.g. `isLogoTextCentered`), and each value is the precise inferred
 * type from the matching schema.
 */
export type FlagsState = {
	-readonly [K in keyof AllFlagsMap]: z.infer<AllFlagsMap[K]["schema"]>;
};

/**
 * Fixed identity for global config flags. We use the same distinct ID
 * for every server-side `resolveAll()` call so the result is shareable
 * across requests (and cacheable via `unstable_cache`). User-specific
 * experiment flags must NOT use this resolver — they should be read on
 * the client via `useFeatureFlagVariantKey()` from `@posthog/react`.
 */
const ANONYMOUS_DISTINCT_ID = "anonymous-marketing-visitor";

/**
 * Fetches every flag's value/payload from PostHog in a single network
 * call. Wrapped in `unstable_cache` so the result is shared across
 * concurrent requests within an ISR window (60s) and across multiple
 * route segments in the same server render. The cache tag
 * `posthog-flags` allows future webhook-driven invalidation via
 * `revalidateTag("posthog-flags")`.
 */
const fetchAllFlagsFromPostHog = unstable_cache(
	async () => {
		const client = getServerPostHog();
		return await client.getAllFlagsAndPayloads(ANONYMOUS_DISTINCT_ID);
	},
	["posthog-config-flags"],
	{ revalidate: 60, tags: ["posthog-flags"] },
);

/**
 * Resolves every config flag defined in `allFlags` to its current value,
 * falling back to the schema-derived default on parsing failure or when
 * PostHog is unreachable. Never throws — production rendering must not
 * break when PostHog is degraded.
 */
export async function resolveAll(): Promise<FlagsState> {
	const defaults = Object.fromEntries(
		Object.entries(allFlags).map(([jsKey, flag]) => [jsKey, flag.defaultValue]),
	) as FlagsState;

	let raw: Awaited<ReturnType<typeof fetchAllFlagsFromPostHog>> | null = null;
	try {
		raw = await fetchAllFlagsFromPostHog();
	} catch (error) {
		console.warn("[posthog] resolveAll() failed, using defaults", error);
		return defaults;
	}

	const state: FlagsState = { ...defaults };

	for (const [jsKey, flag] of Object.entries(allFlags)) {
		const rawValue = flag.payload
			? raw.featureFlagPayloads?.[flag.key]
			: raw.featureFlags?.[flag.key];

		if (rawValue === undefined) continue;

		const parsed = flag.schema.safeParse(rawValue);
		if (parsed.success) {
			(state as Record<string, unknown>)[jsKey] = parsed.data;
		} else {
			console.warn(
				`[posthog] flag "${flag.key}" failed schema validation, using default`,
				parsed.error.flatten(),
			);
		}
	}

	return state;
}
