import { Store } from "@tanstack/store";

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
 * A class representing the Bind API. It handles the logic and interactions
 * with exclusive selection state (like tabs, accordions, multi-step forms).
 *
 * This is framework-agnostic - use with a framework adapter like `@bind-ts/react`.
 */
export class BindApi<TValues extends readonly string[]> {
	/**
	 * The options for the bind component
	 */
	options: BindOptions<TValues>;

	/**
	 * The store managing the bind state
	 */
	store: Store<BindState<TValues>>;

	/**
	 * Constructs a new `BindApi` instance with the given options.
	 */
	constructor(opts: BindOptions<TValues>) {
		this.options = opts;

		this.store = new Store<BindState<TValues>>({
			value: opts.defaultValue,
			values: opts.values,
		});
	}

	/**
	 * Gets the current state
	 */
	get state(): BindState<TValues> {
		return this.store.state;
	}

	/**
	 * Sets the active value. Must be arrow function for React spread compatibility.
	 */
	setValue = (value: TValues[number]): void => {
		const prevValue = this.store.state.value;
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
	 * Useful for "restart wizard" or "reset to new state" use cases.
	 */
	reset = (newDefault?: TValues[number]): void => {
		if (newDefault !== undefined) {
			this.options = {
				...this.options,
				defaultValue: newDefault,
			};
		}
		const prevValue = this.store.state.value;
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
	 * Used by framework adapters for lifecycle management.
	 */
	mount = (): (() => void) => {
		// Currently no setup needed, but provides hook for future functionality
		return () => {
			// Cleanup
		};
	};
}
