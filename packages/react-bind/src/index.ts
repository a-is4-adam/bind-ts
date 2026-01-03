export { useBind } from "./useBind";
export type { ReactBindApi, ReactBindExtendedApi } from "./useBind";
export type { ElementContext, ElementProps, SubscribeProps } from "./types";

// Composition APIs
export { createBindContexts, createBindHook } from "./createBindHook";
export type { AppElementContext, AppElementProps, AppBindExtendedApi } from "./createBindHook";

// Re-export core types for convenience
export type { BindOptions, BindState } from "@bind/core";
