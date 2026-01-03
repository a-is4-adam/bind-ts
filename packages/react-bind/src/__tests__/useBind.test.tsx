import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import { useBind } from "../useBind";
import { createBindContexts, createBindHook } from "../createBindHook";

describe("useBind", () => {
	// Ensure each test starts with a clean DOM
	beforeEach(() => {
		cleanup();
	});

	it("should initialize with the default value", () => {
		function TestComponent() {
			const bind = useBind({
				defaultValue: "tab1",
				values: ["tab1", "tab2"] as const,
			});

			return (
				<bind.Subscribe selector={(s) => s.value}>
					{(value) => <div data-testid="init-active">{value}</div>}
				</bind.Subscribe>
			);
		}

		render(<TestComponent />);
		expect(screen.getByTestId("init-active").textContent).toBe("tab1");
	});

	it("should render Element with correct context", () => {
		function TestComponent() {
			const bind = useBind({
				defaultValue: "tab1",
				values: ["tab1", "tab2"] as const,
			});

			return (
				<bind.Element value="tab1">
					{(ctx) => (
						<div>
							<span data-testid="element-value">{ctx.value}</span>
							<span data-testid="element-isActive">{ctx.isActive.toString()}</span>
							<span data-testid="element-activeValue">{ctx.activeValue}</span>
						</div>
					)}
				</bind.Element>
			);
		}

		render(<TestComponent />);
		expect(screen.getByTestId("element-value").textContent).toBe("tab1");
		expect(screen.getByTestId("element-isActive").textContent).toBe("true");
		expect(screen.getByTestId("element-activeValue").textContent).toBe("tab1");
	});

	it("should update state when handleChange is called from Element", () => {
		function TestComponent() {
			const bind = useBind({
				defaultValue: "tab1",
				values: ["tab1", "tab2"] as const,
			});

			return (
				<div>
					<bind.Element value="tab2">
						{(ctx) => (
							<button data-testid="update-trigger" onClick={ctx.handleChange}>
								Switch to Tab 2
							</button>
						)}
					</bind.Element>
					<bind.Subscribe selector={(s) => s.value}>
						{(value) => <div data-testid="update-active">{value}</div>}
					</bind.Subscribe>
				</div>
			);
		}

		render(<TestComponent />);
		expect(screen.getByTestId("update-active").textContent).toBe("tab1");

		fireEvent.click(screen.getByTestId("update-trigger"));
		expect(screen.getByTestId("update-active").textContent).toBe("tab2");
	});

	it("should conditionally render based on isActive", () => {
		function TestComponent() {
			const bind = useBind({
				defaultValue: "tab1",
				values: ["tab1", "tab2"] as const,
			});

			return (
				<div>
					<bind.Element value="tab1">
						{(ctx) =>
							ctx.isActive && <div data-testid="cond-panel1">Panel 1 Content</div>
						}
					</bind.Element>
					<bind.Element value="tab2">
						{(ctx) =>
							ctx.isActive && <div data-testid="cond-panel2">Panel 2 Content</div>
						}
					</bind.Element>
					<bind.Element value="tab2">
						{(ctx) => (
							<button data-testid="cond-switch" onClick={ctx.handleChange}>
								Switch
							</button>
						)}
					</bind.Element>
				</div>
			);
		}

		render(<TestComponent />);

		// Initially tab1 is active
		expect(screen.getByTestId("cond-panel1")).toBeInTheDocument();
		expect(screen.queryByTestId("cond-panel2")).not.toBeInTheDocument();

		// Switch to tab2
		fireEvent.click(screen.getByTestId("cond-switch"));

		expect(screen.queryByTestId("cond-panel1")).not.toBeInTheDocument();
		expect(screen.getByTestId("cond-panel2")).toBeInTheDocument();
	});

	it("should provide access to core API methods", () => {
		const values = ["tab1", "tab2"] as const;
		type Values = typeof values;
		let apiRef: ReturnType<typeof useBind<Values>> | null = null;

		function TestComponent() {
			const bind = useBind({
				defaultValue: "tab1",
				values: ["tab1", "tab2"] as const,
			});
			apiRef = bind;

			return (
				<bind.Subscribe selector={(s) => s.value}>
					{(value) => <div data-testid="api-active">{value}</div>}
				</bind.Subscribe>
			);
		}

		render(<TestComponent />);
		expect(screen.getByTestId("api-active").textContent).toBe("tab1");

		// Use core API directly - wrap in act() since we're calling outside React
		act(() => {
			apiRef!.setValue("tab2");
		});
		expect(screen.getByTestId("api-active").textContent).toBe("tab2");

		// Reset
		act(() => {
			apiRef!.reset();
		});
		expect(screen.getByTestId("api-active").textContent).toBe("tab1");
	});

	it("should Subscribe without selector to receive full state", () => {
		function TestComponent() {
			const bind = useBind({
				defaultValue: "tab1",
				values: ["tab1", "tab2"] as const,
			});

			return (
				<bind.Subscribe>
					{(state) => (
						<div>
							<span data-testid="full-active">{state.value}</span>
							<span data-testid="full-count">{state.values.length}</span>
						</div>
					)}
				</bind.Subscribe>
			);
		}

		render(<TestComponent />);
		expect(screen.getByTestId("full-active").textContent).toBe("tab1");
		expect(screen.getByTestId("full-count").textContent).toBe("2");
	});

	it("should reset to a new default when provided", () => {
		const values = ["tab1", "tab2", "tab3"] as const;
		type Values = typeof values;
		let apiRef: ReturnType<typeof useBind<Values>> | null = null;

		function TestComponent() {
			const bind = useBind({
				defaultValue: "tab1",
				values,
			});
			apiRef = bind;

			return (
				<bind.Subscribe selector={(s) => s.value}>
					{(value) => <div data-testid="reset-active">{value}</div>}
				</bind.Subscribe>
			);
		}

		render(<TestComponent />);
		expect(screen.getByTestId("reset-active").textContent).toBe("tab1");

		// Change to tab2
		act(() => {
			apiRef!.setValue("tab2");
		});
		expect(screen.getByTestId("reset-active").textContent).toBe("tab2");

		// Reset with new default
		act(() => {
			apiRef!.reset("tab3");
		});
		expect(screen.getByTestId("reset-active").textContent).toBe("tab3");

		// Subsequent reset without argument should use new default
		act(() => {
			apiRef!.setValue("tab1");
		});
		expect(screen.getByTestId("reset-active").textContent).toBe("tab1");

		act(() => {
			apiRef!.reset();
		});
		expect(screen.getByTestId("reset-active").textContent).toBe("tab3");
	});

	it("should not cause infinite re-renders when listening to state", () => {
		const renderCount = { current: 0 };

		function TestComponent() {
			renderCount.current++;
			const bind = useBind({
				defaultValue: "tab1",
				values: ["tab1", "tab2"] as const,
			});

			return (
				<bind.Subscribe selector={(s) => s.value}>
					{(value) => <div data-testid="no-loop">{value}</div>}
				</bind.Subscribe>
			);
		}

		render(<TestComponent />);

		// Should only render once during initial mount (React strict mode may double)
		expect(renderCount.current).toBeLessThanOrEqual(2);
	});

	it("should update multiple Elements for the same value simultaneously", () => {
		function TestComponent() {
			const bind = useBind({
				defaultValue: "tab1",
				values: ["tab1", "tab2"] as const,
			});

			return (
				<div>
					{/* Two elements for tab1 */}
					<bind.Element value="tab1">
						{(bindApi) => (
							<span data-testid="multi-element1">{bindApi.isActive.toString()}</span>
						)}
					</bind.Element>
					<bind.Element value="tab1">
						{(bindApi) => (
							<span data-testid="multi-element2">{bindApi.isActive.toString()}</span>
						)}
					</bind.Element>

					{/* Trigger to switch */}
					<bind.Element value="tab2">
						{(bindApi) => (
							<button data-testid="multi-switch" onClick={bindApi.handleChange}>
								Switch
							</button>
						)}
					</bind.Element>
				</div>
			);
		}

		render(<TestComponent />);

		// Both elements should show true initially
		expect(screen.getByTestId("multi-element1").textContent).toBe("true");
		expect(screen.getByTestId("multi-element2").textContent).toBe("true");

		// Switch to tab2
		fireEvent.click(screen.getByTestId("multi-switch"));

		// Both elements should update to false simultaneously
		expect(screen.getByTestId("multi-element1").textContent).toBe("false");
		expect(screen.getByTestId("multi-element2").textContent).toBe("false");
	});

	it("should call listeners.onChange when handleChange is triggered", () => {
		const onChange = vi.fn();

		function TestComponent() {
			const bind = useBind({
				defaultValue: "tab1",
				values: ["tab1", "tab2"] as const,
				listeners: { onChange },
			});

			return (
				<div>
					<bind.Element value="tab2">
						{(bindApi) => (
							<button data-testid="listener-trigger" onClick={bindApi.handleChange}>
								Switch
							</button>
						)}
					</bind.Element>
				</div>
			);
		}

		render(<TestComponent />);
		expect(onChange).not.toHaveBeenCalled();

		fireEvent.click(screen.getByTestId("listener-trigger"));

		expect(onChange).toHaveBeenCalledTimes(1);
		expect(onChange).toHaveBeenCalledWith(
			expect.objectContaining({
				value: "tab2",
				bindApi: expect.objectContaining({
					setValue: expect.any(Function),
					reset: expect.any(Function),
				}),
			}),
		);
	});
});

