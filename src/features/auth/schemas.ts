import { z } from "zod";

export const loginSchema = z.object({
	email: z.string().email().max(254),
	next: z
		.string()
		.startsWith("/")
		.refine((v) => !v.startsWith("//"), {
			message: "next must be a single-leading-slash path",
		})
		.optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
