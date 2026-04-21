import { ImageResponse } from "next/og";
import { company } from "@/content/company";
import { messages } from "@/content/messages";

export const alt = messages.irpf.metadata.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				flexDirection: "column",
				justifyContent: "space-between",
				padding: 80,
				background:
					"linear-gradient(135deg, #1a3a37 0%, #274f4a 50%, #1a3a37 100%)",
				fontFamily: "sans-serif",
			}}
		>
			<div
				style={{
					display: "flex",
					alignSelf: "flex-start",
					padding: "10px 20px",
					borderRadius: 6,
					background: "rgba(217, 152, 138, 0.18)",
					color: "#d9988a",
					fontSize: 22,
					fontWeight: 600,
					letterSpacing: "2px",
					textTransform: "uppercase",
				}}
			>
				{messages.irpf.hero.badge}
			</div>

			<div
				style={{
					display: "flex",
					flexDirection: "column",
					gap: 28,
				}}
			>
				<div
					style={{
						display: "flex",
						fontSize: 76,
						fontWeight: 700,
						color: "#ffffff",
						letterSpacing: "-2px",
						lineHeight: 1.05,
						maxWidth: 1000,
					}}
				>
					{messages.irpf.hero.title}
				</div>
				<div
					style={{
						display: "flex",
						fontSize: 28,
						color: "rgba(255,255,255,0.72)",
						lineHeight: 1.4,
						maxWidth: 900,
					}}
				>
					{messages.irpf.hero.subtitle}
				</div>
			</div>

			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					color: "rgba(255,255,255,0.5)",
					fontSize: 20,
				}}
			>
				<div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
					<span style={{ fontWeight: 700, color: "#ffffff" }}>
						{company.brand.displayNameProps.duo}
					</span>
					<span style={{ fontWeight: 700, color: "#d9988a" }}>
						{company.brand.displayNameProps.hub}
					</span>
					<span style={{ marginLeft: 12, color: "rgba(255,255,255,0.5)" }}>
						· {company.location.city}, {company.location.state}
					</span>
				</div>
				<span>{company.siteUrl.replace("https://", "")}</span>
			</div>
		</div>,
		{ ...size },
	);
}
