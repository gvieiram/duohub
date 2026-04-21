"use client";

import { ArrowRight } from "lucide-react";
import { useMessages } from "@/stores/use-content-store";
import { FadeIn } from "./_animations";
import { IrpfModalTrigger } from "./irpf-modal/trigger-button";

export function FinalCta() {
	const { finalCta, modal } = useMessages().irpf;

	return (
		<section id="formulario-contato" className="py-16 md:py-24">
			<div className="mx-auto max-w-3xl px-4 text-center">
				<FadeIn>
					<span className="inline-block border-primary/40 border-l-2 pl-3 text-highlight text-sm">
						{finalCta.badge}
					</span>
					<h2 className="mt-3 font-heading text-3xl tracking-tight md:text-4xl">
						{finalCta.title}
					</h2>
					<p className="mt-3 text-muted-foreground leading-relaxed">
						{finalCta.description}
					</p>
				</FadeIn>

				<FadeIn className="mt-10" delay={0.15}>
					<IrpfModalTrigger size="lg" className="gap-2">
						{modal.trigger.primary}
						<ArrowRight aria-hidden className="size-4" />
					</IrpfModalTrigger>
					<p className="mt-3 text-muted-foreground text-xs">
						Resposta em até 24h — sem compromisso.
					</p>
				</FadeIn>
			</div>
		</section>
	);
}
