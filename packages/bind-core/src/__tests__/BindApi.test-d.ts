import { describe, it, expectTypeOf } from "vitest";
import { BindApi } from "../BindApi";
import type { BindState, BindOptions } from "../BindApi";
import type { AnyBindApi } from "../types";

describe("BindApi type tests", () => {
	it("should infer state types correctly", () => {
		const values = ["tab1", "tab2", "tab3"] as const;
		const bind = new BindApi({
			defaultValue: "tab1",
			values,
		});

		// value should be the union of values
		expectTypeOf(bind.state.value).toEqualTypeOf<"tab1" | "tab2" | "tab3">();

		// values should be the exact readonly array type
		expectTypeOf(bind.state.values).toEqualTypeOf<typeof values>();
	});

	it("should type BindState correctly", () => {
		type TestValues = readonly ["first", "second"];

		type TestState = BindState<TestValues>;

		expectTypeOf<TestState["value"]>().toEqualTypeOf<"first" | "second">();
		expectTypeOf<TestState["values"]>().toEqualTypeOf<TestValues>();
	});

	it("should type BindOptions correctly", () => {
		type TestValues = readonly ["a", "b", "c"];

		type TestOptions = BindOptions<TestValues>;

		expectTypeOf<TestOptions["defaultValue"]>().toEqualTypeOf<"a" | "b" | "c">();
		expectTypeOf<TestOptions["values"]>().toEqualTypeOf<TestValues>();
	});

	it("should constrain setValue parameter to defined values", () => {
		const bind = new BindApi({
			defaultValue: "tab1",
			values: ["tab1", "tab2"] as const,
		});

		// Valid value
		bind.setValue("tab1");
		bind.setValue("tab2");

		// @ts-expect-error - "tab3" is not a valid value
		bind.setValue("tab3");

		// @ts-expect-error - arbitrary string is not a valid value
		bind.setValue("invalid");
	});

	it("should constrain reset parameter to defined values", () => {
		const bind = new BindApi({
			defaultValue: "step1",
			values: ["step1", "step2", "step3"] as const,
		});

		// Valid usage
		bind.reset();
		bind.reset("step2");
		bind.reset("step3");

		// @ts-expect-error - "step4" is not a valid value
		bind.reset("step4");
	});

	it("should constrain defaultValue in options to defined values", () => {
		// Valid
		new BindApi({
			defaultValue: "a",
			values: ["a", "b"] as const,
		});

		new BindApi({
			// @ts-expect-error - "c" is not in the values array
			defaultValue: "c",
			values: ["a", "b"] as const,
		});
	});

	it("should type store correctly", () => {
		const bind = new BindApi({
			defaultValue: "one",
			values: ["one", "two"] as const,
		});

		// Store state should match BindState
		const storeState = bind.store.state;
		expectTypeOf(storeState.value).toEqualTypeOf<"one" | "two">();
	});

	it("should type update method parameter correctly", () => {
		const bind = new BindApi({
			defaultValue: "a",
			values: ["a", "b"] as const,
		});

		// Valid update
		bind.update({
			defaultValue: "b",
			values: ["a", "b"] as const,
		});

		bind.update({
			// @ts-expect-error - "c" is not a valid default value
			defaultValue: "c",
			values: ["a", "b"] as const,
		});
	});

	it("should type mount return type correctly", () => {
		const bind = new BindApi({
			defaultValue: "x",
			values: ["x", "y"] as const,
		});

		const cleanup = bind.mount();

		// cleanup should be a function returning void
		expectTypeOf(cleanup).toEqualTypeOf<() => void>();
	});

	it("should infer options type correctly", () => {
		const bind = new BindApi({
			defaultValue: "first",
			values: ["first", "second"] as const,
		});

		expectTypeOf(bind.options.defaultValue).toEqualTypeOf<"first" | "second">();
		expectTypeOf(bind.options.values).toEqualTypeOf<readonly ["first", "second"]>();
	});

	it("should work with AnyBindApi type for loose typing", () => {
		// AnyBindApi can be used for function parameters accepting any bind
		function acceptsAnyBind(bind: AnyBindApi) {
			// Can access state with string type
			expectTypeOf(bind.state.value).toEqualTypeOf<string>();
			// Can call methods with string
			bind.setValue("any-string");
		}

		const bind = new BindApi({
			defaultValue: "a",
			values: ["a", "b", "c"] as const,
		});

		// Use type assertion to pass to function
		acceptsAnyBind(bind as unknown as AnyBindApi);
	});

	it("should type listeners.onChange props correctly", () => {
		// listeners.onChange should receive props with correct types
		new BindApi({
			defaultValue: "a",
			values: ["a", "b"] as const,
			listeners: {
				onChange: (props) => {
					expectTypeOf(props.value).toEqualTypeOf<"a" | "b">();
					expectTypeOf(props.bindApi).toEqualTypeOf<BindApi<readonly ["a", "b"]>>();
				},
			},
		});
	});
});
