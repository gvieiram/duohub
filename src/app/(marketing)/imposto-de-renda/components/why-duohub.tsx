"use client";

import { HeartHandshake, MessageCircle, Search, Users } from "lucide-react";
import { useMessages } from "@/stores/use-content-store";

const ICONS = [Users, Search, MessageCircle, HeartHandshake] as const;

export function WhyDuohub() {
	const m = useMessages().ir.whyDuohub;

	return (
		<section
			id="por-que-duohub"
			className="border-b bg-muted/30 py-16 md:py-24"
		>
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
					{m.pillars.map((p, idx) => {
						const Icon = ICONS[idx] ?? Users;
						return (
							<div key={p.title} className="flex gap-4">
								<div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
									<Icon className="size-5 text-primary" aria-hidden />
								</div>
								<div>
									<h3 className="font-heading text-lg">{p.title}</h3>
									<p className="mt-1 text-muted-foreground text-sm leading-relaxed">
										{p.description}
									</p>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}
