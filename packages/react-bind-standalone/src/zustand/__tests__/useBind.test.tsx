import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import { useBind } from "../index";

describe("useBind (zustand)", () => {
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
					{(bindApi) => (
						<div>
							<span data-testid="element-value">{bindApi.state.value}</span>
							<span data-testid="element-isActive">
								{bindApi.meta.isActive.toString()}
							</span>
						</div>
					)}
				</bind.Element>
			);
		}

		render(<TestComponent />);
		expect(screen.getByTestId("element-value").textContent).toBe("tab1");
		expect(screen.getByTestId("element-isActive").textContent).toBe("true");
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
						{(bindApi) => (
							<button data-testid="update-trigger" onClick={bindApi.handleChange}>
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

	it("should conditionally render based on meta.isActive", () => {
		function TestComponent() {
			const bind = useBind({
				defaultValue: "tab1",
				values: ["tab1", "tab2"] as const,
			});

			return (
				<div>
					<bind.Element value="tab1">
						{(bindApi) =>
							bindApi.meta.isActive && (
								<div data-testid="cond-panel1">Panel 1 Content</div>
							)
						}
					</bind.Element>
					<bind.Element value="tab2">
						{(bindApi) =>
							bindApi.meta.isActive && (
								<div data-testid="cond-panel2">Panel 2 Content</div>
							)
						}
					</bind.Element>
					<bind.Element value="tab2">
						{(bindApi) => (
							<button data-testid="cond-switch" onClick={bindApi.handleChange}>
								Switch
							</button>
						)}
					</bind.Element>
				</div>
			);
		}

		render(<TestComponent />);

		expect(screen.getByTestId("cond-panel1")).toBeInTheDocument();
		expect(screen.queryByTestId("cond-panel2")).not.toBeInTheDocument();

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

		act(() => {
			apiRef!.setValue("tab2");
		});
		expect(screen.getByTestId("api-active").textContent).toBe("tab2");

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

		act(() => {
			apiRef!.setValue("tab2");
		});
		expect(screen.getByTestId("reset-active").textContent).toBe("tab2");

		act(() => {
			apiRef!.reset("tab3");
		});
		expect(screen.getByTestId("reset-active").textContent).toBe("tab3");

		act(() => {
			apiRef!.setValue("tab1");
		});
		expect(screen.getByTestId("reset-active").textContent).toBe("tab1");

		act(() => {
			apiRef!.reset();
		});
		expect(screen.getByTestId("reset-active").textContent).toBe("tab3");
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

	// Re-render count tests
	describe("re-render optimization", () => {
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
			expect(renderCount.current).toBeLessThanOrEqual(2);
		});

		it("should only re-render Subscribe when selected value changes", () => {
			const subscribeRenderCount = { current: 0 };
			const values = ["tab1", "tab2"] as const;
			type Values = typeof values;
			let apiRef: ReturnType<typeof useBind<Values>> | null = null;

			function SubscribeChild({ bind }: { bind: ReturnType<typeof useBind<Values>> }) {
				return (
					<bind.Subscribe selector={(s) => s.value}>
						{(value) => {
							subscribeRenderCount.current++;
							return <div data-testid="subscribe-value">{value}</div>;
						}}
					</bind.Subscribe>
				);
			}

			function TestComponent() {
				const bind = useBind({
					defaultValue: "tab1",
					values: ["tab1", "tab2"] as const,
				});
				apiRef = bind;

				return <SubscribeChild bind={bind} />;
			}

			render(<TestComponent />);
			const initialRenderCount = subscribeRenderCount.current;

			// Setting the same value should not cause re-render
			act(() => {
				apiRef!.setValue("tab1");
			});
			expect(subscribeRenderCount.current).toBe(initialRenderCount);

			// Setting a different value should cause re-render
			act(() => {
				apiRef!.setValue("tab2");
			});
			expect(subscribeRenderCount.current).toBe(initialRenderCount + 1);
		});

		it("should only re-render Element when isActive status changes", () => {
			const elementRenderCounts = { tab1: 0, tab2: 0 };
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
					<div>
						<bind.Element value="tab1">
							{(bindApi) => {
								elementRenderCounts.tab1++;
								return (
									<span data-testid="element-tab1">
										{bindApi.meta.isActive.toString()}
									</span>
								);
							}}
						</bind.Element>
						<bind.Element value="tab2">
							{(bindApi) => {
								elementRenderCounts.tab2++;
								return (
									<span data-testid="element-tab2">
										{bindApi.meta.isActive.toString()}
									</span>
								);
							}}
						</bind.Element>
					</div>
				);
			}

			render(<TestComponent />);
			const initialTab1 = elementRenderCounts.tab1;
			const initialTab2 = elementRenderCounts.tab2;

			// Change to tab2 - both elements should re-render
			act(() => {
				apiRef!.setValue("tab2");
			});
			expect(elementRenderCounts.tab1).toBe(initialTab1 + 1);
			expect(elementRenderCounts.tab2).toBe(initialTab2 + 1);

			// Change back to tab1 - both elements should re-render
			act(() => {
				apiRef!.setValue("tab1");
			});
			expect(elementRenderCounts.tab1).toBe(initialTab1 + 2);
			expect(elementRenderCounts.tab2).toBe(initialTab2 + 2);
		});
	});
});
