import { describe, it, expect, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  act,
} from "@testing-library/react";
import { useCompound } from "../useCompound";

describe("useCompound", () => {
  // Ensure each test starts with a clean DOM
  beforeEach(() => {
    cleanup();
  });

  it("should initialize with the default variant", () => {
    function TestComponent() {
      const compound = useCompound({
        defaultVariant: "tab1",
        variants: ["tab1", "tab2"] as const,
      });

      return (
        <compound.Subscribe selector={(s) => s.activeVariant}>
          {(activeVariant) => (
            <div data-testid="init-active">{activeVariant}</div>
          )}
        </compound.Subscribe>
      );
    }

    render(<TestComponent />);
    expect(screen.getByTestId("init-active").textContent).toBe("tab1");
  });

  it("should render Slot with correct context", () => {
    function TestComponent() {
      const compound = useCompound({
        defaultVariant: "tab1",
        variants: ["tab1", "tab2"] as const,
      });

      return (
        <compound.Slot id="tab1">
          {(ctx) => (
            <div>
              <span data-testid="slot-variant">{ctx.variant}</span>
              <span data-testid="slot-isActive">{ctx.isActive.toString()}</span>
              <span data-testid="slot-activeVariant">{ctx.activeVariant}</span>
            </div>
          )}
        </compound.Slot>
      );
    }

    render(<TestComponent />);
    expect(screen.getByTestId("slot-variant").textContent).toBe("tab1");
    expect(screen.getByTestId("slot-isActive").textContent).toBe("true");
    expect(screen.getByTestId("slot-activeVariant").textContent).toBe("tab1");
  });

  it("should update state when setVariant is called from Slot", () => {
    function TestComponent() {
      const compound = useCompound({
        defaultVariant: "tab1",
        variants: ["tab1", "tab2"] as const,
      });

      return (
        <div>
          <compound.Slot id="tab2">
            {(ctx) => (
              <button data-testid="update-trigger" onClick={ctx.setVariant}>
                Switch to Tab 2
              </button>
            )}
          </compound.Slot>
          <compound.Subscribe selector={(s) => s.activeVariant}>
            {(activeVariant) => (
              <div data-testid="update-active">{activeVariant}</div>
            )}
          </compound.Subscribe>
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
      const compound = useCompound({
        defaultVariant: "tab1",
        variants: ["tab1", "tab2"] as const,
      });

      return (
        <div>
          <compound.Slot id="tab1">
            {(ctx) =>
              ctx.isActive && (
                <div data-testid="cond-panel1">Panel 1 Content</div>
              )
            }
          </compound.Slot>
          <compound.Slot id="tab2">
            {(ctx) =>
              ctx.isActive && (
                <div data-testid="cond-panel2">Panel 2 Content</div>
              )
            }
          </compound.Slot>
          <compound.Slot id="tab2">
            {(ctx) => (
              <button data-testid="cond-switch" onClick={ctx.setVariant}>
                Switch
              </button>
            )}
          </compound.Slot>
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
    const variants = ["tab1", "tab2"] as const;
    type Variants = typeof variants;
    let apiRef: ReturnType<typeof useCompound<Variants>> | null = null;

    function TestComponent() {
      const compound = useCompound({
        defaultVariant: "tab1",
        variants: ["tab1", "tab2"] as const,
      });
      apiRef = compound;

      return (
        <compound.Subscribe selector={(s) => s.activeVariant}>
          {(activeVariant) => (
            <div data-testid="api-active">{activeVariant}</div>
          )}
        </compound.Subscribe>
      );
    }

    render(<TestComponent />);
    expect(screen.getByTestId("api-active").textContent).toBe("tab1");

    // Use core API directly - wrap in act() since we're calling outside React
    act(() => {
      apiRef!.setVariant("tab2");
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
      const compound = useCompound({
        defaultVariant: "tab1",
        variants: ["tab1", "tab2"] as const,
      });

      return (
        <compound.Subscribe>
          {(state) => (
            <div>
              <span data-testid="full-active">{state.activeVariant}</span>
              <span data-testid="full-count">{state.variants.length}</span>
            </div>
          )}
        </compound.Subscribe>
      );
    }

    render(<TestComponent />);
    expect(screen.getByTestId("full-active").textContent).toBe("tab1");
    expect(screen.getByTestId("full-count").textContent).toBe("2");
  });

  it("should reset to a new default when provided", () => {
    const variants = ["tab1", "tab2", "tab3"] as const;
    type Variants = typeof variants;
    let apiRef: ReturnType<typeof useCompound<Variants>> | null = null;

    function TestComponent() {
      const compound = useCompound({
        defaultVariant: "tab1",
        variants,
      });
      apiRef = compound;

      return (
        <compound.Subscribe selector={(s) => s.activeVariant}>
          {(activeVariant) => (
            <div data-testid="reset-active">{activeVariant}</div>
          )}
        </compound.Subscribe>
      );
    }

    render(<TestComponent />);
    expect(screen.getByTestId("reset-active").textContent).toBe("tab1");

    // Change to tab2
    act(() => {
      apiRef!.setVariant("tab2");
    });
    expect(screen.getByTestId("reset-active").textContent).toBe("tab2");

    // Reset with new default
    act(() => {
      apiRef!.reset("tab3");
    });
    expect(screen.getByTestId("reset-active").textContent).toBe("tab3");

    // Subsequent reset without argument should use new default
    act(() => {
      apiRef!.setVariant("tab1");
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
      const compound = useCompound({
        defaultVariant: "tab1",
        variants: ["tab1", "tab2"] as const,
      });

      return (
        <compound.Subscribe selector={(s) => s.activeVariant}>
          {(activeVariant) => <div data-testid="no-loop">{activeVariant}</div>}
        </compound.Subscribe>
      );
    }

    render(<TestComponent />);

    // Should only render once during initial mount (React strict mode may double)
    expect(renderCount.current).toBeLessThanOrEqual(2);
  });

  it("should update multiple Slots for the same variant simultaneously", () => {
    function TestComponent() {
      const compound = useCompound({
        defaultVariant: "tab1",
        variants: ["tab1", "tab2"] as const,
      });

      return (
        <div>
          {/* Two slots for tab1 */}
          <compound.Slot id="tab1">
            {(ctx) => (
              <span data-testid="multi-slot1">{ctx.isActive.toString()}</span>
            )}
          </compound.Slot>
          <compound.Slot id="tab1">
            {(ctx) => (
              <span data-testid="multi-slot2">{ctx.isActive.toString()}</span>
            )}
          </compound.Slot>

          {/* Trigger to switch */}
          <compound.Slot id="tab2">
            {(ctx) => (
              <button data-testid="multi-switch" onClick={ctx.setVariant}>
                Switch
              </button>
            )}
          </compound.Slot>
        </div>
      );
    }

    render(<TestComponent />);

    // Both slots should show true initially
    expect(screen.getByTestId("multi-slot1").textContent).toBe("true");
    expect(screen.getByTestId("multi-slot2").textContent).toBe("true");

    // Switch to tab2
    fireEvent.click(screen.getByTestId("multi-switch"));

    // Both slots should update to false simultaneously
    expect(screen.getByTestId("multi-slot1").textContent).toBe("false");
    expect(screen.getByTestId("multi-slot2").textContent).toBe("false");
  });
});
