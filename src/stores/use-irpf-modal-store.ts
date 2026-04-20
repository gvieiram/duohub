"use client";

import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import type {
	LeadComplexity,
	LeadMoment,
	LeadSituation,
} from "@/features/leads/schemas";

export type IrpfModalStep = 1 | 2;

export type IrpfModalFormData = {
	name: string;
	email: string;
	whatsapp: string;
	situation: LeadSituation | null;
	complexity: LeadComplexity[];
	moment: LeadMoment | null;
	consent: boolean;
};

export const EMPTY_IRPF_FORM_DATA: IrpfModalFormData = {
	name: "",
	email: "",
	whatsapp: "",
	situation: null,
	complexity: [],
	moment: null,
	consent: false,
};

type IrpfModalState = {
	isOpen: boolean;
	step: IrpfModalStep;
	formData: IrpfModalFormData;
	submittedInSession: boolean;
	hydratedFromStorage: boolean;
	open: () => void;
	close: () => void;
	setStep: (step: IrpfModalStep) => void;
	updateFormData: (patch: Partial<IrpfModalFormData>) => void;
	markSubmitted: () => void;
	reset: () => void;
	hydrateFromStorage: (data: Partial<IrpfModalFormData> | null) => void;
};

export const useIrpfModalStore = create<IrpfModalState>((set) => ({
	isOpen: false,
	step: 1,
	formData: { ...EMPTY_IRPF_FORM_DATA },
	submittedInSession: false,
	hydratedFromStorage: false,

	open: () => set({ isOpen: true }),
	close: () => set({ isOpen: false }),
	setStep: (step) => set({ step }),
	updateFormData: (patch) =>
		set((state) => ({ formData: { ...state.formData, ...patch } })),
	markSubmitted: () =>
		set({
			submittedInSession: true,
			formData: { ...EMPTY_IRPF_FORM_DATA },
		}),
	reset: () =>
		set({
			step: 1,
			formData: { ...EMPTY_IRPF_FORM_DATA },
			submittedInSession: false,
		}),
	hydrateFromStorage: (data) => {
		if (!data) {
			set({ hydratedFromStorage: true });
			return;
		}
		set((state) => ({
			hydratedFromStorage: true,
			formData: { ...state.formData, ...data },
		}));
	},
}));

export function useIrpfModalIsOpen() {
	return useIrpfModalStore((s) => s.isOpen);
}

export function useIrpfModalStep() {
	return useIrpfModalStore((s) => s.step);
}

export function useIrpfModalFormData() {
	return useIrpfModalStore((s) => s.formData);
}

export function useIrpfModalSubmitted() {
	return useIrpfModalStore((s) => s.submittedInSession);
}

export function useIrpfModalActions() {
	return useIrpfModalStore(
		useShallow((s) => ({
			open: s.open,
			close: s.close,
			setStep: s.setStep,
			updateFormData: s.updateFormData,
			markSubmitted: s.markSubmitted,
			reset: s.reset,
		})),
	);
}
