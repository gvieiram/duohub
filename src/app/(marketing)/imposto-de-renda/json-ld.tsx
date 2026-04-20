import type { BreadcrumbList, FAQPage, Service, WithContext } from "schema-dts";
import { JsonLd } from "@/components/json-ld";
import { company } from "@/content/company";
import { messages } from "@/content/messages";

type Props = { siteUrl: string };

export function IrJsonLd({ siteUrl }: Props) {
	const ir = messages.ir;

	const service: WithContext<Service> = {
		"@context": "https://schema.org",
		"@type": "Service",
		name: "Declaração de Imposto de Renda (IRPF 2026)",
		serviceType: "Declaração de Imposto de Renda Pessoa Física",
		provider: {
			"@type": "AccountingService",
			name: company.brand.name,
			url: siteUrl,
			telephone: company.contacts.phone,
			address: {
				"@type": "PostalAddress",
				addressLocality: company.location.city,
				addressRegion: company.location.state,
				addressCountry: company.location.country,
			},
		},
		areaServed: { "@type": "Country", name: "Brasil" },
		description: ir.metadata.description,
	};

	const faqPage: WithContext<FAQPage> = {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: ir.faq.items.map((q) => ({
			"@type": "Question",
			name: q.question,
			acceptedAnswer: { "@type": "Answer", text: q.answer },
		})),
	};

	const breadcrumbs: WithContext<BreadcrumbList> = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: [
			{
				"@type": "ListItem",
				position: 1,
				name: "Início",
				item: `${siteUrl}/`,
			},
			{
				"@type": "ListItem",
				position: 2,
				name: "Imposto de Renda",
				item: `${siteUrl}/imposto-de-renda`,
			},
		],
	};

	return (
		<>
			<JsonLd data={service} />
			<JsonLd data={faqPage} />
			<JsonLd data={breadcrumbs} />
		</>
	);
}
