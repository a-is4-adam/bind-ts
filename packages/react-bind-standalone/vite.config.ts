import { defineConfig } from "vite";

export default defineConfig({
	build: {
		lib: {
			entry: {
				"tanstack-store/index": "./src/tanstack-store/index.tsx",
				"zustand/index": "./src/zustand/index.tsx",
				"context/index": "./src/context/index.tsx",
			},
			formats: ["es"],
		},
		rollupOptions: {
			external: ["react", "react-dom", "@tanstack/store", "@tanstack/react-store", "zustand"],
			output: {
				dir: "dist/esm",
			},
		},
	},
});
