"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { ScrollableDialog } from "@/components/scrollable-dialog";
import { Button } from "@/components/ui/button";
import { useMessages } from "@/stores/use-content-store";

type PrivacyDialogProps = {
	trigger?: ReactNode;
};

export function PrivacyDialog({ trigger }: PrivacyDialogProps = {}) {
	const m = useMessages().ir.form.privacy;
	const [open, setOpen] = useState(false);

	const fallbackTrigger = (
		<button
			type="button"
			className="text-left underline underline-offset-2 transition-colors hover:text-foreground"
		>
			{m.trigger}
		</button>
	);

	return (
		<ScrollableDialog
			open={open}
			onOpenChange={setOpen}
			trigger={trigger ?? fallbackTrigger}
			title={m.title}
			description={m.lastUpdated}
			footer={
				<Button type="button" variant="outline" onClick={() => setOpen(false)}>
					{m.closeLabel}
				</Button>
			}
		>
			<div className="space-y-5 text-sm leading-relaxed">
				{m.sections.map((section) => (
					<section key={section.heading}>
						<h3 className="font-semibold text-foreground">{section.heading}</h3>
						<p className="mt-1 text-muted-foreground">{section.body}</p>
					</section>
				))}
			</div>
		</ScrollableDialog>
	);
}
