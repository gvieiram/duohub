"use client";

import { Info } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type {
	LeadComplexity,
	LeadMoment,
	LeadSituation,
} from "@/features/leads/schemas";
import { cn } from "@/lib/utils";
import { useMessages } from "@/stores/use-content-store";
import {
	type IrpfModalFormData,
	useIrpfModalStore,
} from "@/stores/use-irpf-modal-store";

export function StepQualification() {
	const { modal } = useMessages().ir;
	const formData = useIrpfModalStore((s) => s.formData);
	const updateFormData = useIrpfModalStore((s) => s.updateFormData);

	const handleSituationChange = (value: string) => {
		updateFormData({ situation: value as IrpfModalFormData["situation"] });
	};

	const handleMomentChange = (value: string) => {
		updateFormData({ moment: value as IrpfModalFormData["moment"] });
	};

	const toggleComplexity = (value: LeadComplexity, checked: boolean) => {
		const current = formData.complexity;
		const next = checked
			? Array.from(new Set([...current, value]))
			: current.filter((item) => item !== value);
		updateFormData({ complexity: next });
	};

	return (
		<div className="flex flex-col gap-7 text-left">
			<header className="flex flex-col gap-1">
				<h2 className="font-heading text-2xl text-foreground">
					{modal.step2.title}
				</h2>
				<p className="text-muted-foreground text-sm">
					{modal.step2.description}
				</p>
			</header>

			<div className="flex items-start gap-2 rounded-md border border-primary/20 bg-primary/5 p-3 text-foreground/80 text-sm">
				<Info aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
				<p>{modal.step2.skipHint}</p>
			</div>

			<fieldset className="grid gap-3">
				<Label htmlFor="irpf-modal-situation" className="font-medium">
					{modal.step2.situation.label}
				</Label>
				<Select
					value={formData.situation ?? undefined}
					onValueChange={handleSituationChange}
				>
					<SelectTrigger id="irpf-modal-situation" className="w-full">
						<SelectValue placeholder={modal.step2.situation.placeholder} />
					</SelectTrigger>
					<SelectContent>
						{modal.step2.situation.options.map((opt) => (
							<SelectItem key={opt.value} value={opt.value}>
								{opt.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</fieldset>

			<fieldset className="grid gap-3">
				<div className="flex flex-col gap-0.5">
					<legend className="font-medium text-sm">
						{modal.step2.complexity.label}
					</legend>
					<p className="text-muted-foreground text-xs">
						{modal.step2.complexity.helper}
					</p>
				</div>

				<div className="grid gap-2 sm:grid-cols-2">
					{modal.step2.complexity.options.map((opt) => {
						const value = opt.value as LeadComplexity;
						const checked = formData.complexity.includes(value);
						const id = `irpf-complex-${opt.value.toLowerCase()}`;

						return (
							<label
								key={opt.value}
								htmlFor={id}
								className={cn(
									"flex cursor-pointer items-start gap-2 rounded-md border p-3 text-sm transition-colors",
									"hover:bg-muted/60",
									checked
										? "border-primary/40 bg-primary/5"
										: "border-border bg-card",
								)}
							>
								<Checkbox
									id={id}
									checked={checked}
									onCheckedChange={(next) =>
										toggleComplexity(value, next === true)
									}
									className="mt-0.5"
								/>
								<span className="leading-snug">{opt.label}</span>
							</label>
						);
					})}
				</div>
			</fieldset>

			<fieldset className="grid gap-3">
				<Label htmlFor="irpf-modal-moment" className="font-medium">
					{modal.step2.moment.label}
				</Label>
				<Select
					value={formData.moment ?? undefined}
					onValueChange={handleMomentChange}
				>
					<SelectTrigger id="irpf-modal-moment" className="w-full">
						<SelectValue placeholder={modal.step2.moment.placeholder} />
					</SelectTrigger>
					<SelectContent>
						{modal.step2.moment.options.map((opt) => (
							<SelectItem key={opt.value} value={opt.value}>
								{opt.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</fieldset>
		</div>
	);
}

export type { LeadComplexity, LeadMoment, LeadSituation };
