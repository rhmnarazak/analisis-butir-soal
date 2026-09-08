import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(() => ({
  // Only the GitHub Pages project-site deploy needs a subpath prefix (set
  // via VITE_BASE_PATH in .github/workflows/deploy-pages.yml) — dev server,
  // local `npm run build`, and other hosts (e.g. Vercel, which serves from
  // the domain root) all default to "/".
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react(), tailwindcss()],
}))
