import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    minify: false,
    rollupOptions: {
      input: {
        main: "index.html",
        panel: "panel.html",
        contentScript: "src/contentScript.ts",
        injected: "src/injected.ts",
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === "contentScript") {
            return "contentScript.js";
          }
          if (chunkInfo.name === "injected") {
            return "injected.js";
          }
          return "[name]-[hash].js";
        },
      },
    },
  },
});
