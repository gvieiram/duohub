"use client";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { useMessages } from "@/stores/use-content-store";

export function RequiredDocuments() {
	const m = useMessages().ir.documents;

	return (
		<section id="documentos" className="border-b bg-muted/30 py-16 md:py-24">
			<div className="mx-auto max-w-3xl px-4">
				<div className="max-w-2xl">
					<span className="inline-block border-primary/40 border-l-2 pl-3 text-highlight text-sm">
						{m.badge}
					</span>
					<h2 className="mt-3 font-heading text-3xl tracking-tight md:text-4xl">
						{m.title}
					</h2>
					<p className="mt-3 text-muted-foreground leading-relaxed">
						{m.intro}
					</p>
				</div>

				<Accordion type="multiple" className="mt-8">
					{m.groups.map((group) => (
						<AccordionItem key={group.title} value={group.title}>
							<AccordionTrigger className="text-base font-medium">
								{group.title}
							</AccordionTrigger>
							<AccordionContent>
								<ul className="space-y-1.5 text-muted-foreground text-sm">
									{group.items.map((item) => (
										<li key={item} className="flex gap-2">
											<span aria-hidden>•</span>
											<span>{item}</span>
										</li>
									))}
								</ul>
							</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>
			</div>
		</section>
	);
}
