# @bind

**Headless UI for building type-safe compound components.** Stop writing repetitive context boilerplate for tabs, accordions, wizards, and other UI patterns that need "one active item at a time" logic. Framework agnostic with first-class React support.

Built on top of [@tanstack/store](https://tanstack.com/store), heavily inspired by [@tanstack/form](https://tanstack.com/form).

## Just want to see a full example?

Check out [`page.tsx`](apps/web/app/page.tsx) and [`bind-context.ts`](apps/web/app/bind-context.ts) for example usage.

## Installation

Coming soon!

## The Problem

Building compound components like tabs requires creating context providers, hooks, and managing state manually:

```tsx
const TabsContext = React.createContext<
	| {
			tab: string;
			changeTab: (tab: string) => void;
	  }
	| undefined
>(undefined);

function useTabsContext() {
	const context = React.useContext(TabsContext);
	if (!context) {
		throw new Error("useTabsContext must be used within a TabsContextProvider");
	}
	return context;
}

function Tabs({ children, defaultTab }: { children: React.ReactNode; defaultTab: string }) {
	const [tab, setTab] = React.useState(defaultTab);
	return (
		<TabsContext.Provider value={{ tab, changeTab: setTab }}>{children}</TabsContext.Provider>
	);
}

function Tab({ children, tab }: { children: React.ReactNode; tab: string }) {
	const { tab: currentTab, changeTab } = useTabsContext();
	if (tab !== currentTab) {
		return null;
	}
	return <div>{children}</div>;
}

function TabPanel({ children, tab }: { children: React.ReactNode; tab: string }) {
	const { tab: currentTab } = useTabsContext();
	if (tab !== currentTab) {
		return null;
	}
	return <div>{children}</div>;
}
```

This is a lot of boilerplate for a common pattern and you'll need to repeat it for accordions, wizards, radio groups, and more.

## The Solution: `useBind`

`useBind` provides all the state management and element binding you need in a single hook:

```tsx
import { useBind } from "@bind/react-bind";

function Example() {
	const bind = useBind({
		defaultValue: "tab1",
		values: ["tab1", "tab2"],
	});

	return (
		<>
			<div className="flex gap-2">
				<bind.Element value="tab1">
					{(bindApi) => {
						return <button onClick={bindApi.handleChange}>Tab 1</button>;
					}}
				</bind.Element>
				<bind.Element value="tab2">
					{(bindApi) => {
						return <button onClick={bindApi.handleChange}>Tab 2</button>;
					}}
				</bind.Element>
			</div>
			<bind.Element value="tab1">
				{(bindApi) => {
					return <div>{bindApi.state.value}</div>;
				}}
			</bind.Element>
			<bind.Element value="tab2">
				{(bindApi) => {
					return <div>{bindApi.state.value}</div>;
				}}
			</bind.Element>
		</>
	);
}
```

Each `bind.Element` receives a render prop with full access to:

- `bindApi.state.value` — the element's value
- `bindApi.meta.isActive` — whether this element is currently active
- `bindApi.handleChange` — a handler to activate this element

## Subscribing to State

Need to display or react to the current active value outside of an `Element`? Use `bind.Subscribe`:

```tsx
function Example() {
	const bind = useBind({
		defaultValue: "tab1",
		values: ["tab1", "tab2"],
	});

	return (
		<>
			{/* Subscribe with a selector for fine-grained reactivity */}
			<bind.Subscribe selector={(state) => state.value}>
				{(activeValue) => <span>Active: {activeValue}</span>}
			</bind.Subscribe>

			{/* Or subscribe to the full state */}
			<bind.Subscribe>
				{(state) => (
					<span>
						{state.value} of {state.values.length} tabs
					</span>
				)}
			</bind.Subscribe>
		</>
	);
}
```

The `selector` prop lets you pick exactly what state you need, preventing unnecessary re-renders when unrelated state changes.

## Component Composition API

Redefining these render props for every use can become cumbersome. The **Composition API** lets you define reusable components that automatically receive bind context:

```tsx
import { createBindContexts, createBindHook } from "@bind/react-bind";

// Create shared contexts
export const { bindContext, elementContext, useElementContext } = createBindContexts();

// Define reusable components
function Tab({ children }: { children: React.ReactNode }) {
	const element = useElementContext();
	return <button onClick={element.handleChange}>{children}</button>;
}

function TabPanel({ children }: { children: React.ReactNode }) {
	const element = useElementContext();

	if (!element.meta.isActive) {
		return null;
	}

	return <div>{children}</div>;
}

// Create a typed hook with your components
const { useAppBind } = createBindHook({
	elementContext,
	bindContext,
	components: {
		Tab: {
			Tab,
			TabPanel,
		},
		// define other groups of components here such as Wizard, Accordion, etc.
	},
});

// Usage becomes clean and declarative
function CompositionExample() {
	const bind = useAppBind("Tab", {
		defaultValue: "tab1",
		values: ["tab1", "tab2"],
	});

	return (
		<>
			<div className="flex gap-2">
				<bind.Element value="tab1">
					{(bindApi) => <bindApi.Tab>Tab 1</bindApi.Tab>}
				</bind.Element>
				<bind.Element value="tab2">
					{(bindApi) => <bindApi.Tab>Tab 2</bindApi.Tab>}
				</bind.Element>
			</div>
			<bind.Element value="tab1">
				{(bindApi) => <bindApi.TabPanel>Tab 1 Content</bindApi.TabPanel>}
			</bind.Element>
			<bind.Element value="tab2">
				{(bindApi) => <bindApi.TabPanel>Tab 2 Content</bindApi.TabPanel>}
			</bind.Element>
		</>
	);
}
```

With the Composition API, you define your component library once and get type-safe access to the right components for each use case.

## Packages

| Package            | Description                                    |
| ------------------ | ---------------------------------------------- |
| `@bind/bind-core`  | Framework-agnostic core with `@tanstack/store` |
| `@bind/react-bind` | React bindings with hooks and components       |

## License

MIT

## Attribution

Huge shoutout to the maintainers over at [Tanstack](https://tanstack.com/), espically those working on [Tanstack Store](https://tanstack.com/store/latest) and [Tanstack Form](https://tanstack.com/form/latest). Using their codebases as the learning material for this project was invaluable. I've always been curious about how these libraries work under the hood and I'm grateful for the opportunity to learn from them.
