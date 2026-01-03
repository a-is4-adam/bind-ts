"use client";

import { createContext, useContext, useMemo } from "react";
import { useCompound } from "./useCompound";
import type { CompoundOptions, CompoundState } from "@compound/core";
import type {
  ComponentType,
  Context,
  FunctionComponent,
  PropsWithChildren,
  ReactNode,
} from "react";
import type { ReactCompoundExtendedApi } from "./useCompound";
import type { SlotRenderContext } from "./types";

/**
 * Context for the slot render context, providing access to variant state
 * within custom slot components.
 */
const defaultSlotContext = createContext<SlotRenderContext<readonly string[]>>(
  null as never
);

/**
 * Context for the compound API, providing access to the compound instance
 * within custom components.
 */
const defaultCompoundContext = createContext<
  ReactCompoundExtendedApi<readonly string[]>
>(null as never);

/**
 * Creates the contexts and hooks needed for compound composition.
 *
 * @example
 * ```tsx
 * export const { compoundContext, slotContext, useSlotContext, useCompoundContext } =
 *   createCompoundHookContexts();
 * ```
 */
export function createCompoundHookContexts() {
  const slotContext = createContext<SlotRenderContext<readonly string[]>>(
    null as never
  );

  const compoundContext = createContext<
    ReactCompoundExtendedApi<readonly string[]>
  >(null as never);

  function useSlotContext<
    TVariants extends readonly string[] = readonly string[],
  >() {
    const slot = useContext(slotContext);

    if (!slot) {
      throw new Error(
        "`useSlotContext` must be used within an `AppSlot` component created by `createCompoundHook`"
      );
    }

    return slot as SlotRenderContext<TVariants>;
  }

  function useCompoundContext<
    TVariants extends readonly string[] = readonly string[],
  >() {
    const compound = useContext(compoundContext);

    if (!compound) {
      throw new Error(
        "`useCompoundContext` must be used within an `AppCompound` component created by `createCompoundHook`"
      );
    }

    return compound as unknown as ReactCompoundExtendedApi<TVariants>;
  }

  return {
    slotContext,
    compoundContext,
    useSlotContext,
    useCompoundContext,
  };
}

/**
 * A record of component groups, where each key is a group name
 * and the value is a record of components in that group.
 */
type ComponentGroups = Record<string, Record<string, ComponentType<any>>>;

/**
 * Props for the createCompoundHook factory function.
 */
interface CreateCompoundHookProps<TComponentGroups extends ComponentGroups> {
  slotContext: Context<SlotRenderContext<readonly string[]>>;
  compoundContext: Context<ReactCompoundExtendedApi<readonly string[]>>;
  components: TComponentGroups;
}

/**
 * Context passed to AppSlot children, including the slot render context
 * and the selected component group.
 */
export type AppSlotRenderContext<
  TVariants extends readonly string[],
  TComponents extends Record<string, ComponentType<any>>,
> = SlotRenderContext<TVariants> & TComponents;

/**
 * Props for the AppSlot component.
 */
export interface AppSlotProps<
  TVariants extends readonly string[],
  TComponents extends Record<string, ComponentType<any>>,
> {
  /** The variant ID this slot represents */
  id: TVariants[number];
  /** Render prop receiving the slot context with components */
  children: (
    context: AppSlotRenderContext<TVariants, TComponents>
  ) => ReactNode;
}

/**
 * Extended compound API with composition support.
 */
export type AppCompoundExtendedApi<
  TVariants extends readonly string[],
  TComponents extends Record<string, ComponentType<any>>,
> = ReactCompoundExtendedApi<TVariants> & {
  /**
   * A slot component that provides both slot context and the selected component group.
   * Use this to render pre-bound custom components.
   */
  AppSlot: (
    props: AppSlotProps<TVariants, TComponents>
  ) => ReturnType<FunctionComponent>;

  /**
   * A wrapper component that provides compound context to children.
   * Use this when you need access to the compound API in deeply nested components.
   */
  AppCompound: ComponentType<PropsWithChildren<{}>>;
};

/**
 * Creates a custom compound hook factory with pre-bound component groups.
 *
 * @example
 * ```tsx
 * const { slotContext, compoundContext, useSlotContext } = createCompoundHookContexts();
 *
 * function Tab({ children }: { children: React.ReactNode }) {
 *   const slot = useSlotContext();
 *   return <button onClick={slot.setVariant}>{children}</button>;
 * }
 *
 * function TabPanel({ children }: { children: React.ReactNode }) {
 *   const slot = useSlotContext();
 *   if (!slot.isActive) return null;
 *   return <div>{children}</div>;
 * }
 *
 * const { useAppCompound } = createCompoundHook({
 *   slotContext,
 *   compoundContext,
 *   components: {
 *     Tab: { Tab, TabPanel },
 *     Wizard: { Step, Button },
 *   },
 * });
 *
 * function MyTabs() {
 *   const compound = useAppCompound('Tab', {
 *     defaultVariant: 'tab1',
 *     variants: ['tab1', 'tab2'] as const,
 *   });
 *
 *   return (
 *     <div>
 *       <compound.AppSlot id="tab1">
 *         {(ctx) => <ctx.Tab>Tab 1</ctx.Tab>}
 *       </compound.AppSlot>
 *       <compound.AppSlot id="tab1">
 *         {(ctx) => <ctx.TabPanel>Panel 1</ctx.TabPanel>}
 *       </compound.AppSlot>
 *     </div>
 *   );
 * }
 * ```
 */
export function createCompoundHook<
  const TComponentGroups extends ComponentGroups,
>({
  slotContext,
  compoundContext,
  components,
}: CreateCompoundHookProps<TComponentGroups>) {
  function useAppCompound<
    TGroupKey extends keyof TComponentGroups,
    TVariants extends readonly string[],
  >(
    groupKey: TGroupKey,
    opts: CompoundOptions<TVariants>
  ): AppCompoundExtendedApi<TVariants, TComponentGroups[TGroupKey]> {
    const compoundApi = useCompound(opts);
    const componentGroup = components[groupKey];

    const AppCompound = useMemo<ComponentType<PropsWithChildren<{}>>>(() => {
      return ({ children }) => {
        return (
          <compoundContext.Provider
            value={
              compoundApi as unknown as ReactCompoundExtendedApi<
                readonly string[]
              >
            }
          >
            {children}
          </compoundContext.Provider>
        );
      };
    }, [compoundApi]);

    const AppSlot = useMemo(() => {
      return function AppSlot(
        props: AppSlotProps<TVariants, TComponentGroups[TGroupKey]>
      ) {
        return (
          <compoundApi.Slot id={props.id}>
            {(slotCtx) => {
              // Merge slot context with component group
              const appSlotContext = {
                ...slotCtx,
                ...componentGroup,
              } as AppSlotRenderContext<TVariants, TComponentGroups[TGroupKey]>;

              return (
                <slotContext.Provider
                  value={slotCtx as SlotRenderContext<readonly string[]>}
                >
                  {props.children(appSlotContext)}
                </slotContext.Provider>
              );
            }}
          </compoundApi.Slot>
        );
      };
    }, [compoundApi, componentGroup]);

    const extendedApi = useMemo(() => {
      return Object.assign({}, compoundApi, {
        AppSlot,
        AppCompound,
      }) as AppCompoundExtendedApi<TVariants, TComponentGroups[TGroupKey]>;
    }, [compoundApi, AppSlot, AppCompound]);

    return extendedApi;
  }

  return {
    useAppCompound,
  };
}
