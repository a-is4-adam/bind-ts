import { describe, it, expectTypeOf } from "vitest";
import type { ComponentType } from "react";
import {
  createCompoundHookContexts,
  createCompoundHook,
} from "../createCompoundHook";
import type {
  AppSlotRenderContext,
  AppSlotProps,
  AppCompoundExtendedApi,
} from "../createCompoundHook";
import type { SlotRenderContext } from "../types";
import type { ReactCompoundExtendedApi } from "../useCompound";

describe("createCompoundHookContexts type tests", () => {
  it("should return correctly typed contexts and hooks", () => {
    const result = createCompoundHookContexts();

    // Should have slotContext and compoundContext
    expectTypeOf(result.slotContext).toBeObject();
    expectTypeOf(result.compoundContext).toBeObject();

    // Should have typed hooks
    expectTypeOf(result.useSlotContext).toBeFunction();
    expectTypeOf(result.useCompoundContext).toBeFunction();
  });

  it("should type useSlotContext with generic parameter", () => {
    const { useSlotContext } = createCompoundHookContexts();

    function TestComponent() {
      // With explicit type parameter
      const slot = useSlotContext<readonly ["tab1", "tab2"]>();

      expectTypeOf(slot.variant).toEqualTypeOf<"tab1" | "tab2">();
      expectTypeOf(slot.isActive).toEqualTypeOf<boolean>();
      expectTypeOf(slot.setVariant).toEqualTypeOf<() => void>();
      expectTypeOf(slot.activeVariant).toEqualTypeOf<"tab1" | "tab2">();

      return null;
    }
  });

  it("should type useCompoundContext with generic parameter", () => {
    const { useCompoundContext } = createCompoundHookContexts();

    function TestComponent() {
      // With explicit type parameter
      const compound = useCompoundContext<readonly ["a", "b", "c"]>();

      expectTypeOf(compound.state.activeVariant).toEqualTypeOf<
        "a" | "b" | "c"
      >();
      expectTypeOf(compound.setVariant).toBeFunction();
      expectTypeOf(compound.Slot).toBeFunction();
      expectTypeOf(compound.Subscribe).toBeFunction();

      return null;
    }
  });
});

