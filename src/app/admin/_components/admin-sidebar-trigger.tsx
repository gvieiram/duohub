"use client";

import { PanelLeftIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { useMessages } from "@/stores/use-content-store";

/**
 * Localized sidebar toggle for the admin shell.
 *
 * Replaces the stock shadcn `<SidebarTrigger>` which ships with a hardcoded
 * English `<span class="sr-only">Toggle Sidebar</span>`. We reuse the
 * underlying `useSidebar()` hook so the behaviour stays identical, but pull
 * the screen-reader label from the pt-BR content store.
 */
export function AdminSidebarTrigger() {
	const { toggleSidebar } = useSidebar();
	const { admin } = useMessages();

	return (
		<Button
			data-sidebar="trigger"
			data-slot="sidebar-trigger"
			variant="ghost"
			size="icon"
			className="size-7"
			aria-label={admin.shell.toggleSidebar}
			onClick={toggleSidebar}
		>
			<PanelLeftIcon />
			<span className="sr-only">{admin.shell.toggleSidebar}</span>
		</Button>
	);
}