// Composition API Tests
describe("createBindHook", () => {
	beforeEach(() => {
		cleanup();
	});

	it("should create contexts and hooks", () => {
		const { elementContext, bindContext, useElementContext, useBindContext } =
			createBindContexts();

		expect(elementContext).toBeDefined();
		expect(bindContext).toBeDefined();
		expect(typeof useElementContext).toBe("function");
		expect(typeof useBindContext).toBe("function");
	});

	it("should create useAppBind hook with component groups", () => {
		const { elementContext, bindContext, useElementContext } = createBindContexts();

		// Define custom components that use the element context
		function Tab({ children }: { children: React.ReactNode }) {
			const element = useElementContext();
			return (
				<button data-testid={`tab-${element.value}`} onClick={element.handleChange}>
					{children}
				</button>
			);
		}

		function TabPanel({ children }: { children: React.ReactNode }) {
			const element = useElementContext();
			if (!element.isActive) return null;
			return <div data-testid={`panel-${element.value}`}>{children}</div>;
		}

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
				<div>
					<bind.Element value="tab1">{(ctx) => <ctx.Tab>Tab 1</ctx.Tab>}</bind.Element>
					<bind.Element value="tab2">{(ctx) => <ctx.Tab>Tab 2</ctx.Tab>}</bind.Element>
					<bind.Element value="tab1">
						{(ctx) => <ctx.TabPanel>Panel 1 Content</ctx.TabPanel>}
					</bind.Element>
					<bind.Element value="tab2">
						{(ctx) => <ctx.TabPanel>Panel 2 Content</ctx.TabPanel>}
					</bind.Element>
				</div>
			);
		}

		render(<TestComponent />);

		// Tab buttons should render
		expect(screen.getByTestId("tab-tab1")).toBeInTheDocument();
		expect(screen.getByTestId("tab-tab2")).toBeInTheDocument();

		// Only tab1 panel should be visible initially
		expect(screen.getByTestId("panel-tab1")).toBeInTheDocument();
		expect(screen.queryByTestId("panel-tab2")).not.toBeInTheDocument();

		// Click tab2 to switch
		fireEvent.click(screen.getByTestId("tab-tab2"));

		// Now tab2 panel should be visible and tab1 hidden
		expect(screen.queryByTestId("panel-tab1")).not.toBeInTheDocument();
		expect(screen.getByTestId("panel-tab2")).toBeInTheDocument();
	});

	it("should provide element context via useElementContext", () => {
		const { elementContext, bindContext, useElementContext } = createBindContexts();

		function ElementInfo() {
			const element = useElementContext();
			return (
				<div>
					<span data-testid="element-value">{element.value}</span>
					<span data-testid="element-isActive">{element.isActive.toString()}</span>
					<span data-testid="element-activeValue">{element.activeValue}</span>
				</div>
			);
		}

		const { useAppBind } = createBindHook({
			elementContext,
			bindContext,
			components: {
				Info: { ElementInfo },
			},
		});

		function TestComponent() {
			const bind = useAppBind("Info", {
				defaultValue: "first",
				values: ["first", "second"] as const,
			});

			return (
				<bind.Element value="first">{(bindApi) => <bindApi.ElementInfo />}</bind.Element>
			);
		}

		render(<TestComponent />);

		expect(screen.getByTestId("element-value").textContent).toBe("first");
		expect(screen.getByTestId("element-isActive").textContent).toBe("true");
		expect(screen.getByTestId("element-activeValue").textContent).toBe("first");
	});

	it("should throw error when useElementContext is used outside Element", () => {
		const { useElementContext } = createBindContexts();

		function BadComponent() {
			useElementContext(); // This should throw
			return <div>Bad</div>;
		}

		expect(() => render(<BadComponent />)).toThrow(
			"`useElementContext` must be used within an `Element` component",
		);
	});

	it("should support multiple component groups", () => {
		const { elementContext, bindContext, useElementContext } = createBindContexts();

		function WizardStep({ children }: { children: React.ReactNode }) {
			const element = useElementContext();
			if (!element.isActive) return null;
			return <div data-testid={`wizard-step-${element.value}`}>{children}</div>;
		}

		function WizardNext() {
			const element = useElementContext();
			return (
				<button data-testid="wizard-next" onClick={element.handleChange}>
					Next
				</button>
			);
		}

		const { useAppBind } = createBindHook({
			elementContext,
			bindContext,
			components: {
				Tab: { Tab: () => null, TabPanel: () => null },
				Wizard: { WizardStep, WizardNext },
			},
		});

		function TestComponent() {
			const bind = useAppBind("Wizard", {
				defaultValue: "step1",
				values: ["step1", "step2"] as const,
			});

			return (
				<div>
					<bind.Element value="step1">
						{(ctx) => <ctx.WizardStep>Step 1</ctx.WizardStep>}
					</bind.Element>
					<bind.Element value="step2">
						{(ctx) => <ctx.WizardStep>Step 2</ctx.WizardStep>}
					</bind.Element>
					<bind.Element value="step2">{(ctx) => <ctx.WizardNext />}</bind.Element>
				</div>
			);
		}

		render(<TestComponent />);

		// Step 1 should be visible
		expect(screen.getByTestId("wizard-step-step1")).toBeInTheDocument();
		expect(screen.queryByTestId("wizard-step-step2")).not.toBeInTheDocument();

		// Click next to go to step 2
		fireEvent.click(screen.getByTestId("wizard-next"));

		// Step 2 should be visible
		expect(screen.queryByTestId("wizard-step-step1")).not.toBeInTheDocument();
		expect(screen.getByTestId("wizard-step-step2")).toBeInTheDocument();
	});
});
