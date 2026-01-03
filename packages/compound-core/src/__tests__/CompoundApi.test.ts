import { describe, it, expect, vi } from "vitest";
import { CompoundApi } from "../CompoundApi";

describe("CompoundApi", () => {
  it("should initialize with correct default state", () => {
    const compound = new CompoundApi({
      defaultVariant: "tab1",
      variants: ["tab1", "tab2", "tab3"] as const,
    });

    expect(compound.state.activeVariant).toBe("tab1");
    expect(compound.state.variants).toEqual(["tab1", "tab2", "tab3"]);
  });

  it("should update active variant with setVariant", () => {
    const compound = new CompoundApi({
      defaultVariant: "tab1",
      variants: ["tab1", "tab2"] as const,
    });

    compound.setVariant("tab2");

    expect(compound.state.activeVariant).toBe("tab2");
  });

  it("should return cleanup function from mount", () => {
    const compound = new CompoundApi({
      defaultVariant: "tab1",
      variants: ["tab1"] as const,
    });

    const cleanup = compound.mount();

    expect(typeof cleanup).toBe("function");
    // Should not throw
    cleanup();
  });

  it("should update options with update method", () => {
    const compound = new CompoundApi({
      defaultVariant: "tab1",
      variants: ["tab1", "tab2"] as const,
    });

    compound.update({
      defaultVariant: "tab2",
      variants: ["tab1", "tab2"] as const,
    });

    expect(compound.options.defaultVariant).toBe("tab2");
  });

  it("should reset to default variant", () => {
    const compound = new CompoundApi({
      defaultVariant: "step1",
      variants: ["step1", "step2", "step3"] as const,
    });

    compound.setVariant("step3");
    expect(compound.state.activeVariant).toBe("step3");

    compound.reset();
    expect(compound.state.activeVariant).toBe("step1");
  });

  it("should fire store subscription when variant changes", () => {
    const compound = new CompoundApi({
      defaultVariant: "tab1",
      variants: ["tab1", "tab2"] as const,
    });

    const listener = vi.fn();
    compound.store.subscribe(listener);

    compound.setVariant("tab2");

    expect(listener).toHaveBeenCalled();
  });

  it("should work with a single variant", () => {
    const compound = new CompoundApi({
      defaultVariant: "only",
      variants: ["only"] as const,
    });

    expect(compound.state.activeVariant).toBe("only");
    expect(compound.state.variants).toHaveLength(1);

    // setVariant with same value should still work
    compound.setVariant("only");
    expect(compound.state.activeVariant).toBe("only");
  });

  it("should preserve variants array reference", () => {
    const variants = ["tab1", "tab2", "tab3"] as const;
    const compound = new CompoundApi({
      defaultVariant: "tab1",
      variants,
    });

    // The variants array should be the same reference
    expect(compound.state.variants).toBe(variants);
  });

  it("should fire store subscription on reset", () => {
    const compound = new CompoundApi({
      defaultVariant: "tab1",
      variants: ["tab1", "tab2"] as const,
    });

    compound.setVariant("tab2");

    const listener = vi.fn();
    compound.store.subscribe(listener);

    compound.reset();

    expect(listener).toHaveBeenCalled();
    expect(compound.state.activeVariant).toBe("tab1");
  });

  it("should reset to a new default when provided", () => {
    const compound = new CompoundApi({
      defaultVariant: "tab1",
      variants: ["tab1", "tab2", "tab3"] as const,
    });

    compound.setVariant("tab2");
    expect(compound.state.activeVariant).toBe("tab2");

    // Reset with new default
    compound.reset("tab3");
    expect(compound.state.activeVariant).toBe("tab3");
    expect(compound.options.defaultVariant).toBe("tab3");

    // Subsequent reset should use new default
    compound.setVariant("tab1");
    compound.reset();
    expect(compound.state.activeVariant).toBe("tab3");
  });
});
