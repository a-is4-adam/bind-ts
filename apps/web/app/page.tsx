"use client";

import styles from "./page.module.css";
import { useCompound } from "@compound/react";

import { useAppCompound } from "./compound-context";

export default function Home() {
  const compound = useCompound({
    defaultVariant: "tab1",
    variants: ["tab1", "tab2"],
  });

  const tab = useAppCompound("Tab", {
    defaultVariant: "tab1",
    variants: ["tab1", "tab2"] as const,
  });

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>base api</h1>
        <compound.Slot id="tab1">
          {(ctx) => {
            return <button onClick={ctx.setVariant}>Tab 1</button>;
          }}
        </compound.Slot>
        <compound.Slot id="tab2">
          {(ctx) => {
            return <button onClick={ctx.setVariant}>Tab 2</button>;
          }}
        </compound.Slot>
        <compound.Slot id="tab1">
          {(ctx) => {
            if (!ctx.isActive) {
              return null;
            }
            return <div>Tab 1</div>;
          }}
        </compound.Slot>
        <compound.Slot id="tab2">
          {(ctx) => {
            if (!ctx.isActive) {
              return null;
            }
            return <div>Tab 2</div>;
          }}
        </compound.Slot>

        <compound.Subscribe selector={(state) => state.activeVariant}>
          {(variant) => {
            return <div>active is {variant}</div>;
          }}
        </compound.Subscribe>

        <hr />

        <h2>Composition api</h2>

        <tab.AppSlot id="tab1">{(ctx) => <ctx.Tab>Tab 1</ctx.Tab>}</tab.AppSlot>
        <tab.AppSlot id="tab2">{(ctx) => <ctx.Tab>Tab 2</ctx.Tab>}</tab.AppSlot>

        <tab.AppSlot id="tab1">
          {(ctx) => <ctx.TabPanel>Tab 1</ctx.TabPanel>}
        </tab.AppSlot>
        <tab.AppSlot id="tab2">
          {(ctx) => <ctx.TabPanel>Tab 2</ctx.TabPanel>}
        </tab.AppSlot>

        <tab.Subscribe selector={(state) => state.activeVariant}>
          {(variant) => {
            return <div>active is {variant}</div>;
          }}
        </tab.Subscribe>
      </main>
    </div>
  );
}
