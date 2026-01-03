import { describe, it, expectTypeOf } from "vitest";
import { useCompound } from "../useCompound";
import type {
  ReactCompoundExtendedApi,
  ReactCompoundApi,
} from "../useCompound";
import type { SlotRenderContext, SlotProps, SubscribeProps } from "../types";
import type { CompoundState } from "@compound/core-compound";

describe("useCompound type tests", () => {
  it("should return ReactCompoundExtendedApi with correct variant types", () => {
    function TestComponent() {
      const compound = useCompound({
        defaultVariant: "tab1",
        variants: ["tab1", "tab2", "tab3"] as const,
      });

      // Should have correct state types
      expectTypeOf(compound.state.activeVariant).toEqualTypeOf<
        "tab1" | "tab2" | "tab3"
      >();

      // Should have Slot and Subscribe components
      expectTypeOf(compound.Slot).toBeFunction();
      expectTypeOf(compound.Subscribe).toBeFunction();

      // Core API methods should be typed
      expectTypeOf(compound.setVariant).toBeFunction();
      expectTypeOf(compound.reset).toBeFunction();

      return null;
    }
  });

  it("should type setVariant parameter correctly", () => {
    function TestComponent() {
      const compound = useCompound({
        defaultVariant: "a",
        variants: ["a", "b"] as const,
      });

      // Valid variants
      compound.setVariant("a");
      compound.setVariant("b");

      // @ts-expect-error - "c" is not a valid variant
      compound.setVariant("c");

      return null;
    }
  });

  it("should type reset parameter correctly", () => {
    function TestComponent() {
      const compound = useCompound({
        defaultVariant: "step1",
        variants: ["step1", "step2"] as const,
      });

      // Valid usage
      compound.reset();
      compound.reset("step1");

      // @ts-expect-error - "step3" is not a valid variant
      compound.reset("step3");

      return null;
    }
  });

  it("should type SlotRenderContext correctly", () => {
    type TestVariants = readonly ["first", "second"];

    type Context = SlotRenderContext<TestVariants>;

    expectTypeOf<Context["variant"]>().toEqualTypeOf<"first" | "second">();
    expectTypeOf<Context["isActive"]>().toEqualTypeOf<boolean>();
    expectTypeOf<Context["setVariant"]>().toEqualTypeOf<() => void>();
    expectTypeOf<Context["activeVariant"]>().toEqualTypeOf<
      "first" | "second"
    >();
  });

  it("should type SlotProps correctly", () => {
    type TestVariants = readonly ["x", "y", "z"];

    type Props = SlotProps<TestVariants>;

    expectTypeOf<Props["id"]>().toEqualTypeOf<"x" | "y" | "z">();
    expectTypeOf<Props["children"]>().toEqualTypeOf<
      (context: SlotRenderContext<TestVariants>) => React.ReactNode
    >();
  });

  it("should type SubscribeProps correctly", () => {
    type TestVariants = readonly ["on", "off"];

    // Default selected type is full state
    type DefaultProps = SubscribeProps<TestVariants>;

    expectTypeOf<Exclude<DefaultProps["selector"], undefined>>().toEqualTypeOf<
      (state: CompoundState<TestVariants>) => CompoundState<TestVariants>
    >();

    // Custom selected type
    type CustomProps = SubscribeProps<TestVariants, string>;

    expectTypeOf<Exclude<CustomProps["selector"], undefined>>().toEqualTypeOf<
      (state: CompoundState<TestVariants>) => string
    >();
  });

  it("should infer Slot id from variants", () => {
    function TestComponent() {
      const compound = useCompound({
        defaultVariant: "panel1",
        variants: ["panel1", "panel2"] as const,
      });

      // Valid slot usage
      return (
        <>
          <compound.Slot id="panel1">
            {(ctx) => {
              expectTypeOf(ctx.variant).toEqualTypeOf<"panel1" | "panel2">();
              return null;
            }}
          </compound.Slot>
          {/* @ts-expect-error - "panel3" is not a valid id */}
          <compound.Slot id="panel3">{() => null}</compound.Slot>
        </>
      );
    }
  });

  it("should type Subscribe selector and children correctly", () => {
    function TestComponent() {
      const compound = useCompound({
        defaultVariant: "tab1",
        variants: ["tab1", "tab2"] as const,
      });

      return (
        <>
          {/* With selector - children receives selected type */}
          <compound.Subscribe selector={(s) => s.activeVariant}>
            {(activeVariant) => {
              expectTypeOf(activeVariant).toEqualTypeOf<"tab1" | "tab2">();
              return null;
            }}
          </compound.Subscribe>

          {/* Without selector - children receives full state */}
          <compound.Subscribe>
            {(state) => {
              expectTypeOf(state.activeVariant).toEqualTypeOf<
                "tab1" | "tab2"
              >();
              expectTypeOf(state.variants).toEqualTypeOf<
                readonly ["tab1", "tab2"]
              >();
              return null;
            }}
          </compound.Subscribe>
        </>
      );
    }
  });

  it("should type ReactCompoundApi interface correctly", () => {
    type TestVariants = readonly ["a", "b"];

    type Api = ReactCompoundApi<TestVariants>;

    // Should have Slot and Subscribe
    expectTypeOf<Api["Slot"]>().toBeFunction();
    expectTypeOf<Api["Subscribe"]>().toBeFunction();
  });

  it("should type ReactCompoundExtendedApi correctly", () => {
    type TestVariants = readonly ["one", "two"];

    type ExtendedApi = ReactCompoundExtendedApi<TestVariants>;

    // Should have core API methods
    expectTypeOf<ExtendedApi["setVariant"]>().toBeFunction();
    expectTypeOf<ExtendedApi["reset"]>().toBeFunction();
    expectTypeOf<ExtendedApi["mount"]>().toBeFunction();

    // Should have React components
    expectTypeOf<ExtendedApi["Slot"]>().toBeFunction();
    expectTypeOf<ExtendedApi["Subscribe"]>().toBeFunction();

    // Should have typed state
    expectTypeOf<ExtendedApi["state"]["activeVariant"]>().toEqualTypeOf<
      "one" | "two"
    >();
  });

  it("should constrain defaultVariant to variants", () => {
    function TestComponent() {
      // Valid
      useCompound({
        defaultVariant: "valid",
        variants: ["valid", "also-valid"] as const,
      });

      // @ts-expect-error - "invalid" is not in variants
      useCompound({
        defaultVariant: "invalid",
        variants: ["valid", "also-valid"] as const,
      });

      return null;
    }
  });
});
