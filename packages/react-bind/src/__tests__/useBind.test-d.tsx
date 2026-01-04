import { describe, it, expectTypeOf } from "vitest";
import { useBind } from "../useBind";
import type { ReactBindExtendedApi, ReactBindApi } from "../useBind";
import type { ElementContext, ElementProps, SubscribeProps } from "../types";
import type { BindState } from "@bind-ts/bind-core";

describe("useBind type tests", () => {
	it("should return ReactBindExtendedApi with correct value types", () => {
		function TestComponent() {
			const bind = useBind({
				defaultValue: "tab1",
				values: ["tab1", "tab2", "tab3"] as const,
			});

			// Should have correct state types
			expectTypeOf(bind.state.value).toEqualTypeOf<"tab1" | "tab2" | "tab3">();

			// Should have Element and Subscribe components
			expectTypeOf(bind.Element).toBeFunction();
			expectTypeOf(bind.Subscribe).toBeFunction();

			// Core API methods should be typed
			expectTypeOf(bind.setValue).toBeFunction();
			expectTypeOf(bind.reset).toBeFunction();

			return null;
		}
	});

	it("should type setValue parameter correctly", () => {
		function TestComponent() {
			const bind = useBind({
				defaultValue: "a",
				values: ["a", "b"] as const,
			});

			// Valid values
			bind.setValue("a");
			bind.setValue("b");

			// @ts-expect-error - "c" is not a valid value
			bind.setValue("c");

			return null;
		}
	});

	it("should type reset parameter correctly", () => {
		function TestComponent() {
			const bind = useBind({
				defaultValue: "step1",
				values: ["step1", "step2"] as const,
			});

			// Valid usage
			bind.reset();
			bind.reset("step1");

			// @ts-expect-error - "step3" is not a valid value
			bind.reset("step3");

			return null;
		}
	});

	it("should type ElementContext correctly", () => {
		type TestValues = readonly ["first", "second"];

		type Context = ElementContext<TestValues>;

		expectTypeOf<Context["state"]["value"]>().toEqualTypeOf<"first" | "second">();
		expectTypeOf<Context["meta"]["isActive"]>().toEqualTypeOf<boolean>();
		expectTypeOf<Context["handleChange"]>().toEqualTypeOf<() => void>();
	});

	it("should type ElementProps correctly", () => {
		type TestValues = readonly ["x", "y", "z"];

		type Props = ElementProps<TestValues>;

		expectTypeOf<Props["value"]>().toEqualTypeOf<"x" | "y" | "z">();
		expectTypeOf<Props["children"]>().toEqualTypeOf<
			(context: ElementContext<TestValues>) => React.ReactNode
		>();
	});

	it("should type SubscribeProps correctly", () => {
		type TestValues = readonly ["on", "off"];

		// Default selected type is full state
		type DefaultProps = SubscribeProps<TestValues>;

		expectTypeOf<Exclude<DefaultProps["selector"], undefined>>().toEqualTypeOf<
			(state: BindState<TestValues>) => BindState<TestValues>
		>();

		// Custom selected type
		type CustomProps = SubscribeProps<TestValues, string>;

		expectTypeOf<Exclude<CustomProps["selector"], undefined>>().toEqualTypeOf<
			(state: BindState<TestValues>) => string
		>();
	});

	it("should infer Element value from values", () => {
		function TestComponent() {
			const bind = useBind({
				defaultValue: "panel1",
				values: ["panel1", "panel2"] as const,
			});

			// Valid element usage
			return (
				<>
					<bind.Element value="panel1">
						{(bindCtx) => {
							expectTypeOf(bindCtx.state.value).toEqualTypeOf<"panel1" | "panel2">();
							return null;
						}}
					</bind.Element>
					{/* @ts-expect-error - "panel3" is not a valid value */}
					<bind.Element value="panel3">{() => null}</bind.Element>
				</>
			);
		}
	});

	it("should type Subscribe selector and children correctly", () => {
		function TestComponent() {
			const bind = useBind({
				defaultValue: "tab1",
				values: ["tab1", "tab2"] as const,
			});

			return (
				<>
					{/* With selector - children receives selected type */}
					<bind.Subscribe selector={(s) => s.value}>
						{(value) => {
							expectTypeOf(value).toEqualTypeOf<"tab1" | "tab2">();
							return null;
						}}
					</bind.Subscribe>

					{/* Without selector - children receives full state */}
					<bind.Subscribe>
						{(state) => {
							expectTypeOf(state.value).toEqualTypeOf<"tab1" | "tab2">();
							expectTypeOf(state.values).toEqualTypeOf<readonly ["tab1", "tab2"]>();
							return null;
						}}
					</bind.Subscribe>
				</>
			);
		}
	});

	it("should type ReactBindApi interface correctly", () => {
		type TestValues = readonly ["a", "b"];

		type Api = ReactBindApi<TestValues>;

		// Should have Element and Subscribe
		expectTypeOf<Api["Element"]>().toBeFunction();
		expectTypeOf<Api["Subscribe"]>().toBeFunction();
	});

	it("should type ReactBindExtendedApi correctly", () => {
		type TestValues = readonly ["one", "two"];

		type ExtendedApi = ReactBindExtendedApi<TestValues>;

		// Should have core API methods
		expectTypeOf<ExtendedApi["setValue"]>().toBeFunction();
		expectTypeOf<ExtendedApi["reset"]>().toBeFunction();
		expectTypeOf<ExtendedApi["mount"]>().toBeFunction();

		// Should have React components
		expectTypeOf<ExtendedApi["Element"]>().toBeFunction();
		expectTypeOf<ExtendedApi["Subscribe"]>().toBeFunction();

		// Should have typed state
		expectTypeOf<ExtendedApi["state"]["value"]>().toEqualTypeOf<"one" | "two">();
	});

	it("should constrain defaultValue to values", () => {
		function TestComponent() {
			// Valid
			useBind({
				defaultValue: "valid",
				values: ["valid", "also-valid"] as const,
			});

			useBind({
				// @ts-expect-error - "invalid" is not in values
				defaultValue: "invalid",
				values: ["valid", "also-valid"] as const,
			});

			return null;
		}
	});
});
