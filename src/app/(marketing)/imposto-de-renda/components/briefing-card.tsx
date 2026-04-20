"use client";

import {
	AnimatePresence,
	motion,
	useReducedMotion,
	type Variants,
} from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type BriefingRow =
	| {
			kind: "single";
			label: string;
			value: string;
	  }
	| {
			kind: "multi";
			label: string;
			items: { text: string; checked: boolean }[];
	  };

const ROWS: BriefingRow[] = [
	{
		kind: "single",
		label: "Situação",
		value: "CLT com renda de aluguel",
	},
	{
		kind: "multi",
		label: "Complexidade fiscal",
		items: [
			{ text: "Aluguel recebido", checked: true },
			{ text: "Dependentes", checked: true },
			{ text: "Ações e FIIs", checked: false },
		],
	},
	{
		kind: "single",
		label: "Momento",
		value: "Já declaro sozinho(a), quero ajuda",
	},
];

const containerVariants: Variants = {
	hidden: {},
	visible: {
		transition: { staggerChildren: 0.12, delayChildren: 0.3 },
	},
};

const rowVariants: Variants = {
	hidden: { opacity: 0, y: 8 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
	},
};

export function BriefingCard({ className }: { className?: string }) {
	const shouldReduceMotion = useReducedMotion();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	return (
		<div
			className={cn(
				"relative overflow-hidden rounded-xl border border-border bg-card/80 shadow-lg shadow-primary/5 backdrop-blur",
				className,
			)}
			aria-hidden
		>
			<div className="flex items-center justify-between border-border border-b bg-muted/40 px-5 py-3">
				<div className="flex items-center gap-2">
					<span className="flex gap-1.5">
						<span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
						<span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
						<span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
					</span>
					<span className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
						Briefing do cliente
					</span>
				</div>
				<Sparkles aria-hidden className="size-4 text-primary" />
			</div>

			<AnimatePresence mode="wait">
				{mounted ? (
					<motion.div
						key="rows"
						variants={containerVariants}
						initial={shouldReduceMotion ? undefined : "hidden"}
						animate="visible"
						className="flex flex-col gap-5 px-5 py-6"
					>
						{ROWS.map((row) => (
							<motion.div
								key={row.label}
								variants={shouldReduceMotion ? undefined : rowVariants}
								className="flex flex-col gap-1.5"
							>
								<span className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
									{row.label}
								</span>
								{row.kind === "single" ? (
									<p className="font-medium text-foreground text-sm">
										<span className="mr-2 text-primary">→</span>
										{row.value}
									</p>
								) : (
									<ul className="flex flex-col gap-1.5">
										{row.items.map((item) => (
											<li
												key={item.text}
												className={cn(
													"flex items-center gap-2 text-sm",
													item.checked
														? "text-foreground"
														: "text-muted-foreground/70",
												)}
											>
												<span
													className={cn(
														"flex h-4 w-4 items-center justify-center rounded border",
														item.checked
															? "border-primary bg-primary text-primary-foreground"
															: "border-muted-foreground/30",
													)}
												>
													{item.checked ? (
														<Check aria-hidden className="size-3" />
													) : null}
												</span>
												{item.text}
											</li>
										))}
									</ul>
								)}
							</motion.div>
						))}
					</motion.div>
				) : (
					<div className="h-[280px]" />
				)}
			</AnimatePresence>

			<div className="flex items-center gap-2 border-border border-t bg-muted/40 px-5 py-3 text-muted-foreground text-xs">
				<span
					aria-hidden
					className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"
				/>
				Analisado em até 24h úteis
			</div>
		</div>
	);
}
