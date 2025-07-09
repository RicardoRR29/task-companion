import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { resolve } from "path";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "TACO – Task Companion",
        short_name: "TACO",
        start_url: ".",
        display: "standalone",
        theme_color: "#0f172a",
        // Custom icons should be supplied when publishing to the App Store
        // and referenced here. The default configuration omits bundled icons.
      },
    }),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  server: {
    allowedHosts: [
      // permita seu subdomínio ngrok aqui
      "f35d-2804-40a8-2c3-c00-d105-d0e1-ed74-294b.ngrok-free.app",
    ],
  },
});
