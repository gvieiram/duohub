"use client";

import { track } from "@vercel/analytics";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { createLead } from "@/features/leads/actions";
import { useMessages } from "@/stores/use-content-store";
import { useIrpfModalPersistence } from "@/stores/use-irpf-modal-persistence";
import {
	useIrpfModalActions,
	useIrpfModalStore,
} from "@/stores/use-irpf-modal-store";
import { ModalFooter } from "./modal-footer";
import { StepContact, type StepContactHandle } from "./step-contact";
import { StepLabels } from "./step-labels";
import { StepQualification } from "./step-qualification";
import { SuccessView } from "./success-view";

type Utm = {
	source?: string | null;
	medium?: string | null;
	campaign?: string | null;
};

type Props = {
	utm?: Utm;
};

export function IrpfModal({ utm }: Props) {
	const { modal } = useMessages().ir;
	const isOpen = useIrpfModalStore((s) => s.isOpen);
	const step = useIrpfModalStore((s) => s.step);
	const submitted = useIrpfModalStore((s) => s.submittedInSession);
	const formData = useIrpfModalStore((s) => s.formData);
	const { close, setStep, markSubmitted, reset } = useIrpfModalActions();

	const [isPending, startTransition] = useTransition();
	const [consentError, setConsentError] = useState<string>();
	const contactRef = useRef<StepContactHandle>(null);
	const shouldReduceMotion = useReducedMotion();

	useIrpfModalPersistence();

	useEffect(() => {
		if (!isOpen) setConsentError(undefined);
	}, [isOpen]);

	useEffect(() => {
		if (!isOpen && submitted) {
			const timeout = window.setTimeout(() => reset(), 400);
			return () => window.clearTimeout(timeout);
		}
	}, [isOpen, submitted, reset]);

	const handleOpenChange = (nextOpen: boolean) => {
		if (!nextOpen) close();
	};

	const requireConsent = (): boolean => {
		if (formData.consent) {
			setConsentError(undefined);
			return true;
		}
		setConsentError("É necessário aceitar a política de privacidade");
		return false;
	};

	const handleContinue = async () => {
		if (!contactRef.current) return;
		if (!requireConsent()) return;
		const ok = await contactRef.current.submit();
		if (!ok) return;
		setStep(2);
	};

	const handleBack = () => {
		setStep(1);
		setConsentError(undefined);
	};

	const handleSubmit = () => {
		if (!requireConsent()) return;

		const fd = new FormData();
		fd.set("name", formData.name);
		fd.set("email", formData.email);
		fd.set("whatsapp", formData.whatsapp);
		if (formData.situation) fd.set("situation", formData.situation);
		for (const value of formData.complexity) {
			fd.append("complexity", value);
		}
		if (formData.moment) fd.set("moment", formData.moment);
		fd.set("consent", "true");
		fd.set("honeypot", "");
		if (utm?.source) fd.set("utmSource", utm.source);
		if (utm?.medium) fd.set("utmMedium", utm.medium);
		if (utm?.campaign) fd.set("utmCampaign", utm.campaign);

		startTransition(async () => {
			const result = await createLead(fd);

			if (result.success) {
				track("ir_lead_submitted", {
					variant: "modal",
					hadSituation: Boolean(formData.situation),
					complexityCount: formData.complexity.length,
					hadMoment: Boolean(formData.moment),
				});
				markSubmitted();
				return;
			}

			if (result.reason === "rate_limit") {
				toast.error(modal.errors.rateLimit);
				return;
			}
			if (result.reason === "validation") {
				const firstError = Object.values(result.errors)[0]?.[0];
				toast.error(firstError ?? modal.errors.server);
				return;
			}
			toast.error(modal.errors.server);
		});
	};

	const fadeProps = shouldReduceMotion
		? {
				initial: { opacity: 1 },
				animate: { opacity: 1 },
				exit: { opacity: 1 },
			}
		: {
				initial: { opacity: 0, y: 8 },
				animate: { opacity: 1, y: 0 },
				exit: { opacity: 0, y: -8 },
				transition: { duration: 0.25, ease: "easeOut" as const },
			};

	const title = submitted
		? modal.success.title
		: step === 1
			? modal.step1.title
			: modal.step2.title;

	const description = submitted
		? modal.success.description
		: step === 1
			? modal.step1.description
			: modal.step2.description;

	const showFooter = !submitted;

	return (
		<ResponsiveDialog
			open={isOpen}
			onOpenChange={handleOpenChange}
			title={title}
			description={description}
			hideDefaultTitle
			header={
				submitted ? null : (
					<div className="flex shrink-0 items-center justify-between border-b bg-card/40 px-6 py-4">
						<StepLabels currentStep={step} />
					</div>
				)
			}
			footer={
				showFooter ? (
					<ModalFooter
						step={step}
						isPending={isPending}
						consentError={consentError}
						onContinue={() => void handleContinue()}
						onBack={handleBack}
						onSubmit={handleSubmit}
					/>
				) : null
			}
			bodyClassName="px-6 py-6"
		>
			<AnimatePresence mode="wait" initial={false}>
				{submitted ? (
					<motion.div key="success" {...fadeProps}>
						<SuccessView />
					</motion.div>
				) : step === 1 ? (
					<motion.div key="step-1" {...fadeProps}>
						<StepContact ref={contactRef} consentError={undefined} />
					</motion.div>
				) : (
					<motion.div key="step-2" {...fadeProps}>
						<StepQualification />
					</motion.div>
				)}
			</AnimatePresence>
		</ResponsiveDialog>
	);
}
