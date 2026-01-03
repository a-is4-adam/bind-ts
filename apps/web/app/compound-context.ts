import {
  createCompoundHook,
  createCompoundHookContexts,
} from "@compound/react";
import { Tab, TabPanel } from "./tabs";

export const { slotContext, compoundContext, useSlotContext } =
  createCompoundHookContexts();

export const { useAppCompound } = createCompoundHook({
  slotContext,
  compoundContext,
  components: {
    Tab: { Tab, TabPanel },
  },
});
