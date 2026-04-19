import {
	Body,
	Container,
	Head,
	Heading,
	Html,
	Link,
	Preview,
	Section,
	Text,
} from "@react-email/components";

type Props = {
	name: string;
	whatsappHref: string;
};

export function LeadConfirmationEmail({ name, whatsappHref }: Props) {
	return (
		<Html lang="pt-BR">
			<Head />
			<Preview>Recebemos seu contato — IR 2026</Preview>
			<Body
				style={{
					fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
					backgroundColor: "#f5f5f4",
					margin: 0,
					padding: "24px",
				}}
			>
				<Container
					style={{
						maxWidth: 560,
						backgroundColor: "#ffffff",
						borderRadius: 8,
						padding: "32px",
					}}
				>
					<Heading style={{ fontSize: 22, color: "#134e4a", marginTop: 0 }}>
						Recebemos seu contato, {name}
					</Heading>

					<Text style={{ fontSize: 16, color: "#1f2937", lineHeight: 1.6 }}>
						Obrigado por procurar a DuoHub para a sua declaração do IRPF 2026.
						Um dos nossos especialistas dedicados vai retornar em{" "}
						<strong>até 24 horas úteis</strong> pelo WhatsApp ou por este
						e-mail.
					</Text>

					<Section
						style={{
							marginTop: 24,
							padding: "16px 20px",
							backgroundColor: "#ecfeff",
							borderRadius: 6,
						}}
					>
						<Text style={{ fontSize: 14, margin: 0, color: "#0f766e" }}>
							Prefere agilizar? Fale com a gente agora no WhatsApp:
						</Text>
						<Link
							href={whatsappHref}
							style={{
								fontSize: 16,
								fontWeight: 600,
								color: "#0f766e",
								textDecoration: "none",
							}}
						>
							Falar no WhatsApp →
						</Link>
					</Section>

					<Text
						style={{
							fontSize: 13,
							color: "#6b7280",
							marginTop: 32,
							lineHeight: 1.5,
						}}
					>
						DuoHub Gestão Contábil · Florianópolis, SC
						<br />
						<Link
							href="https://duohubcontabil.com.br"
							style={{ color: "#0f766e" }}
						>
							duohubcontabil.com.br
						</Link>{" "}
						·{" "}
						<Link
							href="https://instagram.com/duohubcontabil"
							style={{ color: "#0f766e" }}
						>
							@duohubcontabil
						</Link>
					</Text>
				</Container>
			</Body>
		</Html>
	);
}

export default LeadConfirmationEmail;
