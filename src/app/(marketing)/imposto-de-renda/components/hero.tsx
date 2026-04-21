"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useMessages } from "@/stores/use-content-store";
import { HeroIllustration } from "./hero-illustration";
import { IrpfModalTrigger } from "./irpf-modal/trigger-button";

export function Hero() {
	const { hero, modal } = useMessages().ir;

	return (
		<section
			id="hero"
			className="border-b bg-gradient-to-b from-background to-muted/30 py-16 md:py-24"
		>
			<div className="mx-auto grid max-w-6xl items-center gap-12 px-4 lg:grid-cols-[1fr_420px]">
				<div className="flex flex-col justify-center">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4 }}
					>
						<span className="inline-block rounded border-primary/40 border-l-2 pl-3 text-highlight text-sm">
							{hero.badge}
						</span>
					</motion.div>

					<motion.h1
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4, delay: 0.1 }}
						className="mt-4 font-heading text-4xl tracking-tight md:text-5xl lg:text-6xl"
					>
						{hero.title}
					</motion.h1>

					<motion.p
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4, delay: 0.2 }}
						className="mt-4 max-w-xl text-lg text-muted-foreground leading-relaxed"
					>
						{hero.subtitle}
					</motion.p>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4, delay: 0.3 }}
						className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
					>
						<IrpfModalTrigger size="lg" className="gap-2 sm:w-auto">
							{modal.trigger.primary}
							<ArrowRight aria-hidden className="size-4" />
						</IrpfModalTrigger>
						{/* <span className="text-muted-foreground text-xs">
							Resposta em até 24h úteis — sem compromisso.
						</span> */}
					</motion.div>
				</div>

				<div className="mx-auto w-full max-w-[320px] sm:max-w-[400px] lg:max-w-none">
					<HeroIllustration />
				</div>
			</div>
		</section>
	);
}
