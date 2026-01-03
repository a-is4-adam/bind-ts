"use client";

import { BindApi, type BindOptions, type BindState } from "@bind/core";
import { useStore } from "@tanstack/react-store";
import { useMemo, useState } from "react";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";
import type { ElementProps, ElementContext, SubscribeProps } from "./types";
import type { FunctionComponent, ReactNode } from "react";

/**
 * React-specific API additions to BindApi
 */
export interface ReactBindApi<TValues extends readonly string[]> {
	/**
	 * A component that renders based on a specific value.
	 * Provides context for both reading state and setting the value.
	 */
	Element: (props: ElementProps<TValues>) => ReturnType<FunctionComponent>;

	/**
	 * A component that subscribes to bind state changes.
	 * Use the selector prop to optimize re-renders.
	 */
	Subscribe: <TSelected = BindState<TValues>>(
		props: SubscribeProps<TValues, TSelected>,
	) => ReturnType<FunctionComponent>;
}

/**
 * The extended API returned by useBind, combining core API with React components
 */
export type ReactBindExtendedApi<TValues extends readonly string[]> = BindApi<TValues> &
	ReactBindApi<TValues>;

/**
 * Internal Subscribe component that handles store subscription
 */
function LocalSubscribe<TValues extends readonly string[], TSelected>({
	bindApi,
	selector,
	children,
}: {
	bindApi: BindApi<TValues>;
	selector: (state: BindState<TValues>) => TSelected;
	children: ((state: TSelected) => ReactNode) | ReactNode;
}): ReturnType<FunctionComponent> {
	const data = useStore(bindApi.store, selector);

	if (typeof children === "function") {
		return <>{children(data)}</>;
	}
	return <>{children}</>;
}

/**
 * Internal Element component that renders based on value state
 */
function LocalElement<TValues extends readonly string[]>({
	bindApi,
	value,
	children,
}: {
	bindApi: BindApi<TValues>;
	value: TValues[number];
	children: (context: ElementContext<TValues>) => ReactNode;
}): ReturnType<FunctionComponent> {
	const state = useStore(bindApi.store, (s: BindState<TValues>) => s);

	const context: ElementContext<TValues> = {
		value: value,
		isActive: state.value === value,
		handleChange: () => bindApi.setValue(value),
		activeValue: state.value,
	};

	return <>{children(context)}</>;
}

/**
 * A custom React Hook that returns an extended instance of the `BindApi` class.
 *
 * This API encapsulates all the necessary functionalities for managing exclusive selection state
 * like tabs, accordions, and multi-step forms.
 *
 * @example
 * ```tsx
 * const tabs = useBind({
 *   defaultValue: "tab1",
 *   values: ["tab1", "tab2"] as const,
 * });
 *
 * return (
 *   <div>
 *     <tabs.Element value="tab1">
 *       {(bindApi) => <button onClick={bindApi.handleChange}>Tab 1</button>}
 *     </tabs.Element>
 *     <tabs.Element value="tab1">
 *       {(bindApi) => ctx.isActive && <div>Panel 1</div>}
 *     </tabs.Element>
 *   </div>
 * );
 * ```
 */
export function useBind<TValues extends readonly string[]>(
	opts: BindOptions<TValues>,
): ReactBindExtendedApi<TValues> {
	const [bindApi] = useState(() => new BindApi<TValues>(opts));

	const extendedApi = useMemo(() => {
		const api = bindApi as ReactBindExtendedApi<TValues>;

		api.Element = function Element(props: ElementProps<TValues>) {
			return (
				<LocalElement bindApi={bindApi} value={props.value}>
					{props.children}
				</LocalElement>
			);
		};

		api.Subscribe = function Subscribe<TSelected = BindState<TValues>>(
			props: SubscribeProps<TValues, TSelected>,
		) {
			const selector = props.selector ?? ((s) => s as unknown as TSelected);
			return (
				<LocalSubscribe bindApi={bindApi} selector={selector} children={props.children} />
			);
		};

		return api;
	}, [bindApi]);

	// Mount/unmount lifecycle
	useIsomorphicLayoutEffect(bindApi.mount, []);

	// Keep options in sync (like a ref, no side effects)
	useIsomorphicLayoutEffect(() => {
		bindApi.update(opts);
	});

	return extendedApi;
}
