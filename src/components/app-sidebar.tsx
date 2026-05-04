"use client";

import {
	Building2Icon,
	LayoutDashboardIcon,
	Settings2Icon,
	UsersIcon,
} from "lucide-react";
import Link from "next/link";
import type * as React from "react";

import { Logo } from "@/components/logo";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarTrigger,
	useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useMessages } from "@/stores/use-content-store";

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
	user: {
		email: string;
		name: string | null;
	};
};

export function AppSidebar({ user, ...props }: AppSidebarProps) {
	const messages = useMessages();

	const data = {
		navMain: [
			{
				title: messages.admin.nav.dashboard,
				url: "/admin",
				icon: LayoutDashboardIcon,
			},
			{
				title: messages.admin.nav.clients,
				url: "/admin/clients",
				icon: Building2Icon,
			},
			{
				title: messages.admin.nav.users,
				url: "/admin/users",
				icon: UsersIcon,
			},
		],
		navSecondary: [
			{
				title: messages.admin.nav.settings,
				url: "/admin/settings",
				icon: Settings2Icon,
			},
		],
	};

	return (
		<Sidebar variant="inset" collapsible="icon" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarHeaderBrand />
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={data.navMain} />
				<NavSecondary items={data.navSecondary} className="mt-auto" />
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={user} />
			</SidebarFooter>
		</Sidebar>
	);
}

/**
 * Sidebar header that switches between two layouts:
 * - expanded: logo (with wordmark) and the collapse trigger side by side
 * - collapsed: icon-only logo with the trigger stacked below it
 *
 * The trigger lives inside the sidebar (not the page header) so it stays
 * reachable in both states.
 */
function SidebarHeaderBrand() {
	const { state } = useSidebar();
	const isCollapsed = state === "collapsed";

	return (
		<div
			className={cn("flex items-center gap-2", isCollapsed && "flex-col gap-1")}
		>
			<SidebarMenuButton size="lg" asChild className="flex-1">
				<Link href="/admin">
					<Logo
						animated={false}
						showSubtitle={false}
						iconOnly={isCollapsed}
						size="sm"
						className="gap-2"
					/>
				</Link>
			</SidebarMenuButton>
			<SidebarTrigger className="size-8 shrink-0" />
		</div>
	);
}
