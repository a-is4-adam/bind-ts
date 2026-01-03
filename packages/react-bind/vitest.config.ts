/// <reference types="vitest" />
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "jsdom",
		setupFiles: ["./vitest.setup.ts"],
		include: [
			"src/**/*.test.tsx",
			"src/**/*.test.ts",
			"src/**/*.test-d.ts",
			"src/**/*.test-d.tsx",
		],
		typecheck: {
			enabled: true,
			include: ["src/**/*.test-d.ts", "src/**/*.test-d.tsx"],
		},
	},
});
