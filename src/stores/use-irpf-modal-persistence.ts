"use client";

import { useEffect } from "react";
import type { IrpfModalFormData } from "./use-irpf-modal-store";
import {
	EMPTY_IRPF_FORM_DATA,
	useIrpfModalStore,
} from "./use-irpf-modal-store";

const STORAGE_KEY = "irpf:lead-draft:v1";

type StoredDraft = {
	version: 1;
	formData?: Partial<IrpfModalFormData>;
	submitted?: boolean;
};

type HydrationPayload = {
	formData?: Partial<IrpfModalFormData>;
	submitted?: boolean;
};

function readDraft(): HydrationPayload | null {
	if (typeof window === "undefined") return null;
	try {
		const raw = window.sessionStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as StoredDraft;
		if (parsed.version !== 1) return null;
		return { formData: parsed.formData, submitted: parsed.submitted };
	} catch {
		return null;
	}
}

function writeDraft(payload: StoredDraft) {
	if (typeof window === "undefined") return;
	try {
		window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
	} catch {
		// storage may be full or disabled; fail silently
	}
}

function clearDraft() {
	if (typeof window === "undefined") return;
	try {
		window.sessionStorage.removeItem(STORAGE_KEY);
	} catch {
		// fail silently
	}
}

function isEmptyFormData(data: IrpfModalFormData) {
	return (
		data.name === EMPTY_IRPF_FORM_DATA.name &&
		data.email === EMPTY_IRPF_FORM_DATA.email &&
		data.whatsapp === EMPTY_IRPF_FORM_DATA.whatsapp &&
		data.situation === EMPTY_IRPF_FORM_DATA.situation &&
		data.complexity.length === 0 &&
		data.moment === EMPTY_IRPF_FORM_DATA.moment &&
		data.consent === EMPTY_IRPF_FORM_DATA.consent
	);
}

export function useIrpfModalPersistence() {
	const formData = useIrpfModalStore((s) => s.formData);
	const hydrated = useIrpfModalStore((s) => s.hydratedFromStorage);
	const submitted = useIrpfModalStore((s) => s.submittedInSession);
	const hydrateFromStorage = useIrpfModalStore((s) => s.hydrateFromStorage);

	useEffect(() => {
		if (hydrated) return;
		hydrateFromStorage(readDraft());
	}, [hydrated, hydrateFromStorage]);

	useEffect(() => {
		if (!hydrated) return;

		if (submitted) {
			writeDraft({ version: 1, submitted: true });
			return;
		}

		if (isEmptyFormData(formData)) {
			clearDraft();
			return;
		}

		writeDraft({ version: 1, formData });
	}, [formData, hydrated, submitted]);
}

export const IRPF_MODAL_STORAGE_KEY = STORAGE_KEY;
