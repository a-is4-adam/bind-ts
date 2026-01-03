import { describe, it, expectTypeOf } from "vitest";
import type { ComponentType } from "react";
import { createBindContexts, createBindHook } from "../createBindHook";
import type { AppElementContext, AppElementProps, AppBindExtendedApi } from "../createBindHook";
import type { ElementContext } from "../types";
import type { ReactBindExtendedApi } from "../useBind";

describe("createBindContexts type tests", () => {
	it("should return correctly typed contexts and hooks", () => {
		const result = createBindContexts();

		// Should have elementContext and bindContext
		expectTypeOf(result.elementContext).toBeObject();
		expectTypeOf(result.bindContext).toBeObject();

		// Should have typed hooks
		expectTypeOf(result.useElementContext).toBeFunction();
		expectTypeOf(result.useBindContext).toBeFunction();
	});

	it("should type useElementContext with generic parameter", () => {
		const { useElementContext } = createBindContexts();

		function TestComponent() {
			// With explicit type parameter
			const element = useElementContext<readonly ["tab1", "tab2"]>();

			expectTypeOf(element.state.value).toEqualTypeOf<"tab1" | "tab2">();
			expectTypeOf(element.meta.isActive).toEqualTypeOf<boolean>();
			expectTypeOf(element.handleChange).toEqualTypeOf<() => void>();

			return null;
		}
	});

	it("should type useBindContext with generic parameter", () => {
		const { useBindContext } = createBindContexts();

		function TestComponent() {
			// With explicit type parameter
			const bind = useBindContext<readonly ["a", "b", "c"]>();

			expectTypeOf(bind.state.value).toEqualTypeOf<"a" | "b" | "c">();
			expectTypeOf(bind.setValue).toBeFunction();
			expectTypeOf(bind.Element).toBeFunction();
			expectTypeOf(bind.Subscribe).toBeFunction();

			return null;
		}
	});
});

