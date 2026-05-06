import { z } from "zod";

export const inviteUserSchema = z.object({
	email: z.string().trim().email("E-mail inválido").toLowerCase(),
	name: z
		.string()
		.trim()
		.min(2)
		.max(120)
		.optional()
		.or(z.literal("").transform(() => undefined)),
});

export type InviteUserInput = z.infer<typeof inviteUserSchema>;

export const revokeUserSchema = z.object({
	userId: z.string().min(1),
});
