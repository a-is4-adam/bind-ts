import { createStore, type StoreApi } from "zustand";
import type { BindState, BindOptions } from "./types.js";

/**
 * A class representing the Bind API using Zustand for state management.
 */
export class BindApi<TValues extends readonly string[]> {
	/**
	 * The options for the bind component
	 */
	options: BindOptions<TValues>;

	/**
	 * The zustand store managing the bind state
	 */
	store: StoreApi<BindState<TValues>>;

	/**
	 * Constructs a new `BindApi` instance with the given options.
	 */
	constructor(opts: BindOptions<TValues>) {
		this.options = opts;

		this.store = createStore<BindState<TValues>>(() => ({
			value: opts.defaultValue,
			values: opts.values,
		}));
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
		this.store.setState({
			value: value,
		});
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
		this.store.setState({
			value: nextValue,
		});
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
