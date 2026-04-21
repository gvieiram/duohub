"use client";

import type { ReactNode } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import { useIsDesktop } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

type ResponsiveDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: ReactNode;
	description?: ReactNode;
	children: ReactNode;
	footer?: ReactNode;
	header?: ReactNode;
	contentClassName?: string;
	bodyClassName?: string;
	footerClassName?: string;
	/**
	 * Visually hides the default title/description (keeping it in the a11y
	 * tree) so a custom header can be rendered via `header`.
	 */
	hideDefaultTitle?: boolean;
};

function DesktopDialog(props: ResponsiveDialogProps) {
	const {
		open,
		onOpenChange,
		title,
		description,
		children,
		footer,
		header,
		contentClassName,
		bodyClassName,
		footerClassName,
		hideDefaultTitle,
	} = props;

	const srOnlyTitle = hideDefaultTitle || Boolean(header);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className={cn(
					"flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl",
					contentClassName,
				)}
			>
				{header}
				<DialogHeader
					className={cn(
						"shrink-0 border-b p-6 pr-12 text-left",
						srOnlyTitle && "sr-only",
					)}
				>
					<DialogTitle className="font-heading text-2xl">{title}</DialogTitle>
					{description ? (
						<DialogDescription>{description}</DialogDescription>
					) : null}
				</DialogHeader>

				<div
					className={cn(
						"min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5",
						bodyClassName,
					)}
				>
					{children}
				</div>

				{footer ? (
					<div className={cn("shrink-0 border-t bg-card p-4", footerClassName)}>
						{footer}
					</div>
				) : null}
			</DialogContent>
		</Dialog>
	);
}

function MobileDrawer(props: ResponsiveDialogProps) {
	const {
		open,
		onOpenChange,
		title,
		description,
		children,
		footer,
		header,
		contentClassName,
		bodyClassName,
		footerClassName,
		hideDefaultTitle,
	} = props;

	const srOnlyTitle = hideDefaultTitle || Boolean(header);

	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			<DrawerContent
				className={cn("max-h-[92vh] outline-none", contentClassName)}
			>
				{header}
				<DrawerHeader
					className={cn(
						"shrink-0 border-b text-left",
						srOnlyTitle && "sr-only",
					)}
				>
					<DrawerTitle className="font-heading text-xl">{title}</DrawerTitle>
					{description ? (
						<DrawerDescription>{description}</DrawerDescription>
					) : null}
				</DrawerHeader>

				<div
					className={cn(
						"min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5",
						bodyClassName,
					)}
				>
					{children}
				</div>

				{footer ? (
					<div
						className={cn(
							"shrink-0 border-t bg-card p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]",
							footerClassName,
						)}
					>
						{footer}
					</div>
				) : null}
			</DrawerContent>
		</Drawer>
	);
}

export function ResponsiveDialog(props: ResponsiveDialogProps) {
	const isDesktop = useIsDesktop();

	if (isDesktop) {
		return <DesktopDialog {...props} />;
	}

	return <MobileDrawer {...props} />;
}
