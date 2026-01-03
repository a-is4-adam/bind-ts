import { describe, it, expectTypeOf } from "vitest";
import { CompoundApi } from "../CompoundApi";
import type { CompoundState, CompoundOptions } from "../CompoundApi";
import type { AnyCompoundApi } from "../types";

describe("CompoundApi type tests", () => {
  it("should infer state types correctly", () => {
    const variants = ["tab1", "tab2", "tab3"] as const;
    const compound = new CompoundApi({
      defaultVariant: "tab1",
      variants,
    });

    // activeVariant should be the union of variants
    expectTypeOf(compound.state.activeVariant).toEqualTypeOf<
      "tab1" | "tab2" | "tab3"
    >();

    // variants should be the exact readonly array type
    expectTypeOf(compound.state.variants).toEqualTypeOf<typeof variants>();
  });

  it("should type CompoundState correctly", () => {
    type TestVariants = readonly ["first", "second"];

    type TestState = CompoundState<TestVariants>;

    expectTypeOf<TestState["activeVariant"]>().toEqualTypeOf<
      "first" | "second"
    >();
    expectTypeOf<TestState["variants"]>().toEqualTypeOf<TestVariants>();
  });

  it("should type CompoundOptions correctly", () => {
    type TestVariants = readonly ["a", "b", "c"];

    type TestOptions = CompoundOptions<TestVariants>;

    expectTypeOf<TestOptions["defaultVariant"]>().toEqualTypeOf<
      "a" | "b" | "c"
    >();
    expectTypeOf<TestOptions["variants"]>().toEqualTypeOf<TestVariants>();
  });

  it("should constrain setVariant parameter to defined variants", () => {
    const compound = new CompoundApi({
      defaultVariant: "tab1",
      variants: ["tab1", "tab2"] as const,
    });

    // Valid variant
    compound.setVariant("tab1");
    compound.setVariant("tab2");

    // @ts-expect-error - "tab3" is not a valid variant
    compound.setVariant("tab3");

    // @ts-expect-error - arbitrary string is not a valid variant
    compound.setVariant("invalid");
  });

  it("should constrain reset parameter to defined variants", () => {
    const compound = new CompoundApi({
      defaultVariant: "step1",
      variants: ["step1", "step2", "step3"] as const,
    });

    // Valid usage
    compound.reset();
    compound.reset("step2");
    compound.reset("step3");

    // @ts-expect-error - "step4" is not a valid variant
    compound.reset("step4");
  });

  it("should constrain defaultVariant in options to defined variants", () => {
    // Valid
    new CompoundApi({
      defaultVariant: "a",
      variants: ["a", "b"] as const,
    });

    new CompoundApi({
      // @ts-expect-error - "c" is not in the variants array
      defaultVariant: "c",
      variants: ["a", "b"] as const,
    });
  });

  it("should type store correctly", () => {
    const compound = new CompoundApi({
      defaultVariant: "one",
      variants: ["one", "two"] as const,
    });

    // Store state should match CompoundState
    const storeState = compound.store.state;
    expectTypeOf(storeState.activeVariant).toEqualTypeOf<"one" | "two">();
  });

  it("should type update method parameter correctly", () => {
    const compound = new CompoundApi({
      defaultVariant: "a",
      variants: ["a", "b"] as const,
    });

    // Valid update
    compound.update({
      defaultVariant: "b",
      variants: ["a", "b"] as const,
    });

    compound.update({
      // @ts-expect-error - "c" is not a valid default variant
      defaultVariant: "c",
      variants: ["a", "b"] as const,
    });
  });

  it("should type mount return type correctly", () => {
    const compound = new CompoundApi({
      defaultVariant: "x",
      variants: ["x", "y"] as const,
    });

    const cleanup = compound.mount();

    // cleanup should be a function returning void
    expectTypeOf(cleanup).toEqualTypeOf<() => void>();
  });

  it("should infer options type correctly", () => {
    const compound = new CompoundApi({
      defaultVariant: "first",
      variants: ["first", "second"] as const,
    });

    expectTypeOf(compound.options.defaultVariant).toEqualTypeOf<
      "first" | "second"
    >();
    expectTypeOf(compound.options.variants).toEqualTypeOf<
      readonly ["first", "second"]
    >();
  });

  it("should work with AnyCompoundApi type for loose typing", () => {
    // AnyCompoundApi can be used for function parameters accepting any compound
    function acceptsAnyCompound(compound: AnyCompoundApi) {
      // Can access state with string type
      expectTypeOf(compound.state.activeVariant).toEqualTypeOf<string>();
      // Can call methods with string
      compound.setVariant("any-string");
    }

    const compound = new CompoundApi({
      defaultVariant: "a",
      variants: ["a", "b", "c"] as const,
    });

    // Use type assertion to pass to function
    acceptsAnyCompound(compound as unknown as AnyCompoundApi);
  });
});
