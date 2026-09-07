import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // Dev server stays at "/" so local URLs are unchanged; only the production
  // build (deployed to GitHub Pages as a project site) needs the repo-name
  // subpath prefix.
  base: command === 'build' ? '/analisis-butir-soal/' : '/',
  plugins: [react(), tailwindcss()],
}))
