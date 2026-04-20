// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
	IRPF_MODAL_STORAGE_KEY,
	useIrpfModalPersistence,
} from "./use-irpf-modal-persistence";
import {
	EMPTY_IRPF_FORM_DATA,
	useIrpfModalStore,
} from "./use-irpf-modal-store";

function resetStore() {
	useIrpfModalStore.setState({
		isOpen: false,
		step: 1,
		formData: { ...EMPTY_IRPF_FORM_DATA },
		submittedInSession: false,
		hydratedFromStorage: false,
	});
}

describe("useIrpfModalPersistence", () => {
	beforeEach(() => {
		window.sessionStorage.clear();
		resetStore();
	});

	afterEach(() => {
		window.sessionStorage.clear();
		resetStore();
	});

	it("hydrates the store from sessionStorage on first mount", () => {
		window.sessionStorage.setItem(
			IRPF_MODAL_STORAGE_KEY,
			JSON.stringify({
				version: 1,
				formData: {
					name: "Stored",
					email: "stored@example.com",
					whatsapp: "48999990000",
				},
			}),
		);

		renderHook(() => useIrpfModalPersistence());

		const state = useIrpfModalStore.getState();
		expect(state.hydratedFromStorage).toBe(true);
		expect(state.formData.name).toBe("Stored");
		expect(state.formData.email).toBe("stored@example.com");
		expect(state.formData.whatsapp).toBe("48999990000");
	});

	it("ignores drafts with an unknown version", () => {
		window.sessionStorage.setItem(
			IRPF_MODAL_STORAGE_KEY,
			JSON.stringify({ version: 99, formData: { name: "Old" } }),
		);

		renderHook(() => useIrpfModalPersistence());

		const state = useIrpfModalStore.getState();
		expect(state.hydratedFromStorage).toBe(true);
		expect(state.formData).toEqual(EMPTY_IRPF_FORM_DATA);
	});

	it("handles invalid JSON gracefully", () => {
		window.sessionStorage.setItem(IRPF_MODAL_STORAGE_KEY, "{not-json");

		renderHook(() => useIrpfModalPersistence());

		const state = useIrpfModalStore.getState();
		expect(state.hydratedFromStorage).toBe(true);
		expect(state.formData).toEqual(EMPTY_IRPF_FORM_DATA);
	});

	it("persists formData changes back to sessionStorage after hydration", () => {
		renderHook(() => useIrpfModalPersistence());

		act(() => {
			useIrpfModalStore.getState().updateFormData({
				name: "Written",
				email: "written@example.com",
			});
		});

		const raw = window.sessionStorage.getItem(IRPF_MODAL_STORAGE_KEY);
		expect(raw).not.toBeNull();
		const parsed = JSON.parse(raw ?? "{}");
		expect(parsed.version).toBe(1);
		expect(parsed.formData.name).toBe("Written");
		expect(parsed.formData.email).toBe("written@example.com");
	});

	it("clears the draft when the form is submitted", () => {
		renderHook(() => useIrpfModalPersistence());

		act(() => {
			useIrpfModalStore.getState().updateFormData({ name: "Before" });
		});

		expect(
			window.sessionStorage.getItem(IRPF_MODAL_STORAGE_KEY),
		).not.toBeNull();

		act(() => {
			useIrpfModalStore.getState().markSubmitted();
		});

		expect(window.sessionStorage.getItem(IRPF_MODAL_STORAGE_KEY)).toBeNull();
	});

	it("clears the draft when the form becomes empty after hydration", () => {
		window.sessionStorage.setItem(
			IRPF_MODAL_STORAGE_KEY,
			JSON.stringify({ version: 1, formData: { name: "Stored" } }),
		);

		renderHook(() => useIrpfModalPersistence());

		act(() => {
			useIrpfModalStore.getState().reset();
		});

		expect(window.sessionStorage.getItem(IRPF_MODAL_STORAGE_KEY)).toBeNull();
	});
});
