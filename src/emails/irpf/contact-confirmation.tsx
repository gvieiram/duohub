import { Heading, Section, Text } from "@react-email/components";
import { EmailButton } from "../_components/email-button";
import { EmailLayout } from "../_components/email-layout";

type Props = {
	name: string;
	whatsappHref: string;
};

export function IrpfContactConfirmationEmail({ name, whatsappHref }: Props) {
	return (
		<EmailLayout preview="Recebemos seu contato — IRPF 2026">
			<Heading as="h1" className="m-0 mb-4 font-28 font-sans text-fg">
				Olá, {name}!
			</Heading>

			<Text className="mx-auto mt-0 mb-4 max-w-[440px] text-center font-16 font-sans text-fg-2">
				Recebemos seu contato sobre a declaração do IRPF 2026.
			</Text>

			<Text className="mx-auto mt-0 mb-8 max-w-[440px] text-center font-16 font-sans text-fg-2">
				Em até 24 horas úteis, um dos nossos especialistas dedicados vai
				retornar pelo WhatsApp ou por este e-mail.
			</Text>

			<Section className="mb-10 text-center">
				<EmailButton href={whatsappHref}>Falar no WhatsApp</EmailButton>
			</Section>

			<Text className="mx-auto mt-8 mb-4 max-w-[440px] text-center font-13 font-sans text-fg-3">
				Enquanto isso, você pode ir separando seus documentos:
			</Text>

			<Section className="mx-auto max-w-[440px] text-left">
				<Text className="mt-0 mb-2 font-14 font-sans text-fg-2">
					· Informe de rendimentos (do empregador ou fonte pagadora)
				</Text>
				<Text className="mt-0 mb-2 font-14 font-sans text-fg-2">
					· Informes bancários (banco, corretora, previdência)
				</Text>
				<Text className="mt-0 mb-2 font-14 font-sans text-fg-2">
					· Comprovantes de despesas médicas e de educação
				</Text>
				<Text className="mt-0 mb-0 font-14 font-sans text-fg-2">
					· Declaração do IRPF 2025 (se você já declarou ano passado)
				</Text>
			</Section>
		</EmailLayout>
	);
}

IrpfContactConfirmationEmail.PreviewProps = {
	name: "João da Silva",
	whatsappHref:
		"https://wa.me/5548992467107?text=Ol%C3%A1!%20Vi%20a%20p%C3%A1gina%20de%20IR%20da%20DuoHub",
} satisfies Props;

export default IrpfContactConfirmationEmail;
