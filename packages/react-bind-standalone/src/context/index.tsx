"use client";

import {
	createContext,
	useContext,
	useMemo,
	useState,
	useCallback,
	useEffect,
	useLayoutEffect,
	useSyncExternalStore,
} from "react";
import type { FunctionComponent, ReactNode } from "react";

// ============================================================================
// Types
// ============================================================================

/**
 * The state shape managed by BindApi
 */
export interface BindState<TValues extends readonly string[]> {
	value: TValues[number];
	values: TValues;
}

/**
 * Listener callbacks for BindApi events
 */
export interface BindListeners<TValues extends readonly string[]> {
	/**
	 * Called when the value changes via setValue or reset
	 */
	onChange?: (props: { value: TValues[number]; bindApi: BindApi<TValues> }) => void;
}

/**
 * Options for creating a BindApi instance
 */
export interface BindOptions<TValues extends readonly string[]> {
	defaultValue: TValues[number];
	values: TValues;
	listeners?: BindListeners<TValues>;
}

/**
 * State object for Element context
 */
export interface ElementState<TValues extends readonly string[]> {
	/** The value this element represents */
	value: TValues[number];
}

/**
 * Meta information for Element context
 */
export interface ElementMeta {
	/** Whether this value is currently active */
	isActive: boolean;
}

/**
 * Context provided to Element render props
 */
export interface ElementContext<TValues extends readonly string[]> {
	/** State object containing the element's value */
	state: ElementState<TValues>;
	/** Meta information about the element */
	meta: ElementMeta;
	/** Handler to set this value as active */
	handleChange: () => void;
}

/**
 * Props for the Element component
 */
export interface ElementProps<TValues extends readonly string[]> {
	/** The value this element represents */
	value: TValues[number];
	/** Render prop receiving the element context */
	children: (context: ElementContext<TValues>) => ReactNode;
}

/**
 * Props for the Subscribe component
 */
export interface SubscribeProps<TValues extends readonly string[], TSelected = BindState<TValues>> {
	/** Optional selector to pick specific state */
	selector?: (state: BindState<TValues>) => TSelected;
	/** Render prop receiving the selected state */
	children: ((state: TSelected) => ReactNode) | ReactNode;
}

// ============================================================================
// Simple Store (like useSyncExternalStore pattern)
// ============================================================================

type Listener = () => void;

class SimpleStore<TState> {
	private state: TState;
	private listeners = new Set<Listener>();

	constructor(initialState: TState) {
		this.state = initialState;
	}

	getState = (): TState => {
		return this.state;
	};

	setState = (updater: TState | ((prev: TState) => TState)): void => {
		const newState =
			typeof updater === "function"
				? (updater as (prev: TState) => TState)(this.state)
				: updater;
		this.state = newState;
		this.listeners.forEach((listener) => listener());
	};

	subscribe = (listener: Listener): (() => void) => {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	};
}

// ============================================================================
// BindApi Class
// ============================================================================

/**
 * A class representing the Bind API using a simple store with useSyncExternalStore.
 */
export class BindApi<TValues extends readonly string[]> {
	/**
	 * The options for the bind component
	 */
	options: BindOptions<TValues>;

	/**
	 * The store managing the bind state
	 */
	store: SimpleStore<BindState<TValues>>;

	/**
	 * Constructs a new `BindApi` instance with the given options.
	 */
	constructor(opts: BindOptions<TValues>) {
		this.options = opts;

		this.store = new SimpleStore<BindState<TValues>>({
			value: opts.defaultValue,
			values: opts.values,
		});
	}

	/**
	 * Gets the current state
	 */
	get state(): BindState<TValues> {
		return this.store.getState();
	}

	/**
	 * Sets the active value. Must be arrow function for React spread compatibility.
	 */
	setValue = (value: TValues[number]): void => {
		const prevValue = this.store.getState().value;
		this.store.setState((prev) => ({
			...prev,
			value: value,
		}));
		if (prevValue !== value) {
			this.options.listeners?.onChange?.({ value, bindApi: this });
		}
	};

	/**
	 * Updates the options. Useful for syncing options from framework hooks.
	 */
	update = (opts: BindOptions<TValues>): void => {
		this.options = opts;
	};

	/**
	 * Resets the active value to the default value.
	 * Optionally accepts a new default value to set before resetting.
	 */
	reset = (newDefault?: TValues[number]): void => {
		if (newDefault !== undefined) {
			this.options = {
				...this.options,
				defaultValue: newDefault,
			};
		}
		const prevValue = this.store.getState().value;
		const nextValue = this.options.defaultValue;
		this.store.setState((prev) => ({
			...prev,
			value: nextValue,
		}));
		if (prevValue !== nextValue) {
			this.options.listeners?.onChange?.({ value: nextValue, bindApi: this });
		}
	};

	/**
	 * Mounts the bind component. Returns a cleanup function.
	 */
	mount = (): (() => void) => {
		return () => {
			// Cleanup
		};
	};
}

// ============================================================================
// React Components and Hook
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

/**
 * useLayoutEffect on client, useEffect on server (SSR safe)
 */
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Hook to subscribe to store with selector
 */
function useStoreSelector<TValues extends readonly string[], TSelected>(
	store: SimpleStore<BindState<TValues>>,
	selector: (state: BindState<TValues>) => TSelected,
): TSelected {
	const getSnapshot = useCallback(() => selector(store.getState()), [store, selector]);
	const getServerSnapshot = getSnapshot;

	return useSyncExternalStore(store.subscribe, getSnapshot, getServerSnapshot);
}

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
	const data = useStoreSelector(bindApi.store, selector);

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
	const storeState = useStoreSelector(bindApi.store, (s) => s);

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
			const selector = props.selector ?? ((s) => s as unknown as TSelected);
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
