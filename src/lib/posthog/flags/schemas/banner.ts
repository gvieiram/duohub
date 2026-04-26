import { z } from "zod";

const bannerCtaSchema = z
	.object({
		label: z.string().min(1),
		href: z.string().min(1).optional(),
		whatsappText: z.string().min(1).optional(),
	})
	.refine((value) => Boolean(value.href) !== Boolean(value.whatsappText), {
		message: "Provide exactly one of `href` or `whatsappText`.",
	});

const bannerConfigBaseSchema = z.object({
	active: z.boolean(),
	startDate: z.string().optional(),
	endDate: z.string().optional(),
	title: z.string(),
	description: z.string().optional(),
	storageKey: z.string(),
	icon: z.string().optional(),
	position: z.enum(["top", "bottom"]).optional().default("bottom"),
	cta: z.array(bannerCtaSchema).min(1).max(2).optional(),
	enabledOnPaths: z.array(z.string()).optional(),
});

/**
 * The "raw" parsed shape — what the JSON payload from PostHog looks like
 * before we filter for active status and date windows. Exported for
 * callers that need to introspect the original config (rare).
 */
export type BannerConfig = z.infer<typeof bannerConfigBaseSchema>;

export type BannerCtaConfig = z.infer<typeof bannerCtaSchema>;

/**
 * Schema applied to the IRPF banner payload coming from PostHog.
 *
 * The flag value can be:
 *   - `null` — the flag isn't configured / payload absent
 *   - the parsed shape — but only "valid" when `active` is true and `now`
 *     is inside the optional `[startDate, endDate]` window (BRT/UTC-3)
 *
 * The `.transform()` collapses both "inactive" and "outside window" into
 * `null` so consumers only need to handle two states: `null` (don't show)
 * or `BannerConfig` (show it).
 */
export const bannerConfigSchema = bannerConfigBaseSchema
	.nullable()
	.transform((config): BannerConfig | null => {
		if (!config?.active) return null;

		const now = new Date();

		if (config.startDate) {
			const start = new Date(`${config.startDate}T00:00:00-03:00`);
			if (now < start) return null;
		}

		if (config.endDate) {
			const end = new Date(`${config.endDate}T23:59:59.999-03:00`);
			if (now > end) return null;
		}

		return config;
	});
