"use client";

import { motion } from "framer-motion";
import { Briefcase, Building2, LineChart, User } from "lucide-react";
import { useMessages } from "@/stores/use-content-store";

const ICONS = [User, Briefcase, LineChart, Building2] as const;

export function Situations() {
	const m = useMessages().ir.situations;

	return (
		<section id="situacoes" className="border-b py-16 md:py-24">
			<div className="mx-auto max-w-5xl px-4">
				<div className="max-w-2xl">
					<span className="inline-block border-primary/40 border-l-2 pl-3 text-highlight text-sm">
						{m.badge}
					</span>
					<h2 className="mt-3 font-heading text-3xl tracking-tight md:text-4xl">
						{m.title}
					</h2>
				</div>

				<div className="mt-10 grid gap-4 md:grid-cols-2">
					{m.cards.map((card, idx) => {
						const Icon = ICONS[idx] ?? User;
						return (
							<motion.div
								key={card.title}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true, amount: 0.3 }}
								transition={{ duration: 0.5, delay: idx * 0.08 }}
								className="rounded-xl border bg-card p-6"
							>
								<div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
									<Icon className="size-5 text-primary" aria-hidden />
								</div>
								<h3 className="mt-4 font-heading text-xl">{card.title}</h3>
								<p className="mt-2 text-muted-foreground text-sm leading-relaxed">
									{card.description}
								</p>
								<ul className="mt-4 space-y-1.5 text-muted-foreground text-sm">
									{card.triggers.map((t) => (
										<li key={t} className="flex gap-2">
											<span aria-hidden>•</span>
											<span>{t}</span>
										</li>
									))}
								</ul>
							</motion.div>
						);
					})}
				</div>
			</div>
		</section>
	);
}
