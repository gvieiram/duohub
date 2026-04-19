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
import type { LeadSituation } from "../schemas";
import { SITUATION_LABELS } from "../types";

type Props = {
	name: string;
	email: string;
	whatsapp: string;
	situation: LeadSituation;
	whatsappHref: string;
	utmSource?: string | null;
	utmMedium?: string | null;
	utmCampaign?: string | null;
};

const row = {
	fontSize: 15,
	color: "#1f2937",
	margin: "4px 0",
	lineHeight: 1.6,
};

export function InternalNotificationEmail(props: Props) {
	const hasUtm = props.utmSource || props.utmMedium || props.utmCampaign;

	return (
		<Html lang="pt-BR">
			<Head />
			<Preview>Novo lead IR 2026 — {props.name}</Preview>
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
					<Heading style={{ fontSize: 20, color: "#111", marginTop: 0 }}>
						Novo lead IR 2026
					</Heading>

					<Section>
						<Text style={row}>
							<strong>Nome:</strong> {props.name}
						</Text>
						<Text style={row}>
							<strong>E-mail:</strong> {props.email}
						</Text>
						<Text style={row}>
							<strong>WhatsApp:</strong> {props.whatsapp}
						</Text>
						<Text style={row}>
							<strong>Situação:</strong> {SITUATION_LABELS[props.situation]}
						</Text>
					</Section>

					{hasUtm && (
						<Section style={{ marginTop: 16 }}>
							<Text style={{ ...row, color: "#6b7280", fontSize: 13 }}>
								UTM source: {props.utmSource ?? "—"}
								<br />
								UTM medium: {props.utmMedium ?? "—"}
								<br />
								UTM campaign: {props.utmCampaign ?? "—"}
							</Text>
						</Section>
					)}

					<Section style={{ marginTop: 24 }}>
						<Link
							href={props.whatsappHref}
							style={{
								display: "inline-block",
								backgroundColor: "#0f766e",
								color: "#ffffff",
								padding: "12px 20px",
								borderRadius: 6,
								textDecoration: "none",
								fontWeight: 600,
							}}
						>
							Responder no WhatsApp
						</Link>
					</Section>
				</Container>
			</Body>
		</Html>
	);
}

export default InternalNotificationEmail;
