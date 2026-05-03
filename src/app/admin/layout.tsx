import type { Metadata } from "next";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { requireAdmin } from "@/lib/auth/helpers";
import { AdminHeader } from "./_components/admin-header";
import { AdminSidebar } from "./_components/admin-sidebar";

export const metadata: Metadata = {
	robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await requireAdmin();

	return (
		<SidebarProvider>
			<AdminSidebar />
			<SidebarInset>
				<AdminHeader
					user={{
						email: session.user.email,
						name: session.user.name ?? null,
					}}
				/>
				<main className="flex-1 px-6 py-8">{children}</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
