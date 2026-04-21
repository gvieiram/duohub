"use client";

import type { ComponentProps, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useIrpfModalActions } from "@/stores/use-irpf-modal-store";

type TriggerButtonProps = Omit<ComponentProps<typeof Button>, "onClick"> & {
	children: ReactNode;
};

export function IrpfModalTrigger({
	children,
	...buttonProps
}: TriggerButtonProps) {
	const { open } = useIrpfModalActions();

	return (
		<Button type="button" onClick={open} {...buttonProps}>
			{children}
		</Button>
	);
}
