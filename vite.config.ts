// vite.config.ts
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  server: {
    port: 3000,
    allowedHosts: true,
  },
  plugins: [tsConfigPaths(), tanstackStart({ target: "bun" }), tailwindcss()],
});
