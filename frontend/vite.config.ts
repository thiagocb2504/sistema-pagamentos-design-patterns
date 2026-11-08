import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Caminhos relativos: o mesmo build funciona na raiz local e em
  // usuario.github.io/sistema-pagamentos-design-patterns/ (as rotas usam #).
  base: './',
  server: {
    // Os slides importam o código Java real (../src/main/java) com ?raw
    fs: { allow: ['..'] },
  },
})
