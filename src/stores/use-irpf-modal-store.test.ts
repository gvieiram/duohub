// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from "vitest";
import {
	EMPTY_IRPF_FORM_DATA,
	useIrpfModalStore,
} from "./use-irpf-modal-store";

describe("useIrpfModalStore", () => {
	beforeEach(() => {
		useIrpfModalStore.setState({
			isOpen: false,
			step: 1,
			formData: { ...EMPTY_IRPF_FORM_DATA },
			submittedInSession: false,
			hydratedFromStorage: false,
		});
	});

	it("starts closed on step 1 with empty form", () => {
		const state = useIrpfModalStore.getState();
		expect(state.isOpen).toBe(false);
		expect(state.step).toBe(1);
		expect(state.formData).toEqual(EMPTY_IRPF_FORM_DATA);
		expect(state.submittedInSession).toBe(false);
	});

	it("open() and close() toggle isOpen", () => {
		useIrpfModalStore.getState().open();
		expect(useIrpfModalStore.getState().isOpen).toBe(true);

		useIrpfModalStore.getState().close();
		expect(useIrpfModalStore.getState().isOpen).toBe(false);
	});

	it("setStep() updates current step", () => {
		useIrpfModalStore.getState().setStep(2);
		expect(useIrpfModalStore.getState().step).toBe(2);

		useIrpfModalStore.getState().setStep(1);
		expect(useIrpfModalStore.getState().step).toBe(1);
	});

	it("updateFormData() merges patch into formData", () => {
		useIrpfModalStore.getState().updateFormData({
			name: "João",
			email: "joao@example.com",
		});

		const { formData } = useIrpfModalStore.getState();
		expect(formData.name).toBe("João");
		expect(formData.email).toBe("joao@example.com");
		expect(formData.whatsapp).toBe("");
		expect(formData.consent).toBe(false);
	});

	it("updateFormData() preserves unlisted fields", () => {
		useIrpfModalStore.getState().updateFormData({ name: "Maria" });
		useIrpfModalStore.getState().updateFormData({ email: "maria@ex.com" });

		const { formData } = useIrpfModalStore.getState();
		expect(formData.name).toBe("Maria");
		expect(formData.email).toBe("maria@ex.com");
	});

	it("updateFormData() supports complexity array", () => {
		useIrpfModalStore.getState().updateFormData({
			complexity: ["ALUGUEL", "DEPENDENTES"],
		});

		expect(useIrpfModalStore.getState().formData.complexity).toEqual([
			"ALUGUEL",
			"DEPENDENTES",
		]);
	});

	it("markSubmitted() sets submittedInSession=true and clears formData", () => {
		useIrpfModalStore
			.getState()
			.updateFormData({ name: "João", email: "joao@ex.com" });
		useIrpfModalStore.getState().markSubmitted();

		const state = useIrpfModalStore.getState();
		expect(state.submittedInSession).toBe(true);
		expect(state.formData).toEqual(EMPTY_IRPF_FORM_DATA);
	});

	it("reset() returns step, formData and submittedInSession to defaults", () => {
		const store = useIrpfModalStore.getState();
		store.updateFormData({ name: "João" });
		store.setStep(2);
		store.markSubmitted();

		store.reset();

		const state = useIrpfModalStore.getState();
		expect(state.step).toBe(1);
		expect(state.formData).toEqual(EMPTY_IRPF_FORM_DATA);
		expect(state.submittedInSession).toBe(false);
	});

	it("hydrateFromStorage(null) marks hydrated without changing form", () => {
		useIrpfModalStore.getState().hydrateFromStorage(null);

		const state = useIrpfModalStore.getState();
		expect(state.hydratedFromStorage).toBe(true);
		expect(state.formData).toEqual(EMPTY_IRPF_FORM_DATA);
	});

	it("hydrateFromStorage(data) merges the stored partial into formData", () => {
		useIrpfModalStore.getState().hydrateFromStorage({
			formData: {
				name: "Persisted",
				complexity: ["ALUGUEL"],
			},
		});

		const state = useIrpfModalStore.getState();
		expect(state.hydratedFromStorage).toBe(true);
		expect(state.formData.name).toBe("Persisted");
		expect(state.formData.complexity).toEqual(["ALUGUEL"]);
		expect(state.formData.email).toBe("");
	});

	it("hydrateFromStorage() restores submittedInSession when stored", () => {
		useIrpfModalStore.getState().hydrateFromStorage({ submitted: true });

		const state = useIrpfModalStore.getState();
		expect(state.hydratedFromStorage).toBe(true);
		expect(state.submittedInSession).toBe(true);
	});
});
