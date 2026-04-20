"use client";

import { motion } from "framer-motion";
import { useMessages } from "@/stores/use-content-store";
import { LeadForm } from "./lead-form";

type Props = {
	utm?: {
		source?: string | null;
		medium?: string | null;
		campaign?: string | null;
	};
};

export function Hero({ utm }: Props) {
	const m = useMessages().ir.hero;

	return (
		<section
			id="hero"
			className="border-b bg-gradient-to-b from-background to-muted/30 py-16 md:py-24"
		>
			<div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-[1fr_400px] lg:gap-12">
				<div className="flex flex-col justify-center">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4 }}
					>
						<span className="inline-block rounded border-primary/40 border-l-2 pl-3 text-highlight text-sm">
							{m.badge}
						</span>
					</motion.div>

					<motion.h1
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4, delay: 0.1 }}
						className="mt-4 font-heading text-4xl tracking-tight md:text-5xl lg:text-6xl"
					>
						{m.title}
					</motion.h1>

					<motion.p
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4, delay: 0.2 }}
						className="mt-4 max-w-xl text-lg text-muted-foreground leading-relaxed"
					>
						{m.subtitle}
					</motion.p>

					<motion.ul
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4, delay: 0.3 }}
						className="mt-6 flex flex-col gap-2 text-sm"
					>
						{m.bullets.map((b) => (
							<li key={b} className="flex items-center gap-2">
								<span
									aria-hidden
									className="h-1.5 w-1.5 rounded-full bg-primary"
								/>
								{b}
							</li>
						))}
					</motion.ul>
				</div>

				<aside className="lg:sticky lg:top-24 lg:self-start">
					<LeadForm variant="hero" utm={utm} />
				</aside>
			</div>
		</section>
	);
}
