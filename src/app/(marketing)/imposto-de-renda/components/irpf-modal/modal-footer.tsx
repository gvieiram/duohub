"use client";

import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useMessages } from "@/stores/use-content-store";
import {
	useIrpfModalActions,
	useIrpfModalStore,
} from "@/stores/use-irpf-modal-store";
import { PrivacyDialog } from "../privacy-dialog";

type ModalFooterProps = {
	step: 1 | 2;
	isPending: boolean;
	consentError?: string;
	onContinue: () => void;
	onBack: () => void;
	onSubmit: () => void;
};

export function ModalFooter({
	step,
	isPending,
	consentError,
	onContinue,
	onBack,
	onSubmit,
}: ModalFooterProps) {
	const { modal } = useMessages().ir;
	const consent = useIrpfModalStore((s) => s.formData.consent);
	const { updateFormData } = useIrpfModalActions();

	const consentId = "irpf-modal-consent";

	if (step === 2) {
		return (
			<div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
				<Button
					type="button"
					variant="ghost"
					onClick={onBack}
					disabled={isPending}
					className="sm:mr-auto"
				>
					<ArrowLeft aria-hidden className="size-4" />
					{modal.buttons.back}
				</Button>
				<Button
					type="button"
					variant="outline"
					onClick={onSubmit}
					disabled={isPending}
				>
					{modal.buttons.skipAndSubmit}
				</Button>
				<Button type="button" onClick={onSubmit} disabled={isPending}>
					{isPending ? (
						<>
							<Loader2 aria-hidden className="size-4 animate-spin" />
							{modal.buttons.submitting}
						</>
					) : (
						modal.buttons.submit
					)}
				</Button>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
			<div className="flex flex-col gap-1">
				<label
					htmlFor={consentId}
					className="flex cursor-pointer items-center gap-2 text-muted-foreground text-xs leading-snug"
				>
					<Checkbox
						id={consentId}
						checked={consent}
						onCheckedChange={(value) =>
							updateFormData({ consent: value === true })
						}
						aria-invalid={!!consentError}
						aria-describedby={consentError ? "irpf-consent-error" : undefined}
					/>
					<span>
						{modal.consentFooter.prefix}{" "}
						<PrivacyDialog
							trigger={
								<button
									type="button"
									className="font-medium text-primary underline-offset-2 hover:underline"
								>
									{modal.consentFooter.linkLabel}
								</button>
							}
						/>{" "}
						{modal.consentFooter.suffix}
					</span>
				</label>
				{consentError ? (
					<p
						id="irpf-consent-error"
						role="alert"
						className="text-destructive text-xs"
					>
						{consentError}
					</p>
				) : null}
			</div>

			<Button
				type="button"
				onClick={onContinue}
				disabled={isPending}
				className="sm:min-w-[140px] sm:shrink-0"
			>
				{modal.buttons.continue}
				<ArrowRight aria-hidden className="size-4" />
			</Button>
		</div>
	);
}
