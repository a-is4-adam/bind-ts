import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "CompoundCore",
      formats: ["es", "cjs"],
      fileName: (format) => {
        if (format === "es") return "esm/index.js";
        return "cjs/index.cjs";
      },
    },
    rollupOptions: {
      external: ["@tanstack/store"],
      output: {
        globals: {
          "@tanstack/store": "TanstackStore",
        },
      },
    },
  },
});
