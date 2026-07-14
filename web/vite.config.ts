import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/fwc-2026-sticker-manager/' : '/',
  plugins: [react(), tailwindcss()],
}))
