"use client";

import { useEffect } from "react";

/**
 * Adds `theme-admin` to <body> while the admin shell is mounted so that
 * portal-rendered overlays (Sheet, Dialog, Dropdown, Popover) inherit the
 * admin palette. A wrapping `<div className="theme-admin">` does not work
 * because Radix portals mount under `document.body`, outside of any layout
 * subtree.
 */
export function AdminThemeMount() {
	useEffect(() => {
		document.body.classList.add("theme-admin");
		return () => {
			document.body.classList.remove("theme-admin");
		};
	}, []);

	return null;
}
