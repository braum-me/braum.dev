import node from "@astrojs/node";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, passthroughImageService } from "astro/config";

export default defineConfig({
  output: "server",
  adapter: node({ mode: "standalone" }),
  site: "https://braum.dev",
  server: {
    host: true,
    port: 4323,
  },
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    build: {
      cssMinify: "lightningcss",
    },
  },
  // Kein Bildoptimierungs-Service: die Site liefert nur vorgefertigte Assets aus.
  // Reduziert die Angriffsfläche (sharp/libheif/libvips) des SSR-Endpoints /_image.
  image: {
    service: passthroughImageService(),
  },
  compressHTML: true,
  build: {
    inlineStylesheets: "auto",
  },
});
