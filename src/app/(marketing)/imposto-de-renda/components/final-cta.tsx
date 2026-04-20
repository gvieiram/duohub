"use client";

import { useMessages } from "@/stores/use-content-store";
import { LeadForm } from "./lead-form";

export function FinalCta() {
	const m = useMessages().ir.finalCta;

	return (
		<section id="formulario-contato" className="py-16 md:py-24">
			<div className="mx-auto max-w-3xl px-4 text-center">
				<span className="inline-block border-primary/40 border-l-2 pl-3 text-highlight text-sm">
					{m.badge}
				</span>
				<h2 className="mt-3 font-heading text-3xl tracking-tight md:text-4xl">
					{m.title}
				</h2>
				<p className="mt-3 text-muted-foreground leading-relaxed">
					{m.description}
				</p>

				<div className="mt-10">
					<LeadForm variant="final" />
				</div>
			</div>
		</section>
	);
}
