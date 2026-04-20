"use client";

import { useMessages } from "@/stores/use-content-store";

export function HowItWorks() {
	const m = useMessages().ir.howItWorks;

	return (
		<section id="como-funciona" className="border-b py-16 md:py-24">
			<div className="mx-auto max-w-5xl px-4">
				<div className="max-w-2xl">
					<span className="inline-block border-primary/40 border-l-2 pl-3 text-highlight text-sm">
						{m.badge}
					</span>
					<h2 className="mt-3 font-heading text-3xl tracking-tight md:text-4xl">
						{m.title}
					</h2>
				</div>

				<ol className="mt-10 grid gap-6 md:grid-cols-4">
					{m.steps.map((step) => (
						<li key={step.number} className="rounded-xl border bg-card p-6">
							<div className="font-heading text-2xl text-primary">
								{step.number}
							</div>
							<h3 className="mt-3 font-semibold text-base">{step.title}</h3>
							<p className="mt-2 text-muted-foreground text-sm leading-relaxed">
								{step.description}
							</p>
						</li>
					))}
				</ol>
			</div>
		</section>
	);
}
