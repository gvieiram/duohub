"use client";

import { cn } from "@/lib/utils";
import { useMessages } from "@/stores/use-content-store";
import type { IrpfModalStep } from "@/stores/use-irpf-modal-store";

type StepLabelsProps = {
	currentStep: IrpfModalStep;
};

export function StepLabels({ currentStep }: StepLabelsProps) {
	const { modal } = useMessages().irpf;

	const steps: {
		step: IrpfModalStep;
		label: string;
		optional?: boolean;
	}[] = [
		{ step: 1, label: modal.stepLabels.contact },
		{ step: 2, label: modal.stepLabels.qualification, optional: true },
	];

	return (
		<ol
			aria-label={`Passo ${currentStep} de ${steps.length}`}
			className="flex items-center gap-3 text-sm"
		>
			{steps.map((item, idx) => {
				const isActive = item.step === currentStep;
				const isCompleted = item.step < currentStep;

				return (
					<li
						key={item.step}
						className={cn(
							"flex items-center gap-3",
							idx > 0 && "before:h-px before:w-6 before:bg-border",
						)}
					>
						<span
							className={cn(
								"flex items-center gap-2 font-medium",
								isActive && "text-foreground",
								!isActive && !isCompleted && "text-muted-foreground",
								isCompleted && "text-muted-foreground",
							)}
						>
							<span
								aria-hidden
								className={cn(
									"inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs transition-colors",
									isActive &&
										"border-primary bg-primary text-primary-foreground",
									isCompleted && "border-primary/40 bg-primary/10 text-primary",
									!isActive &&
										!isCompleted &&
										"border-border bg-transparent text-muted-foreground",
								)}
							>
								{item.step}
							</span>
							<span>
								{item.label}
								{item.optional ? (
									<span className="ml-1.5 font-normal text-muted-foreground text-xs">
										({modal.stepLabels.optionalBadge})
									</span>
								) : null}
							</span>
						</span>
					</li>
				);
			})}
		</ol>
	);
}
