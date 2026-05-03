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
} from "@/components/ui/sidebar";
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
		<Sidebar variant="inset" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild>
							<Link href="/admin">
								<Logo
									animated={false}
									showSubtitle={false}
									size="sm"
									className="gap-2"
								/>
							</Link>
						</SidebarMenuButton>
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
