"use client";

import { createContext, useContext, useMemo } from "react";
import { useBind } from "./useBind";
import type { BindOptions, BindState } from "@bind/bind-core";
import type {
	ComponentType,
	Context,
	FunctionComponent,
	PropsWithChildren,
	ReactNode,
} from "react";
import type { ReactBindExtendedApi } from "./useBind";
import type { ElementContext } from "./types";

/**
 * Context for the element render context, providing access to value state
 * within custom element components.
 */
const defaultElementContext = createContext<ElementContext<readonly string[]>>(null as never);

/**
 * Context for the bind API, providing access to the bind instance
 * within custom components.
 */
const defaultBindContext = createContext<ReactBindExtendedApi<readonly string[]>>(null as never);

/**
 * Creates the contexts and hooks needed for bind composition.
 *
 * @example
 * ```tsx
 * export const { bindContext, elementContext, useElementContext, useBindContext } =
 *   createBindContexts();
 * ```
 */
export function createBindContexts() {
	const elementContext = createContext<ElementContext<readonly string[]>>(null as never);

	const bindContext = createContext<ReactBindExtendedApi<readonly string[]>>(null as never);

	function useElementContext<TValues extends readonly string[] = readonly string[]>() {
		const element = useContext(elementContext);

		if (!element) {
			throw new Error(
				"`useElementContext` must be used within an `Element` component created by `createBindHook`",
			);
		}

		return element as ElementContext<TValues>;
	}

	function useBindContext<TValues extends readonly string[] = readonly string[]>() {
		const bindApi = useContext(bindContext);

		if (!bindApi) {
			throw new Error(
				"`useBindContext` must be used within an `AppBind` component created by `createBindHook`",
			);
		}

		return bindApi as unknown as ReactBindExtendedApi<TValues>;
	}

	return {
		elementContext,
		bindContext,
		useElementContext,
		useBindContext,
	};
}

/**
 * A record of component groups, where each key is a group name
 * and the value is a record of components in that group.
 */
type ComponentGroups = Record<string, Record<string, ComponentType<any>>>;

/**
 * Props for the createBindHook factory function.
 */
interface CreateBindHookProps<TComponentGroups extends ComponentGroups> {
	elementContext: Context<ElementContext<readonly string[]>>;
	bindContext: Context<ReactBindExtendedApi<readonly string[]>>;
	components: TComponentGroups;
}

/**
 * Context passed to Element children, including the element render context
 * and the selected component group.
 */
export type AppElementContext<
	TValues extends readonly string[],
	TComponents extends Record<string, ComponentType<any>>,
> = ElementContext<TValues> & TComponents;

/**
 * Props for the Element component in composition API.
 */
export interface AppElementProps<
	TValues extends readonly string[],
	TComponents extends Record<string, ComponentType<any>>,
> {
	/** The value this element represents */
	value: TValues[number];
	/** Render prop receiving the element context with components */
	children: (context: AppElementContext<TValues, TComponents>) => ReactNode;
}

/**
 * Extended bind API with composition support.
 */
export type AppBindExtendedApi<
	TValues extends readonly string[],
	TComponents extends Record<string, ComponentType<any>>,
> = Omit<ReactBindExtendedApi<TValues>, "Element"> & {
	/**
	 * An element component that provides both element context and the selected component group.
	 * Use this to render pre-bound custom components.
	 */
	Element: (props: AppElementProps<TValues, TComponents>) => ReturnType<FunctionComponent>;

	/**
	 * A wrapper component that provides bind context to children.
	 * Use this when you need access to the bind API in deeply nested components.
	 */
	AppBind: ComponentType<PropsWithChildren<{}>>;
};

/**
 * Creates a custom bind hook factory with pre-bound component groups.
 *
 * @example
 * ```tsx
 * const { elementContext, bindContext, useElementContext } = createBindContexts();
 *
 * function Tab({ children }: { children: React.ReactNode }) {
 *   const element = useElementContext();
 *   return <button onClick={element.handleChange}>{children}</button>;
 * }
 *
 * function TabPanel({ children }: { children: React.ReactNode }) {
 *   const element = useElementContext();
 *   if (!element.meta.isActive) return null;
 *   return <div>{children}</div>;
 * }
 *
 * const { useAppBind } = createBindHook({
 *   elementContext,
 *   bindContext,
 *   components: {
 *     Tab: { Tab, TabPanel },
 *     Wizard: { Step, Button },
 *   },
 * });
 *
 * function MyTabs() {
 *   const tabs = useAppBind('Tab', {
 *     defaultValue: 'tab1',
 *     values: ['tab1', 'tab2'] as const,
 *   });
 *
 *   return (
 *     <div>
 *       <tabs.Element value="tab1">
 *         {(bindApi) => <bindApi.Tab>Tab 1</bindApi.Tab>}
 *       </tabs.Element>
 *       <tabs.Element value="tab1">
 *         {(bindApi) => <bindApi.TabPanel>Panel 1</bindApi.TabPanel>}
 *       </tabs.Element>
 *     </div>
 *   );
 * }
 * ```
 */
export function createBindHook<const TComponentGroups extends ComponentGroups>({
	elementContext,
	bindContext,
	components,
}: CreateBindHookProps<TComponentGroups>) {
	function useAppBind<
		TGroupKey extends keyof TComponentGroups,
		TValues extends readonly string[],
	>(
		groupKey: TGroupKey,
		opts: BindOptions<TValues>,
	): AppBindExtendedApi<TValues, TComponentGroups[TGroupKey]> {
		const bindApi = useBind(opts);
		const componentGroup = components[groupKey];

		const AppBind = useMemo<ComponentType<PropsWithChildren<{}>>>(() => {
			return ({ children }) => {
				return (
					<bindContext.Provider
						value={bindApi as unknown as ReactBindExtendedApi<readonly string[]>}
					>
						{children}
					</bindContext.Provider>
				);
			};
		}, [bindApi]);

		const Element = useMemo(() => {
			return function Element(props: AppElementProps<TValues, TComponentGroups[TGroupKey]>) {
				return (
					<bindApi.Element value={props.value}>
						{(bindApi) => {
							// Merge element context with component group
							const appElementContext = {
								...bindApi,
								...componentGroup,
							} as AppElementContext<TValues, TComponentGroups[TGroupKey]>;

							return (
								<elementContext.Provider
									value={bindApi as ElementContext<readonly string[]>}
								>
									{props.children(appElementContext)}
								</elementContext.Provider>
							);
						}}
					</bindApi.Element>
				);
			};
		}, [bindApi, componentGroup]);

		const extendedApi = useMemo(() => {
			return Object.assign({}, bindApi, {
				Element,
				AppBind,
			}) as AppBindExtendedApi<TValues, TComponentGroups[TGroupKey]>;
		}, [bindApi, Element, AppBind]);

		return extendedApi;
	}

	return {
		useAppBind,
	};
}