describe("createCompoundHook type tests", () => {
  // Setup contexts
  const { slotContext, compoundContext, useSlotContext } =
    createCompoundHookContexts();

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

  it("should type useAppCompound with group key constraint", () => {
    const { useAppCompound } = createCompoundHook({
      slotContext,
      compoundContext,
      components: {
        Tab: { Tab, TabPanel },
        Wizard: { WizardStep },
      },
    });

    function TestComponent() {
      // Valid group keys
      const tabCompound = useAppCompound("Tab", {
        defaultVariant: "tab1",
        variants: ["tab1", "tab2"] as const,
      });

      const wizardCompound = useAppCompound("Wizard", {
        defaultVariant: "step1",
        variants: ["step1", "step2"] as const,
      });

      // @ts-expect-error - "Invalid" is not a valid group key
      useAppCompound("Invalid", {
        defaultVariant: "x",
        variants: ["x"] as const,
      });

      return null;
    }
  });

  it("should type AppSlot id with variant constraint", () => {
    const { useAppCompound } = createCompoundHook({
      slotContext,
      compoundContext,
      components: {
        Tab: { Tab, TabPanel },
      },
    });

    function TestComponent() {
      const compound = useAppCompound("Tab", {
        defaultVariant: "panel1",
        variants: ["panel1", "panel2"] as const,
      });

      return (
        <>
          {/* Valid id */}
          <compound.AppSlot id="panel1">{() => null}</compound.AppSlot>

          {/* @ts-expect-error - "panel3" is not a valid variant */}
          <compound.AppSlot id="panel3">{() => null}</compound.AppSlot>
        </>
      );
    }
  });

  it("should merge component group with slot context in AppSlot children", () => {
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
        <compound.AppSlot id="tab1">
          {(ctx) => {
            // Should have slot context properties
            expectTypeOf(ctx.variant).toEqualTypeOf<"tab1" | "tab2">();
            expectTypeOf(ctx.isActive).toEqualTypeOf<boolean>();
            expectTypeOf(ctx.setVariant).toEqualTypeOf<() => void>();

            // Should have component group
            expectTypeOf(ctx.Tab).toEqualTypeOf<typeof Tab>();
            expectTypeOf(ctx.TabPanel).toEqualTypeOf<typeof TabPanel>();

            return <ctx.Tab>Click me</ctx.Tab>;
          }}
        </compound.AppSlot>
      );
    }
  });

  it("should type AppSlotRenderContext correctly", () => {
    type TestVariants = readonly ["x", "y"];
    type TestComponents = {
      Foo: ComponentType<{ text: string }>;
      Bar: ComponentType<{}>;
    };

    type Context = AppSlotRenderContext<TestVariants, TestComponents>;

    // Slot context properties
    expectTypeOf<Context["variant"]>().toEqualTypeOf<"x" | "y">();
    expectTypeOf<Context["isActive"]>().toEqualTypeOf<boolean>();
    expectTypeOf<Context["setVariant"]>().toEqualTypeOf<() => void>();

    // Component properties
    expectTypeOf<Context["Foo"]>().toEqualTypeOf<
      ComponentType<{ text: string }>
    >();
    expectTypeOf<Context["Bar"]>().toEqualTypeOf<ComponentType<{}>>();
  });

  it("should type AppSlotProps correctly", () => {
    type TestVariants = readonly ["a", "b"];
    type TestComponents = { Comp: ComponentType<{}> };

    type Props = AppSlotProps<TestVariants, TestComponents>;

    expectTypeOf<Props["id"]>().toEqualTypeOf<"a" | "b">();
    expectTypeOf<Props["children"]>().toEqualTypeOf<
      (
        context: AppSlotRenderContext<TestVariants, TestComponents>
      ) => React.ReactNode
    >();
  });

  it("should type AppCompoundExtendedApi correctly", () => {
    type TestVariants = readonly ["one", "two"];
    type TestComponents = { Widget: ComponentType<{}> };

    type Api = AppCompoundExtendedApi<TestVariants, TestComponents>;

    // Should have core API
    expectTypeOf<Api["setVariant"]>().toBeFunction();
    expectTypeOf<Api["reset"]>().toBeFunction();

    // Should have React components
    expectTypeOf<Api["Slot"]>().toBeFunction();
    expectTypeOf<Api["Subscribe"]>().toBeFunction();

    // Should have composition components
    expectTypeOf<Api["AppSlot"]>().toBeFunction();
    expectTypeOf<Api["AppCompound"]>().not.toBeNullable();
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

    const { useAppCompound } = createCompoundHook({
      slotContext,
      compoundContext,
      components: {
        GroupA: { A, B },
        GroupX: { X, Y },
      },
    });

    function TestComponent() {
      const compoundA = useAppCompound("GroupA", {
        defaultVariant: "v1",
        variants: ["v1", "v2"] as const,
      });

      const compoundX = useAppCompound("GroupX", {
        defaultVariant: "v1",
        variants: ["v1", "v2"] as const,
      });

      return (
        <>
          <compoundA.AppSlot id="v1">
            {(ctx) => {
              // GroupA should have A and B
              expectTypeOf(ctx.A).toEqualTypeOf<typeof A>();
              expectTypeOf(ctx.B).toEqualTypeOf<typeof B>();
              // @ts-expect-error - X is not in GroupA
              ctx.X;
              return null;
            }}
          </compoundA.AppSlot>

          <compoundX.AppSlot id="v1">
            {(ctx) => {
              // GroupX should have X and Y
              expectTypeOf(ctx.X).toEqualTypeOf<typeof X>();
              expectTypeOf(ctx.Y).toEqualTypeOf<typeof Y>();
              // @ts-expect-error - A is not in GroupX
              ctx.A;
              return null;
            }}
          </compoundX.AppSlot>
        </>
      );
    }
  });

  it("should inherit core API methods with correct variant types", () => {
    const { useAppCompound } = createCompoundHook({
      slotContext,
      compoundContext,
      components: {
        Test: { Tab },
      },
    });

    function TestComponent() {
      const compound = useAppCompound("Test", {
        defaultVariant: "a",
        variants: ["a", "b", "c"] as const,
      });

      // Valid variants
      compound.setVariant("a");
      compound.setVariant("b");

      // @ts-expect-error - "d" is not a valid variant
      compound.setVariant("d");

      // Reset should also be typed
      compound.reset("c");

      // @ts-expect-error - "invalid" is not valid
      compound.reset("invalid");

      return null;
    }
  });
});
