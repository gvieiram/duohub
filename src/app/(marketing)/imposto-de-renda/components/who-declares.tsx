"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMessages } from "@/stores/use-content-store";
import { FadeIn, fadeUpItemVariants, StaggerGroup } from "./_animations";

export function WhoDeclares() {
	const m = useMessages().ir.whoDeclares;
	const [open, setOpen] = useState(false);
	const shouldReduceMotion = useReducedMotion();

	return (
		<section id="quem-declara" className="border-b py-16 md:py-24">
			<div className="mx-auto max-w-4xl px-4">
				<FadeIn>
					<SectionHeader badge={m.badge} title={m.title} intro={m.intro} />
				</FadeIn>

				<StaggerGroup className="mt-10 grid gap-4 md:grid-cols-3">
					{m.primary.map((c) => (
						<motion.div
							key={c.title}
							variants={fadeUpItemVariants}
							className="rounded-xl border bg-card p-6"
						>
							<h3 className="font-semibold text-base">{c.title}</h3>
							<p className="mt-2 text-muted-foreground text-sm leading-relaxed">
								{c.description}
							</p>
						</motion.div>
					))}
				</StaggerGroup>

				<FadeIn className="mt-8" delay={0.05}>
					<Button
						variant="outline"
						size="sm"
						onClick={() => setOpen((v) => !v)}
						className="gap-2"
						aria-expanded={open}
					>
						{m.showAllLabel}
						<ChevronDown
							className={cn(
								"size-4 transition-transform",
								open && "rotate-180",
							)}
						/>
					</Button>

					<AnimatePresence initial={false}>
						{open && (
							<motion.ul
								key="secondary-list"
								initial={
									shouldReduceMotion
										? { opacity: 0 }
										: { opacity: 0, height: 0 }
								}
								animate={
									shouldReduceMotion
										? { opacity: 1 }
										: { opacity: 1, height: "auto" }
								}
								exit={
									shouldReduceMotion
										? { opacity: 0 }
										: { opacity: 0, height: 0 }
								}
								transition={{
									duration: 0.35,
									ease: [0.16, 1, 0.3, 1],
								}}
								className="mt-6 grid gap-2 overflow-hidden text-muted-foreground text-sm"
							>
								{m.secondary.map((s) => (
									<li key={s} className="flex gap-2">
										<span aria-hidden>•</span>
										<span>{s}</span>
									</li>
								))}
							</motion.ul>
						)}
					</AnimatePresence>
				</FadeIn>
			</div>
		</section>
	);
}

function SectionHeader({
	badge,
	title,
	intro,
}: {
	badge: string;
	title: string;
	intro?: string;
}) {
	return (
		<div className="max-w-2xl">
			<span className="inline-block border-primary/40 border-l-2 pl-3 text-highlight text-sm">
				{badge}
			</span>
			<h2 className="mt-3 font-heading text-3xl tracking-tight md:text-4xl">
				{title}
			</h2>
			{intro && (
				<p className="mt-3 text-muted-foreground leading-relaxed">{intro}</p>
			)}
		</div>
	);
}
