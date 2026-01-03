import { describe, it, expect, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  act,
} from "@testing-library/react";
import { useCompound } from "../useCompound";
import {
  createCompoundHookContexts,
  createCompoundHook,
} from "../createCompoundHook";

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

// Composition API Tests
describe("createCompoundHook", () => {
  beforeEach(() => {
    cleanup();
  });

  it("should create contexts and hooks", () => {
    const { slotContext, compoundContext, useSlotContext, useCompoundContext } =
      createCompoundHookContexts();

    expect(slotContext).toBeDefined();
    expect(compoundContext).toBeDefined();
    expect(typeof useSlotContext).toBe("function");
    expect(typeof useCompoundContext).toBe("function");
  });

  it("should create useAppCompound hook with component groups", () => {
    const { slotContext, compoundContext, useSlotContext } =
      createCompoundHookContexts();

    // Define custom components that use the slot context
    function Tab({ children }: { children: React.ReactNode }) {
      const slot = useSlotContext();
      return (
        <button data-testid={`tab-${slot.variant}`} onClick={slot.setVariant}>
          {children}
        </button>
      );
    }

    function TabPanel({ children }: { children: React.ReactNode }) {
      const slot = useSlotContext();
      if (!slot.isActive) return null;
      return <div data-testid={`panel-${slot.variant}`}>{children}</div>;
    }

    const { useAppCompound } = createCompoundHook({
      slotContext,
      compoundContext,
      components: {
        Tab: { Tab, TabPanel },
      },
    });

    function TestComponent() {
      const compound = useAppCompound("Tab", {
        defaultVariant: "tab1",
        variants: ["tab1", "tab2"] as const,
      });

      return (
        <div>
          <compound.AppSlot id="tab1">
            {(ctx) => <ctx.Tab>Tab 1</ctx.Tab>}
          </compound.AppSlot>
          <compound.AppSlot id="tab2">
            {(ctx) => <ctx.Tab>Tab 2</ctx.Tab>}
          </compound.AppSlot>
          <compound.AppSlot id="tab1">
            {(ctx) => <ctx.TabPanel>Panel 1 Content</ctx.TabPanel>}
          </compound.AppSlot>
          <compound.AppSlot id="tab2">
            {(ctx) => <ctx.TabPanel>Panel 2 Content</ctx.TabPanel>}
          </compound.AppSlot>
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

  it("should provide slot context via useSlotContext", () => {
    const { slotContext, compoundContext, useSlotContext } =
      createCompoundHookContexts();

    function SlotInfo() {
      const slot = useSlotContext();
      return (
        <div>
          <span data-testid="slot-variant">{slot.variant}</span>
          <span data-testid="slot-isActive">{slot.isActive.toString()}</span>
          <span data-testid="slot-activeVariant">{slot.activeVariant}</span>
        </div>
      );
    }

    const { useAppCompound } = createCompoundHook({
      slotContext,
      compoundContext,
      components: {
        Info: { SlotInfo },
      },
    });

    function TestComponent() {
      const compound = useAppCompound("Info", {
        defaultVariant: "first",
        variants: ["first", "second"] as const,
      });

      return (
        <compound.AppSlot id="first">
          {(ctx) => <ctx.SlotInfo />}
        </compound.AppSlot>
      );
    }

    render(<TestComponent />);

    expect(screen.getByTestId("slot-variant").textContent).toBe("first");
    expect(screen.getByTestId("slot-isActive").textContent).toBe("true");
    expect(screen.getByTestId("slot-activeVariant").textContent).toBe("first");
  });

  it("should throw error when useSlotContext is used outside AppSlot", () => {
    const { useSlotContext } = createCompoundHookContexts();

    function BadComponent() {
      useSlotContext(); // This should throw
      return <div>Bad</div>;
    }

    expect(() => render(<BadComponent />)).toThrow(
      "`useSlotContext` must be used within an `AppSlot` component"
    );
  });

  it("should support multiple component groups", () => {
    const { slotContext, compoundContext, useSlotContext } =
      createCompoundHookContexts();

    function WizardStep({ children }: { children: React.ReactNode }) {
      const slot = useSlotContext();
      if (!slot.isActive) return null;
      return <div data-testid={`wizard-step-${slot.variant}`}>{children}</div>;
    }

    function WizardNext() {
      const slot = useSlotContext();
      return (
        <button data-testid="wizard-next" onClick={slot.setVariant}>
          Next
        </button>
      );
    }

    const { useAppCompound } = createCompoundHook({
      slotContext,
      compoundContext,
      components: {
        Tab: { Tab: () => null, TabPanel: () => null },
        Wizard: { WizardStep, WizardNext },
      },
    });

    function TestComponent() {
      const compound = useAppCompound("Wizard", {
        defaultVariant: "step1",
        variants: ["step1", "step2"] as const,
      });

      return (
        <div>
          <compound.AppSlot id="step1">
            {(ctx) => <ctx.WizardStep>Step 1</ctx.WizardStep>}
          </compound.AppSlot>
          <compound.AppSlot id="step2">
            {(ctx) => <ctx.WizardStep>Step 2</ctx.WizardStep>}
          </compound.AppSlot>
          <compound.AppSlot id="step2">
            {(ctx) => <ctx.WizardNext />}
          </compound.AppSlot>
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
