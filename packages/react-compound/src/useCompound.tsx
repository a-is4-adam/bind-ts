"use client";

import {
  CompoundApi,
  type CompoundOptions,
  type CompoundState,
} from "@compound/core";
import { useStore } from "@tanstack/react-store";
import { useMemo, useState } from "react";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";
import type { SlotProps, SlotRenderContext, SubscribeProps } from "./types";
import type { FunctionComponent, ReactNode } from "react";

/**
 * React-specific API additions to CompoundApi
 */
export interface ReactCompoundApi<TVariants extends readonly string[]> {
  /**
   * A component that renders based on a specific variant.
   * Provides context for both reading state and setting the variant.
   */
  Slot: (props: SlotProps<TVariants>) => ReturnType<FunctionComponent>;

  /**
   * A component that subscribes to compound state changes.
   * Use the selector prop to optimize re-renders.
   */
  Subscribe: <TSelected = CompoundState<TVariants>>(
    props: SubscribeProps<TVariants, TSelected>
  ) => ReturnType<FunctionComponent>;
}

/**
 * The extended API returned by useCompound, combining core API with React components
 */
export type ReactCompoundExtendedApi<TVariants extends readonly string[]> =
  CompoundApi<TVariants> & ReactCompoundApi<TVariants>;

/**
 * Internal Subscribe component that handles store subscription
 */
function LocalSubscribe<TVariants extends readonly string[], TSelected>({
  compoundApi,
  selector,
  children,
}: {
  compoundApi: CompoundApi<TVariants>;
  selector: (state: CompoundState<TVariants>) => TSelected;
  children: ((state: TSelected) => ReactNode) | ReactNode;
}): ReturnType<FunctionComponent> {
  const data = useStore(compoundApi.store, selector);

  if (typeof children === "function") {
    return <>{children(data)}</>;
  }
  return <>{children}</>;
}

/**
 * Internal Slot component that renders based on variant state
 */
function LocalSlot<TVariants extends readonly string[]>({
  compoundApi,
  id,
  children,
}: {
  compoundApi: CompoundApi<TVariants>;
  id: TVariants[number];
  children: (context: SlotRenderContext<TVariants>) => ReactNode;
}): ReturnType<FunctionComponent> {
  const state = useStore(compoundApi.store, (s: CompoundState<TVariants>) => s);

  const context: SlotRenderContext<TVariants> = {
    variant: id,
    isActive: state.activeVariant === id,
    setVariant: () => compoundApi.setVariant(id),
    activeVariant: state.activeVariant,
  };

  return <>{children(context)}</>;
}

/**
 * A custom React Hook that returns an extended instance of the `CompoundApi` class.
 *
 * This API encapsulates all the necessary functionalities for managing compound component state
 * like tabs, accordions, and multi-step forms.
 *
 * @example
 * ```tsx
 * const compound = useCompound({
 *   defaultVariant: "tab1",
 *   variants: ["tab1", "tab2"] as const,
 * });
 *
 * return (
 *   <div>
 *     <compound.Slot id="tab1">
 *       {(ctx) => <button onClick={ctx.setVariant}>Tab 1</button>}
 *     </compound.Slot>
 *     <compound.Slot id="tab1">
 *       {(ctx) => ctx.isActive && <div>Panel 1</div>}
 *     </compound.Slot>
 *   </div>
 * );
 * ```
 */
export function useCompound<TVariants extends readonly string[]>(
  opts: CompoundOptions<TVariants>
): ReactCompoundExtendedApi<TVariants> {
  const [compoundApi] = useState(() => new CompoundApi<TVariants>(opts));

  const extendedApi = useMemo(() => {
    const api = compoundApi as ReactCompoundExtendedApi<TVariants>;

    api.Slot = function Slot(props: SlotProps<TVariants>) {
      return (
        <LocalSlot compoundApi={compoundApi} id={props.id}>
          {props.children}
        </LocalSlot>
      );
    };

    api.Subscribe = function Subscribe<TSelected = CompoundState<TVariants>>(
      props: SubscribeProps<TVariants, TSelected>
    ) {
      const selector = props.selector ?? ((s) => s as unknown as TSelected);
      return (
        <LocalSubscribe
          compoundApi={compoundApi}
          selector={selector}
          children={props.children}
        />
      );
    };

    return api;
  }, [compoundApi]);

  // Mount/unmount lifecycle
  useIsomorphicLayoutEffect(compoundApi.mount, []);

  // Keep options in sync (like a ref, no side effects)
  useIsomorphicLayoutEffect(() => {
    compoundApi.update(opts);
  });

  return extendedApi;
}
