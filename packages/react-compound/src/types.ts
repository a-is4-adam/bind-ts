import type { CompoundState } from "@compound/core-compound";
import type { ReactNode } from "react";

/**
 * Context provided to Slot render props
 */
export interface SlotRenderContext<TVariants extends readonly string[]> {
  /** The variant this slot represents */
  variant: TVariants[number];
  /** Whether this variant is currently active */
  isActive: boolean;
  /** Handler to set this variant as active */
  setVariant: () => void;
  /** The currently active variant */
  activeVariant: TVariants[number];
}

/**
 * Props for the Slot component
 */
export interface SlotProps<TVariants extends readonly string[]> {
  /** The variant ID this slot represents */
  id: TVariants[number];
  /** Render prop receiving the slot context */
  children: (context: SlotRenderContext<TVariants>) => ReactNode;
}

/**
 * Props for the Subscribe component
 */
export interface SubscribeProps<
  TVariants extends readonly string[],
  TSelected = CompoundState<TVariants>,
> {
  /** Optional selector to pick specific state */
  selector?: (state: CompoundState<TVariants>) => TSelected;
  /** Render prop receiving the selected state */
  children: ((state: TSelected) => ReactNode) | ReactNode;
}
