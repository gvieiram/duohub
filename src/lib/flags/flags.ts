import { vercelAdapter } from "@flags-sdk/vercel";
import { defineFlag } from "./utils/define-flag";

const isLogoTextCentered = defineFlag({
	key: "logo-text-centered",
	description:
		"Posicionamento do texto da logo. Centralizado ou alinhado à esquerda",
	defaultValue: false,
	options: [
		{ value: false, label: "Off" },
		{ value: true, label: "On" },
	],
	adapter: vercelAdapter(),
});

export const allFlags = { isLogoTextCentered };
