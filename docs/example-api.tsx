import React from "react";

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

function Tabs({
  children,
  defaultTab,
}: {
  children: React.ReactNode;
  defaultTab: string;
}) {
  const [tab, setTab] = React.useState(defaultTab);
  return (
    <TabsContext.Provider value={{ tab, changeTab: setTab }}>
      {children}
    </TabsContext.Provider>
  );
}

function Tab({ children, tab }: { children: React.ReactNode; tab: string }) {
  const { tab: currentTab, changeTab } = useTabsContext();
  if (tab !== currentTab) {
    return null;
  }
  return <div>{children}</div>;
}

function TabPanel({
  children,
  tab,
}: {
  children: React.ReactNode;
  tab: string;
}) {
  const { tab: currentTab } = useTabsContext();
  if (tab !== currentTab) {
    return null;
  }
  return <div>{children}</div>;
}

function CurrentState() {
    return (
        <Tabs defaultTab="tab1">
            <Tab tab="tab1">Tab 1</Tab>
            <TabPanel tab="tab1">Tab 1</TabPanel>
            <Tab tab="tab2">Tab 2</Tab>
            <TabPanel tab="tab2">Tab 2</TabPanel>
        </Tabs>
    )
}

function ExampleHook() {
    const compound = useCompound({
        defaultVariant: "tab1",
        variants: ['tab1', 'tab2']
    })

    return (
        <div className="flex gap-2">
            <compound.Trigger id="tab1">
                {(ctx) => {
                    return (
                        <button onClick={ctx.handleChange}>
                            Tab 1
                        </button>
                    )
                }}
            </compound.Trigger>
             <compound.Trigger id="tab2">
                {(ctx) => {
                    return (
                        <button onClick={ctx.handleChange}>
                            Tab 1
                        </button>
                    )
                }}
            </compound.Trigger>
        </div>
        <compound.Surface id="tab1">
            {(ctx) => {
                return (
                    <div>
                        {ctx.variant}
                    </div>
                )
            }}
        </compound.Surface>
        <compound.Surface id="tab2">
            {(ctx) => {
                return (
                    <div>
                        {ctx.variant}
                    </div>
                )
            }}
        </compound.Surface>
    )
}
