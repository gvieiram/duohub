import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { company } from "@/content/company";
import { messages } from "@/content/messages";
import { getSiteUrl } from "@/lib/site-url";
import { Changes2026 } from "./components/changes-2026";
import { Deadlines } from "./components/deadlines";
import { Faq } from "./components/faq";
import { FinalCta } from "./components/final-cta";
import { Hero } from "./components/hero";
import { HowItWorks } from "./components/how-it-works";
import { InlineCta } from "./components/inline-cta";
import { IrpfModal } from "./components/irpf-modal";
import { RequiredDocuments } from "./components/required-documents";
import { Situations } from "./components/situations";
import { WhoDeclares } from "./components/who-declares";
import { WhyDuohub } from "./components/why-duohub";
import { IrJsonLd } from "./json-ld";

const { title, description } = messages.ir.metadata;

export const metadata: Metadata = {
	title,
	description,
	alternates: { canonical: "/imposto-de-renda" },
	openGraph: {
		title,
		description,
		url: "/imposto-de-renda",
		siteName: company.brand.name,
		locale: "pt_BR",
		type: "website",
	},
	twitter: { card: "summary_large_image", title, description },
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
};

// biome-ignore-start lint/style/useNamingConvention: UTM params follow the standard snake_case convention
type SearchParams = {
	utm_source?: string;
	utm_medium?: string;
	utm_campaign?: string;
};
// biome-ignore-end lint/style/useNamingConvention: UTM params follow the standard snake_case convention

export default async function IrPage({
	searchParams,
}: {
	searchParams: Promise<SearchParams>;
}) {
	const sp = await searchParams;
	const utm = {
		source: sp.utm_source ?? null,
		medium: sp.utm_medium ?? null,
		campaign: sp.utm_campaign ?? null,
	};

	return (
		<>
			<IrJsonLd siteUrl={getSiteUrl()} />
			<Hero />
			<WhoDeclares />
			<Changes2026 />
			<Situations />
			<InlineCta />
			<WhyDuohub />
			<HowItWorks />
			<RequiredDocuments />
			<Deadlines />
			<InlineCta />
			<Faq />
			<FinalCta />
			<Footer />
			<IrpfModal utm={utm} />
		</>
	);
}
