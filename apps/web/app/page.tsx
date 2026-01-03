"use client";

import styles from "./page.module.css";
import { useBind } from "@bind/react-bind";

import { useAppBind } from "./bind-context";

export default function Home() {
	const tabs = useBind({
		defaultValue: "tab1",
		values: ["tab1", "tab2"],
	});

	const tab = useAppBind("Tab", {
		defaultValue: "tab1",
		values: ["tab1", "tab2"] as const,
	});

	return (
		<div className={styles.page}>
			<main className={styles.main}>
				<h1>base api</h1>
				<tabs.Element value="tab1">
					{(bind) => {
						return <button onClick={bind.handleChange}>Tab 1</button>;
					}}
				</tabs.Element>
				<tabs.Element value="tab2">
					{(bind) => {
						return <button onClick={bind.handleChange}>Tab 2</button>;
					}}
				</tabs.Element>
				<tabs.Element value="tab1">
					{(bind) => {
						if (!bind.meta.isActive) {
							return null;
						}
						return <div>Tab 1</div>;
					}}
				</tabs.Element>
				<tabs.Element value="tab2">
					{(bind) => {
						if (!bind.meta.isActive) {
							return null;
						}
						return <div>Tab 2</div>;
					}}
				</tabs.Element>

				<tabs.Subscribe selector={(state) => state.value}>
					{(value) => {
						return <div>active is {value}</div>;
					}}
				</tabs.Subscribe>

				<hr />

				<h2>Composition api</h2>

				<tab.Element value="tab1">{(bind) => <bind.Tab>Tab 1</bind.Tab>}</tab.Element>
				<tab.Element value="tab2">{(bind) => <bind.Tab>Tab 2</bind.Tab>}</tab.Element>

				<tab.Element value="tab1">
					{(bind) => <bind.TabPanel>Tab 1</bind.TabPanel>}
				</tab.Element>
				<tab.Element value="tab2">
					{(bind) => <bind.TabPanel>Tab 2</bind.TabPanel>}
				</tab.Element>

				<tab.Subscribe selector={(state) => state.value}>
					{(value) => {
						return <div>active is {value}</div>;
					}}
				</tab.Subscribe>
			</main>
		</div>
	);
}
