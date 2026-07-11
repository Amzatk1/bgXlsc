import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The Factory Nigeria — Factory OS site
export default defineConfig({
  plugins: [react()],
  server: { host: "127.0.0.1" },
  build: { assetsInlineLimit: 2048 },
});
