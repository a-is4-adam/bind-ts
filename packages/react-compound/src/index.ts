export { useCompound } from "./useCompound";
export type { ReactCompoundApi, ReactCompoundExtendedApi } from "./useCompound";
export type { SlotRenderContext, SlotProps, SubscribeProps } from "./types";

// Composition APIs
export {
  createCompoundHookContexts,
  createCompoundHook,
} from "./createCompoundHook";
export type {
  AppSlotRenderContext,
  AppSlotProps,
  AppCompoundExtendedApi,
} from "./createCompoundHook";

// Re-export core types for convenience
export type { CompoundOptions, CompoundState } from "@compound/core-compound";
