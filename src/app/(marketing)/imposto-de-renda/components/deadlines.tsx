"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Calendar, CheckCircle2 } from "lucide-react";
import { useMessages } from "@/stores/use-content-store";
import { FadeIn, fadeUpItemVariants, StaggerGroup } from "./_animations";

export function Deadlines() {
	const m = useMessages().irpf.deadlines;

	return (
		<section id="prazos" className="border-b py-16 md:py-24">
			<div className="mx-auto max-w-4xl px-4">
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

				<StaggerGroup className="mt-10 grid gap-4 md:grid-cols-2">
					<motion.div
						variants={fadeUpItemVariants}
						className="rounded-xl border bg-card p-6"
					>
						<Calendar className="size-6 text-primary" aria-hidden />
						<h3 className="mt-3 font-semibold text-base">{m.window.title}</h3>
						<p className="mt-2 text-muted-foreground text-sm">
							{m.window.description}
						</p>
					</motion.div>

					<motion.div
						variants={fadeUpItemVariants}
						className="rounded-xl border bg-card p-6"
					>
						<CheckCircle2 className="size-6 text-highlight" aria-hidden />
						<h3 className="mt-3 font-semibold text-base">
							{m.refundBatches.title}
						</h3>
						<ul className="mt-2 flex flex-wrap gap-2 text-muted-foreground text-sm">
							{m.refundBatches.items.map((i) => (
								<li key={i} className="rounded border px-2 py-0.5">
									{i}
								</li>
							))}
						</ul>
						<p className="mt-2 text-muted-foreground text-xs">
							{m.refundBatches.caption}
						</p>
					</motion.div>
				</StaggerGroup>

				<FadeIn
					className="mt-6 rounded-xl border bg-destructive/5 p-6"
					delay={0.1}
				>
					<div className="flex items-start gap-3">
						<AlertTriangle
							className="size-6 shrink-0 text-destructive"
							aria-hidden
						/>
						<div>
							<h3 className="font-semibold text-base">{m.errors.title}</h3>
							<ul className="mt-2 space-y-1 text-muted-foreground text-sm">
								{m.errors.items.map((e) => (
									<li key={e} className="flex gap-2">
										<span aria-hidden>•</span>
										<span>{e}</span>
									</li>
								))}
							</ul>
							<p className="mt-3 text-muted-foreground text-sm leading-relaxed">
								{m.errors.consequence}
							</p>
						</div>
					</div>
				</FadeIn>
			</div>
		</section>
	);
}
