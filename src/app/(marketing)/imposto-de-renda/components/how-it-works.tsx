"use client";

import { motion } from "framer-motion";
import { useMessages } from "@/stores/use-content-store";
import { FadeIn, fadeUpItemVariants, StaggerGroup } from "./_animations";

export function HowItWorks() {
	const m = useMessages().ir.howItWorks;

	return (
		<section id="como-funciona" className="border-b py-16 md:py-24">
			<div className="mx-auto max-w-5xl px-4">
				<FadeIn>
					<div className="max-w-2xl">
						<span className="inline-block border-primary/40 border-l-2 pl-3 text-highlight text-sm">
							{m.badge}
						</span>
						<h2 className="mt-3 font-heading text-3xl tracking-tight md:text-4xl">
							{m.title}
						</h2>
					</div>
				</FadeIn>

				<StaggerGroup as="ol" className="mt-10 grid gap-6 md:grid-cols-4">
					{m.steps.map((step) => (
						<motion.li
							key={step.number}
							variants={fadeUpItemVariants}
							whileHover={{ y: -4 }}
							transition={{ duration: 0.2, ease: "easeOut" }}
							className="rounded-xl border bg-card p-6"
						>
							<div className="font-heading text-2xl text-primary">
								{step.number}
							</div>
							<h3 className="mt-3 font-semibold text-base">{step.title}</h3>
							<p className="mt-2 text-muted-foreground text-sm leading-relaxed">
								{step.description}
							</p>
						</motion.li>
					))}
				</StaggerGroup>
			</div>
		</section>
	);
}
