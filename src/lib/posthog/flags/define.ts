import type { z } from "zod";

/**
 * Definition for a PostHog *configuration* flag — a flag whose value is
 * read globally on the server (no per-user evaluation) and is safe to cache
 * with `unstable_cache`. The Zod `schema` is the source of truth for both
 * runtime parsing (in `resolveAll`) and the inferred TypeScript type
 * exported via `z.infer`.
 *
 * Set `payload: true` for flags that ship a JSON payload (e.g. the banner).
 * The resolver will read the payload via `getFeatureFlagPayload`. Otherwise
 * the resolver reads the variant value via `getFeatureFlag`.
 */
type ConfigFlagDefinition<TSchema extends z.ZodTypeAny> = {
	key: string;
	description?: string;
	schema: TSchema;
	defaultValue: z.infer<TSchema>;
	payload?: boolean;
};

export type AnyConfigFlag = ConfigFlagDefinition<z.ZodTypeAny>;

export function defineConfigFlag<TSchema extends z.ZodTypeAny>(
	def: ConfigFlagDefinition<TSchema>,
): ConfigFlagDefinition<TSchema> {
	return def;
}
