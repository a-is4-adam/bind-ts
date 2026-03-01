import type { ReactNode } from "react";
import type { BindApi } from "./BindApi.js";

// ============================================================================
// Core Types
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

// ============================================================================
// Element Types
// ============================================================================

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
