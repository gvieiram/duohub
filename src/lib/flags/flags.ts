import { vercelAdapter } from "@flags-sdk/vercel";
import { defineFlag } from "./utils/define-flag";

const isLogoTextCentered = defineFlag({
	key: "logo-text-centered",
	defaultValue: false,
	adapter: vercelAdapter(),
});

export const socialProofType = defineFlag<string>({
	key: "social-proof-type",
	description: '"clients" | "credentials" | "statement"',
	defaultValue: "credentials",
	options: [
		{ value: "clients", label: "Clients" },
		{ value: "credentials", label: "Credentials" },
		{ value: "statement", label: "Statement" },
	],
	adapter: vercelAdapter(),
});

export const allFlags = {
	isLogoTextCentered,
	socialProofType,
};
