import { BuildingIcon, LayoutDashboardIcon, UsersIcon } from "lucide-react";

export type AdminNavItem = {
	key: "dashboard" | "clients" | "users";
	href: string;
	icon: typeof LayoutDashboardIcon;
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
	{ key: "dashboard", href: "/admin", icon: LayoutDashboardIcon },
	{ key: "clients", href: "/admin/clients", icon: BuildingIcon },
	{ key: "users", href: "/admin/users", icon: UsersIcon },
];
