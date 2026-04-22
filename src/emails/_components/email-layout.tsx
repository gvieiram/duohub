import {
	Body,
	Container,
	Head,
	Html,
	Preview,
	Section,
	Tailwind,
} from "@react-email/components";
import type { ReactNode } from "react";
import { duohubEmailTailwindConfig } from "../_theme/tokens";
import { EmailFonts } from "./email-fonts";
import { EmailFooter } from "./email-footer";
import { EmailHeader } from "./email-header";

type EmailLayoutProps = {
	preview: string;
	children: ReactNode;
};

export function EmailLayout({ preview, children }: EmailLayoutProps) {
	return (
		<Tailwind config={duohubEmailTailwindConfig}>
			<Html lang="pt-BR">
				<Head>
					<EmailFonts />
				</Head>
				<Body className="m-0 bg-bg-2 text-center font-sans">
					<Preview>{preview}</Preview>
					<Container className="mx-auto mobile:mt-0 mt-8 w-full max-w-[640px]">
						<Section>
							<Section className="bg-bg mobile:px-2 px-6 py-4">
								<EmailHeader />
								<Section className="rounded-[8px] bg-bg-2 mobile:px-6 px-[40px] mobile:py-12 py-[64px] text-center">
									{children}
								</Section>
								<EmailFooter />
							</Section>
						</Section>
					</Container>
				</Body>
			</Html>
		</Tailwind>
	);
}

export function EmailLayoutStack({ preview, children }: EmailLayoutProps) {
	return (
		<Tailwind config={duohubEmailTailwindConfig}>
			<Html lang="pt-BR">
				<Head>
					<EmailFonts />
				</Head>
				<Body className="m-0 bg-bg-2 text-center font-sans">
					<Preview>{preview}</Preview>
					<Container className="mx-auto mobile:mt-0 mt-8 w-full max-w-[640px]">
						<Section>
							<Section className="bg-bg mobile:px-2 px-6 py-4">
								<EmailHeader />
								{children}
								<EmailFooter />
							</Section>
						</Section>
					</Container>
				</Body>
			</Html>
		</Tailwind>
	);
}
