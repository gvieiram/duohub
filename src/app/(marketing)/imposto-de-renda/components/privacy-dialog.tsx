"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useMessages } from "@/stores/use-content-store";

export function PrivacyDialog() {
	const m = useMessages().ir.form.privacy;
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<button
					type="button"
					className="text-left underline underline-offset-2 transition-colors hover:text-foreground"
				>
					{m.trigger}
				</button>
			</DialogTrigger>
			<DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
				<DialogHeader>
					<DialogTitle className="font-heading text-2xl">{m.title}</DialogTitle>
					<DialogDescription>{m.lastUpdated}</DialogDescription>
				</DialogHeader>

				<div className="space-y-5 py-2 text-sm leading-relaxed">
					{m.sections.map((section) => (
						<section key={section.heading}>
							<h3 className="font-semibold text-foreground">
								{section.heading}
							</h3>
							<p className="mt-1 text-muted-foreground">{section.body}</p>
						</section>
					))}
				</div>

				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => setOpen(false)}
					>
						{m.closeLabel}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
