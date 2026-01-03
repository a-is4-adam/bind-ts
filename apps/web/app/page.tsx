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
					{(ctx) => {
						return <button onClick={ctx.handleChange}>Tab 1</button>;
					}}
				</tabs.Element>
				<tabs.Element value="tab2">
					{(ctx) => {
						return <button onClick={ctx.handleChange}>Tab 2</button>;
					}}
				</tabs.Element>
				<tabs.Element value="tab1">
					{(ctx) => {
						if (!ctx.isActive) {
							return null;
						}
						return <div>Tab 1</div>;
					}}
				</tabs.Element>
				<tabs.Element value="tab2">
					{(ctx) => {
						if (!ctx.isActive) {
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

				<tab.Element value="tab1">{(ctx) => <ctx.Tab>Tab 1</ctx.Tab>}</tab.Element>
				<tab.Element value="tab2">{(ctx) => <ctx.Tab>Tab 2</ctx.Tab>}</tab.Element>

				<tab.Element value="tab1">
					{(ctx) => <ctx.TabPanel>Tab 1</ctx.TabPanel>}
				</tab.Element>
				<tab.Element value="tab2">
					{(ctx) => <ctx.TabPanel>Tab 2</ctx.TabPanel>}
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
