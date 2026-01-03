import React from "react";

export const { bindContext, elementContext, useElementContext } = createBindContexts();

const { useAppBind } = createBindHook({
	elementContext,
	bindContext,
	components: {
		Tab: {
			Tabs,
			Tab,
			TabPanel,
		},
		Wizard: {
			Wizard,
			Step,
			Button,
		},
	},
});

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

function CompositionExample() {
	const bind = useAppBind("Tab", {
		defaultValue: "tab1",
		values: ["tab1", "tab2"],
	});

	return (
		<>
			<div className="flex gap-2">
				<bind.Element value="tab1">{(bindApi) => <ctx.Tab>Tab 1</ctx.Tab>}</bind.Element>
				<bind.Element value="tab2">{(bindApi) => <ctx.Tab>Tab 2</ctx.Tab>}</bind.Element>
			</div>
			<bind.Element value="tab1">
				{(bindApi) => <ctx.TabPanel>Tab 1</ctx.TabPanel>}
			</bind.Element>
			<bind.Element value="tab2">
				{(bindApi) => <ctx.TabPanel>Tab 2</ctx.TabPanel>}
			</bind.Element>
		</>
	);
}
