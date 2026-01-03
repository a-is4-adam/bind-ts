import { Store } from "@tanstack/store";

/**
 * The state shape managed by CompoundApi
 */
export interface CompoundState<TVariants extends readonly string[]> {
  activeVariant: TVariants[number];
  variants: TVariants;
}

/**
 * Options for creating a CompoundApi instance
 */
export interface CompoundOptions<TVariants extends readonly string[]> {
  defaultVariant: TVariants[number];
  variants: TVariants;
}

/**
 * A class representing the Compound API. It handles the logic and interactions
 * with compound component state (like tabs, accordions, multi-step forms).
 *
 * This is framework-agnostic - use with a framework adapter like `@compound/react`.
 */
export class CompoundApi<TVariants extends readonly string[]> {
  /**
   * The options for the compound component
   */
  options: CompoundOptions<TVariants>;

  /**
   * The store managing the compound state
   */
  store: Store<CompoundState<TVariants>>;

  /**
   * Constructs a new `CompoundApi` instance with the given options.
   */
  constructor(opts: CompoundOptions<TVariants>) {
    this.options = opts;

    this.store = new Store<CompoundState<TVariants>>({
      activeVariant: opts.defaultVariant,
      variants: opts.variants,
    });
  }

  /**
   * Gets the current state
   */
  get state(): CompoundState<TVariants> {
    return this.store.state;
  }

  /**
   * Sets the active variant. Must be arrow function for React spread compatibility.
   */
  setVariant = (variant: TVariants[number]): void => {
    this.store.setState((prev) => ({
      ...prev,
      activeVariant: variant,
    }));
  };

  /**
   * Updates the options. Useful for syncing options from framework hooks.
   */
  update = (opts: CompoundOptions<TVariants>): void => {
    this.options = opts;
  };

  /**
   * Resets the active variant to the default variant.
   * Optionally accepts a new default variant to set before resetting.
   * Useful for "restart wizard" or "reset to new state" use cases.
   */
  reset = (newDefault?: TVariants[number]): void => {
    if (newDefault !== undefined) {
      this.options = {
        ...this.options,
        defaultVariant: newDefault,
      };
    }
    this.store.setState((prev) => ({
      ...prev,
      activeVariant: this.options.defaultVariant,
    }));
  };

  /**
   * Mounts the compound component. Returns a cleanup function.
   * Used by framework adapters for lifecycle management.
   */
  mount = (): (() => void) => {
    // Currently no setup needed, but provides hook for future functionality
    return () => {
      // Cleanup
    };
  };
}
