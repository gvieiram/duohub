import { Button } from "@react-email/components";
import type { ReactNode } from "react";

type EmailButtonProps = {
	href: string;
	children: ReactNode;
};

export function EmailButton({ href, children }: EmailButtonProps) {
	return (
		<Button
			href={href}
			className="inline-block rounded-lg bg-brand px-7 py-4 text-center font-16 font-sans text-fg-inverted leading-6"
		>
			{children}
		</Button>
	);
}
