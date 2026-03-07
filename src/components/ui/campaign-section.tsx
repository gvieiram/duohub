import { CheckIcon, FileTextIcon, MessageCircleIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type CampaignData = {
	badge: string;
	title: string;
	subtitle: string;
	bullets: string[];
	cta: { label: string; href: string };
};

const defaultCampaign: CampaignData = {
	badge: "IR 2026",
	title: "Imposto de Renda 2026",
	subtitle: "Prazo até 30 de maio. Não deixe para a última hora!",
	bullets: [
		"Declaração completa para pessoa física e jurídica",
		"Análise de deduções para maximizar sua restituição",
		"Entrega rápida e sem complicações",
	],
	cta: {
		label: "Declarar com a Effer",
		href: "https://wa.me/5511999999999?text=Olá! Gostaria de saber sobre a declaração do IR 2026",
	},
};

type CampaignSectionProps = {
	campaign?: CampaignData;
	className?: string;
};

export function CampaignSection({
	campaign = defaultCampaign,
	className,
}: CampaignSectionProps) {
	const { badge, title, subtitle, bullets, cta } = campaign;

	return (
		<section
			className={cn(
				"mx-auto w-full max-w-5xl border-t bg-accent/50 py-20 md:py-32",
				className,
			)}
		>
			<div className="flex flex-col gap-10 px-6 md:flex-row md:items-center md:gap-16 md:px-8">
				<div className="flex flex-1 flex-col">
					<Badge
						className="mb-4 w-fit bg-highlight text-highlight-foreground"
						variant="default"
					>
						{badge}
					</Badge>
					<h2 className="mb-2 font-heading text-3xl tracking-tight md:text-4xl">
						{title}
					</h2>
					<p className="mb-6 text-muted-foreground">{subtitle}</p>
					<ul className="mb-8 space-y-3">
						{bullets.map((bullet) => (
							<li key={bullet} className="flex items-start gap-3">
								<CheckIcon className="mt-1 size-4 shrink-0 text-highlight" />
								<span>{bullet}</span>
							</li>
						))}
					</ul>
					<Button asChild size="lg">
						<a href={cta.href} target="_blank" rel="noopener noreferrer">
							<MessageCircleIcon className="size-4" />
							{cta.label}
						</a>
					</Button>
				</div>
				<div className="hidden shrink-0 md:flex md:items-center md:justify-end">
					<FileTextIcon
						className="size-32 text-foreground/10 md:size-48"
						aria-hidden
					/>
				</div>
			</div>
		</section>
	);
}
