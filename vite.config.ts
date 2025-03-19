import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import electron from "vite-plugin-electron"
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    electron({
      entry: "electron/main.ts",
      vite: {
        build: {
          outDir: "dist-electron",
          rollupOptions: {
            external: ["electron"],
          },
        },
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: "./", // Importante para caminhos relativos
  server: {
    host: true, // Escuta em todas as interfaces de rede
  },
})

