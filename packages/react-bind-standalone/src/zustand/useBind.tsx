"use client";

import { useStore } from "zustand";
import { useMemo, useState, useEffect, useLayoutEffect } from "react";
import type { FunctionComponent, ReactNode } from "react";
import { BindApi } from "./BindApi.js";
import type {
	BindState,
	BindOptions,
	ElementContext,
	ElementProps,
	SubscribeProps,
} from "./types.js";

// ============================================================================
// React API Types
// ============================================================================

/**
 * React-specific API additions to BindApi
 */
export interface ReactBindApi<TValues extends readonly string[]> {
	Element: (props: ElementProps<TValues>) => ReturnType<FunctionComponent>;
	Subscribe: <TSelected = BindState<TValues>>(
		props: SubscribeProps<TValues, TSelected>,
	) => ReturnType<FunctionComponent>;
}

/**
 * The extended API returned by useBind
 */
export type ReactBindExtendedApi<TValues extends readonly string[]> = BindApi<TValues> &
	ReactBindApi<TValues>;

// ============================================================================
// Internal Utilities
// ============================================================================

/**
 * useLayoutEffect on client, useEffect on server (SSR safe)
 */
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

// ============================================================================
// Internal Components
// ============================================================================

/**
 * Internal Subscribe component
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
 * Internal Element component
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
	const storeState = useStore(bindApi.store);

	const context: ElementContext<TValues> = {
		state: {
			value: value,
		},
		meta: {
			isActive: storeState.value === value,
		},
		handleChange: () => bindApi.setValue(value),
	};

	return <>{children(context)}</>;
}

// ============================================================================
// useBind Hook
// ============================================================================

/**
 * A custom React Hook that returns an extended instance of the `BindApi` class.
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
			const selector =
				props.selector ?? ((s: BindState<TValues>) => s as unknown as TSelected);
			return (
				<LocalSubscribe bindApi={bindApi} selector={selector} children={props.children} />
			);
		};

		return api;
	}, [bindApi]);

	// Mount/unmount lifecycle
	useIsomorphicLayoutEffect(bindApi.mount, []);

	// Keep options in sync
	useIsomorphicLayoutEffect(() => {
		bindApi.update(opts);
	});

	return extendedApi;
}
