import React from "react";



export const {compoundContext, slotContext, useSlotContext} = createCompoundContexts()

const {useAppCompound} = createCompoundHook({
slotContext,
compoundContext,
components: {
  Tab: {
    Tabs,
    Tab,
    TabPanel
  }, 
  Wizard: {
    Wizard,
    Step,
    Button
  }
}
})

function Tab({children}: {children: React.ReactNode}) {
    const slot = useSlotContext()
    return (
        <button onClick={slot.handleChange}>
            {children}
        </button>
    )
}

function TabPanel({children}: {children: React.ReactNode}) {
    const slot = useSlotContext()

    if (slot.variant !== slot.id) {
        return null
    }

    return (
        <div>
            {children}
        </div>
    )
}

function CompositionExample() {
  const compound = useAppCompound('Tab', {
    defaultVariant: 'tab1',
    variants: ['tab1', 'tab2']
  })

  return (
        <div className="flex gap-2">
            <compound.AppSlot id="tab1">
                {(ctx) => <ctx.Tab>Tab 1</ctx.Tab>}
            </compound.AppSlot>
             <compound.AppSlot id="tab2">
                {(ctx) => <ctx.Tab>Tab 2</ctx.Tab>}
            </compound.AppSlot>
        </div>
        <compound.AppSlot id="tab1">
            {(ctx) => <ctx.TabPanel>Tab 2</ctx.TabPanel>}
        </compound.AppSlot>
        <compound.AppSlot id="tab2">
            {(ctx) => <ctx.TabPanel>Tab 2</ctx.TabPanel>}
        </compound.AppSlot>
    )
}

    


