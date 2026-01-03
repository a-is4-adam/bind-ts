import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
	build: {
		lib: {
			entry: resolve(__dirname, "src/index.ts"),
			name: "BindReact",
			formats: ["es", "cjs"],
			fileName: (format) => {
				if (format === "es") return "esm/index.js";
				return "cjs/index.cjs";
			},
		},
		rollupOptions: {
			external: ["react", "react-dom", "@bind/core", "@tanstack/react-store"],
			output: {
				globals: {
					react: "React",
					"react-dom": "ReactDOM",
					"@bind/core": "BindCore",
					"@tanstack/react-store": "TanstackReactStore",
				},
			},
		},
	},
});
