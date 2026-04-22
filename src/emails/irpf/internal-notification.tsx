import {
	Column,
	Heading,
	Hr,
	Link,
	Row,
	Section,
	Text,
} from "@react-email/components";
import type { ReactNode } from "react";
import type {
	IrpfComplexity,
	IrpfMoment,
	IrpfSituation,
} from "@/features/irpf/schemas";
import {
	COMPLEXITY_LABELS,
	MOMENT_LABELS,
	SITUATION_LABELS,
} from "@/features/irpf/types";
import { EmailButton } from "../_components/email-button";
import { EmailLayoutStack } from "../_components/email-layout";

type Props = {
	name: string;
	email: string;
	whatsapp: string;
	situation: IrpfSituation | null;
	complexity: IrpfComplexity[];
	moment: IrpfMoment | null;
	whatsappHref: string;
};

const CARD_CLASS =
	"bg-bg-2 mobile:mb-2 mobile:px-4 mobile:py-10 mb-6 rounded-[10px] px-8 py-14 text-left";
const CARD_HEADING_CLASS = "font-24 text-fg mt-0 mb-6 text-left font-sans";
const ROW_DIVIDER_CLASS = "my-0 border-stroke-strong";

function formatWhatsapp(digits: string): string {
	const cleaned = digits.replace(/\D/g, "");
	if (cleaned.length === 11) {
		return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
	}
	if (cleaned.length === 10) {
		return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
	}
	return digits;
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
	return (
		<Row className="py-3">
			<Column className="w-[120px] align-middle">
				<Text className="m-0 font-13 font-sans text-fg-3">{label}</Text>
			</Column>
			<Column align="right" className="align-middle">
				<Text className="m-0 text-right font-14 font-sans text-fg">
					{value}
				</Text>
			</Column>
		</Row>
	);
}

function InfoTable({ children }: { children: ReactNode[] }) {
	const items = children.filter(Boolean);
	return (
		<>
			{items.map((child, index) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: static ordered list built from JSX children
				<Section key={index}>
					{index > 0 ? <Hr className={ROW_DIVIDER_CLASS} /> : null}
					{child}
				</Section>
			))}
		</>
	);
}

function HeroCard() {
	return (
		<Section className="mb-6 mobile:mb-2 rounded-[10px] bg-bg-2 mobile:px-4 px-6 mobile:py-10 py-14 text-left">
			<Text className="mt-0 mb-4 font-13 font-sans text-fg-3">
				IRPF 2026 · duohubcontabil.com.br
			</Text>
			<Heading as="h1" className="mt-0 mb-4 font-40 font-sans text-fg">
				Novo cliente interessado em declarar o IRPF
			</Heading>
			<Text className="m-0 font-16 font-sans text-fg-2">
				Alguém preencheu o formulário na página de IR e está aguardando contato.
			</Text>
		</Section>
	);
}

function ContactCard({
	name,
	email,
	whatsapp,
	whatsappHref,
}: {
	name: string;
	email: string;
	whatsapp: string;
	whatsappHref: string;
}) {
	return (
		<Section className={CARD_CLASS}>
			<Heading as="h2" className={CARD_HEADING_CLASS}>
				Contato
			</Heading>

			<InfoTable>
				<InfoRow label="Nome" value={name} />
				<InfoRow
					label="E-mail"
					value={
						<Link
							href={`mailto:${email}`}
							className="font-sans text-fg underline"
						>
							{email}
						</Link>
					}
				/>
				<InfoRow
					label="WhatsApp"
					value={
						<Link href={whatsappHref} className="font-sans text-fg underline">
							{formatWhatsapp(whatsapp)}
						</Link>
					}
				/>
			</InfoTable>

			<Section className="mt-8 text-center">
				<EmailButton href={whatsappHref}>Responder no WhatsApp</EmailButton>
			</Section>
		</Section>
	);
}

function QualificationCard({
	situation,
	moment,
	complexityList,
}: {
	situation: IrpfSituation | null;
	moment: IrpfMoment | null;
	complexityList: IrpfComplexity[];
}) {
	const complexityLabels = complexityList
		.map((item) => COMPLEXITY_LABELS[item] ?? item)
		.join(" · ");
	const hasComplexity = complexityList.length > 0;

	return (
		<Section className={CARD_CLASS}>
			<Heading as="h2" className={CARD_HEADING_CLASS}>
				Qualificação
			</Heading>

			<InfoTable>
				{situation ? (
					<InfoRow
						label="Situação"
						value={SITUATION_LABELS[situation] ?? situation}
					/>
				) : null}
				{moment ? (
					<InfoRow label="Momento" value={MOMENT_LABELS[moment] ?? moment} />
				) : null}
				{hasComplexity ? (
					<InfoRow label="Complexidades" value={complexityLabels} />
				) : null}
			</InfoTable>
		</Section>
	);
}

export function InternalNotificationEmail({
	name,
	email,
	whatsapp,
	situation,
	complexity,
	moment,
	whatsappHref,
}: Props) {
	const complexityList = complexity ?? [];
	const hasQualification = Boolean(
		situation || moment || complexityList.length > 0,
	);

	return (
		<EmailLayoutStack
			preview={`Novo cliente interessado — IRPF 2026 · ${name}`}
		>
			<HeroCard />
			<ContactCard
				name={name}
				email={email}
				whatsapp={whatsapp}
				whatsappHref={whatsappHref}
			/>
			{hasQualification ? (
				<QualificationCard
					situation={situation}
					moment={moment}
					complexityList={complexityList}
				/>
			) : null}
		</EmailLayoutStack>
	);
}

InternalNotificationEmail.PreviewProps = {
	name: "João da Silva",
	email: "joao@example.com",
	whatsapp: "48992467107",
	situation: "CLT",
	complexity: ["ALUGUEL", "DEPENDENTES"],
	moment: "PRIMEIRO_ANO",
	whatsappHref:
		"https://wa.me/5548992467107?text=Ol%C3%A1%2C%20Jo%C3%A3o%21%20Aqui%20%C3%A9%20da%20DuoHub.",
} satisfies Props;

export default InternalNotificationEmail;
