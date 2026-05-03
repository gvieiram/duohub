"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useMessages } from "@/stores/use-content-store";
import { ADMIN_NAV_ITEMS, type AdminNavItem } from "./nav-items";

export function AdminSidebarNav() {
	const pathname = usePathname();
	const { admin } = useMessages();

	return (
		<SidebarMenu>
			{ADMIN_NAV_ITEMS.map((item) => (
				<NavLink
					key={item.key}
					item={item}
					isActive={isActive(pathname, item.href)}
					label={admin.nav[item.key]}
				/>
			))}
		</SidebarMenu>
	);
}

function NavLink({
	item,
	isActive,
	label,
}: {
	item: AdminNavItem;
	isActive: boolean;
	label: string;
}) {
	const Icon = item.icon;
	return (
		<SidebarMenuItem>
			<SidebarMenuButton asChild isActive={isActive}>
				<Link href={item.href}>
					<Icon />
					<span>{label}</span>
				</Link>
			</SidebarMenuButton>
		</SidebarMenuItem>
	);
}

function isActive(pathname: string, href: string): boolean {
	if (href === "/admin") return pathname === "/admin";
	return pathname === href || pathname.startsWith(`${href}/`);
}
