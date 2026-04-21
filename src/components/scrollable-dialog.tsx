"use client";

import type { ComponentProps, ReactNode } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type ScrollableDialogProps = {
	trigger: ReactNode;
	title: ReactNode;
	description?: ReactNode;
	children: ReactNode;
	footer?: ReactNode;
	contentClassName?: string;
	bodyClassName?: string;
} & Pick<
	ComponentProps<typeof Dialog>,
	"open" | "onOpenChange" | "defaultOpen"
>;

export function ScrollableDialog({
	trigger,
	title,
	description,
	children,
	footer,
	contentClassName,
	bodyClassName,
	...dialogProps
}: ScrollableDialogProps) {
	return (
		<Dialog {...dialogProps}>
			<DialogTrigger asChild>{trigger}</DialogTrigger>
			<DialogContent
				className={cn(
					"flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl",
					contentClassName,
				)}
			>
				<DialogHeader className="shrink-0 border-b p-6 pr-12 text-left">
					<DialogTitle className="font-heading text-2xl">{title}</DialogTitle>
					{description && <DialogDescription>{description}</DialogDescription>}
				</DialogHeader>

				<div
					className={cn(
						"min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5",
						bodyClassName,
					)}
				>
					{children}
				</div>

				{footer && (
					<div className="shrink-0 border-t p-4 sm:flex sm:justify-end sm:gap-2">
						{footer}
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
