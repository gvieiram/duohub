"use client";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { useMessages } from "@/stores/use-content-store";

export function Faq() {
	const m = useMessages().ir.faq;

	return (
		<section id="faq" className="border-b bg-muted/30 py-16 md:py-24">
			<div className="mx-auto max-w-3xl px-4">
				<div className="max-w-2xl">
					<span className="inline-block border-primary/40 border-l-2 pl-3 text-highlight text-sm">
						{m.badge}
					</span>
					<h2 className="mt-3 font-heading text-3xl tracking-tight md:text-4xl">
						{m.title}
					</h2>
				</div>

				<Accordion type="single" collapsible className="mt-8">
					{m.items.map((q, idx) => (
						<AccordionItem key={q.question} value={`q-${idx}`}>
							<AccordionTrigger className="text-left font-medium text-base">
								{q.question}
							</AccordionTrigger>
							<AccordionContent className="text-muted-foreground leading-relaxed">
								{q.answer}
							</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>
			</div>
		</section>
	);
}
