import { describe, it, expect, vi } from "vitest";
import { BindApi } from "../BindApi";

describe("BindApi", () => {
	it("should initialize with correct default state", () => {
		const bind = new BindApi({
			defaultValue: "tab1",
			values: ["tab1", "tab2", "tab3"] as const,
		});

		expect(bind.state.value).toBe("tab1");
		expect(bind.state.values).toEqual(["tab1", "tab2", "tab3"]);
	});

	it("should update active value with setValue", () => {
		const bind = new BindApi({
			defaultValue: "tab1",
			values: ["tab1", "tab2"] as const,
		});

		bind.setValue("tab2");

		expect(bind.state.value).toBe("tab2");
	});

	it("should return cleanup function from mount", () => {
		const bind = new BindApi({
			defaultValue: "tab1",
			values: ["tab1"] as const,
		});

		const cleanup = bind.mount();

		expect(typeof cleanup).toBe("function");
		// Should not throw
		cleanup();
	});

	it("should update options with update method", () => {
		const bind = new BindApi({
			defaultValue: "tab1",
			values: ["tab1", "tab2"] as const,
		});

		bind.update({
			defaultValue: "tab2",
			values: ["tab1", "tab2"] as const,
		});

		expect(bind.options.defaultValue).toBe("tab2");
	});

	it("should reset to default value", () => {
		const bind = new BindApi({
			defaultValue: "step1",
			values: ["step1", "step2", "step3"] as const,
		});

		bind.setValue("step3");
		expect(bind.state.value).toBe("step3");

		bind.reset();
		expect(bind.state.value).toBe("step1");
	});

	it("should fire store subscription when value changes", () => {
		const bind = new BindApi({
			defaultValue: "tab1",
			values: ["tab1", "tab2"] as const,
		});

		const listener = vi.fn();
		bind.store.subscribe(listener);

		bind.setValue("tab2");

		expect(listener).toHaveBeenCalled();
	});

	it("should work with a single value", () => {
		const bind = new BindApi({
			defaultValue: "only",
			values: ["only"] as const,
		});

		expect(bind.state.value).toBe("only");
		expect(bind.state.values).toHaveLength(1);

		// setValue with same value should still work
		bind.setValue("only");
		expect(bind.state.value).toBe("only");
	});

	it("should preserve values array reference", () => {
		const values = ["tab1", "tab2", "tab3"] as const;
		const bind = new BindApi({
			defaultValue: "tab1",
			values,
		});

		// The values array should be the same reference
		expect(bind.state.values).toBe(values);
	});

	it("should fire store subscription on reset", () => {
		const bind = new BindApi({
			defaultValue: "tab1",
			values: ["tab1", "tab2"] as const,
		});

		bind.setValue("tab2");

		const listener = vi.fn();
		bind.store.subscribe(listener);

		bind.reset();

		expect(listener).toHaveBeenCalled();
		expect(bind.state.value).toBe("tab1");
	});

	it("should reset to a new default when provided", () => {
		const bind = new BindApi({
			defaultValue: "tab1",
			values: ["tab1", "tab2", "tab3"] as const,
		});

		bind.setValue("tab2");
		expect(bind.state.value).toBe("tab2");

		// Reset with new default
		bind.reset("tab3");
		expect(bind.state.value).toBe("tab3");
		expect(bind.options.defaultValue).toBe("tab3");

		// Subsequent reset should use new default
		bind.setValue("tab1");
		bind.reset();
		expect(bind.state.value).toBe("tab3");
	});

	it("should call listeners.onChange with bindApi when value changes", () => {
		const onChange = vi.fn();
		const bind = new BindApi({
			defaultValue: "tab1",
			values: ["tab1", "tab2"] as const,
			listeners: { onChange },
		});

		bind.setValue("tab2");

		expect(onChange).toHaveBeenCalledWith({ value: "tab2", bindApi: bind });
		expect(onChange).toHaveBeenCalledTimes(1);
	});

	it("should not call listeners.onChange when value is the same", () => {
		const onChange = vi.fn();
		const bind = new BindApi({
			defaultValue: "tab1",
			values: ["tab1", "tab2"] as const,
			listeners: { onChange },
		});

		bind.setValue("tab1");

		expect(onChange).not.toHaveBeenCalled();
	});

	it("should call listeners.onChange on reset if value changes", () => {
		const onChange = vi.fn();
		const bind = new BindApi({
			defaultValue: "tab1",
			values: ["tab1", "tab2"] as const,
			listeners: { onChange },
		});

		bind.setValue("tab2");
		onChange.mockClear();

		bind.reset();

		expect(onChange).toHaveBeenCalledWith({ value: "tab1", bindApi: bind });
	});
});
