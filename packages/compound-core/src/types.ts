/**
 * Context provided to Trigger render props
 */
export interface TriggerRenderContext<TVariants extends readonly string[]> {
  /** The variant this trigger controls */
  variant: TVariants[number];
  /** Whether this variant is currently active */
  isActive: boolean;
  /** Handler to activate this variant */
  handleChange: () => void;
}

/**
 * Context provided to Surface render props
 */
export interface SurfaceRenderContext<TVariants extends readonly string[]> {
  /** The variant this surface displays */
  variant: TVariants[number];
  /** Whether this variant is currently active */
  isActive: boolean;
}

/**
 * A type representing the CompoundApi with all generics set to `any` for convenience.
 */
export type AnyCompoundApi = import("./CompoundApi").CompoundApi<
  readonly string[]
>;
