import Link from "next/link";

import { Logo } from "@/components/logo";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarHeader,
} from "@/components/ui/sidebar";
import { AdminSidebarNav } from "./admin-sidebar-nav";

export function AdminSidebar() {
	return (
		<Sidebar>
			<SidebarHeader className="flex h-16 items-center border-b px-4">
				<Link href="/admin" className="flex items-center gap-2">
					<Logo animated={false} />
				</Link>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<AdminSidebarNav />
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}