describe("createBindHook type tests", () => {
	// Setup contexts
	const { elementContext, bindContext, useElementContext } = createBindContexts();

	// Define test components
	function Tab({ children }: { children: React.ReactNode }) {
		return <button>{children}</button>;
	}

	function TabPanel({ children }: { children: React.ReactNode }) {
		return <div>{children}</div>;
	}

	function WizardStep({ children }: { children: React.ReactNode }) {
		return <div>{children}</div>;
	}

	it("should type useAppBind with group key constraint", () => {
		const { useAppBind } = createBindHook({
			elementContext,
			bindContext,
			components: {
				Tab: { Tab, TabPanel },
				Wizard: { WizardStep },
			},
		});

		function TestComponent() {
			// Valid group keys
			const tabBind = useAppBind("Tab", {
				defaultValue: "tab1",
				values: ["tab1", "tab2"] as const,
			});

			const wizardBind = useAppBind("Wizard", {
				defaultValue: "step1",
				values: ["step1", "step2"] as const,
			});

			// @ts-expect-error - "Invalid" is not a valid group key
			useAppBind("Invalid", {
				defaultValue: "x",
				values: ["x"] as const,
			});

			return null;
		}
	});

	it("should type Element value with value constraint", () => {
		const { useAppBind } = createBindHook({
			elementContext,
			bindContext,
			components: {
				Tab: { Tab, TabPanel },
			},
		});

		function TestComponent() {
			const bind = useAppBind("Tab", {
				defaultValue: "panel1",
				values: ["panel1", "panel2"] as const,
			});

			return (
				<>
					{/* Valid value */}
					<bind.Element value="panel1">{() => null}</bind.Element>

					{/* @ts-expect-error - "panel3" is not a valid value */}
					<bind.Element value="panel3">{() => null}</bind.Element>
				</>
			);
		}
	});

	it("should merge component group with element context in Element children", () => {
		const { useAppBind } = createBindHook({
			elementContext,
			bindContext,
			components: {
				Tab: { Tab, TabPanel },
			},
		});

		function TestComponent() {
			const bind = useAppBind("Tab", {
				defaultValue: "tab1",
				values: ["tab1", "tab2"] as const,
			});

			return (
				<bind.Element value="tab1">
					{(bindApi) => {
						// Should have element context properties
						expectTypeOf(bindApi.state.value).toEqualTypeOf<"tab1" | "tab2">();
						expectTypeOf(bindApi.meta.isActive).toEqualTypeOf<boolean>();
						expectTypeOf(bindApi.handleChange).toEqualTypeOf<() => void>();

						// Should have component group
						expectTypeOf(bindApi.Tab).toEqualTypeOf<typeof Tab>();
						expectTypeOf(bindApi.TabPanel).toEqualTypeOf<typeof TabPanel>();

						return <bindApi.Tab>Click me</bindApi.Tab>;
					}}
				</bind.Element>
			);
		}
	});

	it("should type AppElementContext correctly", () => {
		type TestValues = readonly ["x", "y"];
		type TestComponents = {
			Foo: ComponentType<{ text: string }>;
			Bar: ComponentType<{}>;
		};

		type Context = AppElementContext<TestValues, TestComponents>;

		// Element context properties
		expectTypeOf<Context["state"]["value"]>().toEqualTypeOf<"x" | "y">();
		expectTypeOf<Context["meta"]["isActive"]>().toEqualTypeOf<boolean>();
		expectTypeOf<Context["handleChange"]>().toEqualTypeOf<() => void>();

		// Component properties
		expectTypeOf<Context["Foo"]>().toEqualTypeOf<ComponentType<{ text: string }>>();
		expectTypeOf<Context["Bar"]>().toEqualTypeOf<ComponentType<{}>>();
	});

	it("should type AppElementProps correctly", () => {
		type TestValues = readonly ["a", "b"];
		type TestComponents = { Comp: ComponentType<{}> };

		type Props = AppElementProps<TestValues, TestComponents>;

		expectTypeOf<Props["value"]>().toEqualTypeOf<"a" | "b">();
		expectTypeOf<Props["children"]>().toEqualTypeOf<
			(context: AppElementContext<TestValues, TestComponents>) => React.ReactNode
		>();
	});

	it("should type AppBindExtendedApi correctly", () => {
		type TestValues = readonly ["one", "two"];
		type TestComponents = { Widget: ComponentType<{}> };

		type Api = AppBindExtendedApi<TestValues, TestComponents>;

		// Should have core API
		expectTypeOf<Api["setValue"]>().toBeFunction();
		expectTypeOf<Api["reset"]>().toBeFunction();

		// Should have React components
		expectTypeOf<Api["Element"]>().toBeFunction();
		expectTypeOf<Api["Subscribe"]>().toBeFunction();

		// Should have composition components
		expectTypeOf<Api["AppBind"]>().not.toBeNullable();
	});

	it("should provide correct types from different component groups", () => {
		function A() {
			return <div>A</div>;
		}
		function B() {
			return <div>B</div>;
		}
		function X() {
			return <div>X</div>;
		}
		function Y() {
			return <div>Y</div>;
		}

		const { useAppBind } = createBindHook({
			elementContext,
			bindContext,
			components: {
				GroupA: { A, B },
				GroupX: { X, Y },
			},
		});

		function TestComponent() {
			const bindA = useAppBind("GroupA", {
				defaultValue: "v1",
				values: ["v1", "v2"] as const,
			});

			const bindX = useAppBind("GroupX", {
				defaultValue: "v1",
				values: ["v1", "v2"] as const,
			});

			return (
				<>
					<bindA.Element value="v1">
						{(bindApi) => {
							// GroupA should have A and B
							expectTypeOf(bindApi.A).toEqualTypeOf<typeof A>();
							expectTypeOf(bindApi.B).toEqualTypeOf<typeof B>();
							// @ts-expect-error - X is not in GroupA
							bindApi.X;
							return null;
						}}
					</bindA.Element>

					<bindX.Element value="v1">
						{(bindApi) => {
							// GroupX should have X and Y
							expectTypeOf(bindApi.X).toEqualTypeOf<typeof X>();
							expectTypeOf(bindApi.Y).toEqualTypeOf<typeof Y>();
							// @ts-expect-error - A is not in GroupX
							bindApi.A;
							return null;
						}}
					</bindX.Element>
				</>
			);
		}
	});

	it("should inherit core API methods with correct value types", () => {
		const { useAppBind } = createBindHook({
			elementContext,
			bindContext,
			components: {
				Test: { Tab },
			},
		});

		function TestComponent() {
			const bind = useAppBind("Test", {
				defaultValue: "a",
				values: ["a", "b", "c"] as const,
			});

			// Valid values
			bind.setValue("a");
			bind.setValue("b");

			// @ts-expect-error - "d" is not a valid value
			bind.setValue("d");

			// Reset should also be typed
			bind.reset("c");

			// @ts-expect-error - "invalid" is not valid
			bind.reset("invalid");

			return null;
		}
	});
});
