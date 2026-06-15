import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const isPages = process.env.BUILD_TARGET === "pages";

export default defineConfig({
  plugins: [react()],
  base: isPages ? process.env.VITE_BASE_PATH || "/" : "/",
  server: {
    port: 5175,
    proxy: {
      "/api": "http://localhost:8080",
      "/uploads": "http://localhost:8080",
    },
  },
  build: {
    outDir: isPages ? "dist" : "../backend/static",
    emptyOutDir: true,
  },
});
