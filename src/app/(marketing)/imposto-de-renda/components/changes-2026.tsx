"use client";

import { Receipt, Sparkles, Wallet } from "lucide-react";
import { useMessages } from "@/stores/use-content-store";

const ICONS = [Sparkles, Wallet, Receipt] as const;

export function Changes2026() {
	const m = useMessages().ir.changes2026;

	return (
		<section
			id="mudancas-2026"
			className="border-b bg-muted/30 py-16 md:py-24"
		>
			<div className="mx-auto max-w-4xl px-4">
				<SectionHeader badge={m.badge} title={m.title} />
				<div className="mt-10 grid gap-4 md:grid-cols-3">
					{m.items.map((item, idx) => {
						const Icon = ICONS[idx] ?? Sparkles;
						return (
							<div
								key={item.title}
								className="rounded-xl border bg-card p-6"
							>
								<div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
									<Icon className="size-5 text-primary" aria-hidden />
								</div>
								<h3 className="mt-4 font-semibold text-base">{item.title}</h3>
								<p className="mt-2 text-muted-foreground text-sm leading-relaxed">
									{item.description}
								</p>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}

function SectionHeader({ badge, title }: { badge: string; title: string }) {
	return (
		<div className="max-w-2xl">
			<span className="inline-block border-primary/40 border-l-2 pl-3 text-highlight text-sm">
				{badge}
			</span>
			<h2 className="mt-3 font-heading text-3xl tracking-tight md:text-4xl">
				{title}
			</h2>
		</div>
	);
}
