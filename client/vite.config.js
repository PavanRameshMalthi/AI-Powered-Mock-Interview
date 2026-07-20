import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: process.env.VITE_API_URL ? process.env.VITE_API_URL.replace(/\/api$/, "") : "http://localhost:5001",
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("jspdf")) return "vendor-jspdf";
            if (id.includes("chart.js")) return "vendor-chartjs";
            return "vendor";
          }
        },
      },
    },
  },
})
