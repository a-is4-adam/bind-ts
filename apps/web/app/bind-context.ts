import { createBindHook, createBindContexts } from "@bind/react";
import { Tab, TabPanel } from "./tabs";

export const { elementContext, bindContext, useElementContext } = createBindContexts();

export const { useAppBind } = createBindHook({
	elementContext,
	bindContext,
	components: {
		Tab: { Tab, TabPanel },
	},
});
