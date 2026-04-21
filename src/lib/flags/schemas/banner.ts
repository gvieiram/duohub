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

export const bannerConfigSchema = z.object({
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

export type BannerConfig = z.infer<typeof bannerConfigSchema>;
export type BannerCtaConfig = z.infer<typeof bannerCtaSchema>;
