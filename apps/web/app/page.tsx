"use client";

import styles from "./page.module.css";
import { useBind } from "@bind/react-bind";

import { useAppBind } from "./bind-context";

export default function Home() {
	return (
		<div className={styles.page}>
			<main className={styles.main}>
				<h1>base api</h1>
				<BaseApi />
				<hr />
				<h2>Composition api</h2>
				<CompositionApi />
			</main>
		</div>
	);
}

function BaseApi() {
	const tabs = useBind({
		defaultValue: "tab1",
		values: ["tab1", "tab2"],
	});

	return (
		<>
			<tabs.Element value="tab1">
				{(bindApi) => {
					return <button onClick={bindApi.handleChange}>Tab 1</button>;
				}}
			</tabs.Element>
			<tabs.Element value="tab2">
				{(bindApi) => {
					return <button onClick={bindApi.handleChange}>Tab 2</button>;
				}}
			</tabs.Element>
			<tabs.Element value="tab1">
				{(bindApi) => {
					if (!bindApi.meta.isActive) {
						return null;
					}
					return <div>Tab 1</div>;
				}}
			</tabs.Element>
			<tabs.Element value="tab2">
				{(bindApi) => {
					if (!bindApi.meta.isActive) {
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
		</>
	);
}

function CompositionApi() {
	const tabs = useAppBind("Tab", {
		defaultValue: "tab1",
		values: ["tab1", "tab2"] as const,
	});

	return (
		<>
			<tabs.Element value="tab1">
				{(bindApi) => <bindApi.Tab>Tab 1</bindApi.Tab>}
			</tabs.Element>
			<tabs.Element value="tab2">
				{(bindApi) => <bindApi.Tab>Tab 2</bindApi.Tab>}
			</tabs.Element>

			<tabs.Element value="tab1">
				{(bindApi) => <bindApi.TabPanel>Tab 1</bindApi.TabPanel>}
			</tabs.Element>
			<tabs.Element value="tab2">
				{(bindApi) => <bindApi.TabPanel>Tab 2</bindApi.TabPanel>}
			</tabs.Element>

			<tabs.Subscribe selector={(state) => state.value}>
				{(value) => {
					return <div>active is {value}</div>;
				}}
			</tabs.Subscribe>
		</>
	);
}
