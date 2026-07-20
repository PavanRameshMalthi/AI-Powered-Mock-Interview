import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: process.env.VITE_API_PROXY_TARGET || "http://localhost:5001",
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-dom") || id.includes("react-router-dom")) return "vendor-react";
            if (id.includes("framer-motion") || id.includes("motion-dom") || id.includes("motion-utils") || id.includes("style-value-types") || id.includes("popmotion") || id.includes("framesync") || id.includes("scheduler") || id.includes("goober")) return "vendor-motion";
            if (id.includes("lucide-react")) return "vendor-icons";
            if (id.includes("html2canvas")) return "vendor-html2canvas";
            if (id.includes("canvg") || id.includes("dompurify") || id.includes("fflate") || id.includes("rgbcolor") || id.includes("raf")) return "vendor-pdf-support";
            if (id.includes("jspdf")) return "vendor-jspdf";
            if (id.includes("chart.js")) return "vendor-chartjs";
            if (id.includes("axios")) return "vendor-http";
            return "vendor-core";
          }
        },
      },
    },
  },
})
