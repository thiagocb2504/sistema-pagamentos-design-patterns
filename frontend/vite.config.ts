import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Os slides importam o código Java real (../src/main/java) com ?raw
    fs: { allow: ['..'] },
  },
})
