"use client";

import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompany, useMessages } from "@/stores/use-content-store";
import { useIrpfModalActions } from "@/stores/use-irpf-modal-store";

export function SuccessView() {
	const { modal } = useMessages().irpf;
	const company = useCompany();
	const { close } = useIrpfModalActions();

	const whatsappHref = company.links.whatsappUrl(modal.success.whatsappMessage);

	return (
		<div className="flex flex-col items-center gap-6 py-4 text-center">
			<div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
				<CheckCircle2 aria-hidden className="size-8" />
			</div>

			<div className="flex flex-col gap-2">
				<h2 className="font-heading text-2xl text-foreground">
					{modal.success.title}
				</h2>
				<p className="max-w-md text-muted-foreground text-sm">
					{modal.success.description}
				</p>
			</div>

			<Button asChild size="lg" className="w-full sm:w-auto">
				<a
					href={whatsappHref}
					target="_blank"
					rel="noopener noreferrer"
					onClick={close}
				>
					{modal.success.whatsappCta}
				</a>
			</Button>

			<div className="w-full rounded-md border border-border bg-muted/30 p-4 text-left">
				<p className="mb-3 font-medium text-foreground text-sm">
					{modal.success.secondaryTitle}
				</p>
				<ul className="flex flex-col gap-2">
					{modal.success.secondaryLinks.map((link) => (
						<li key={link.href}>
							<a
								href={link.href}
								onClick={close}
								className="inline-flex items-center gap-1.5 text-primary text-sm underline-offset-4 hover:underline"
							>
								{link.label}
								<ArrowUpRight aria-hidden className="size-3.5" />
							</a>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}
