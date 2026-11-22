import { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

/**
 * One multi-page build for every integration demo (cheaper than one build per
 * library). Output goes to doc_build/demos and is embedded in the docs with
 * same-origin iframes, so each library's CSS stays in its own page.
 */
const pages = ['mantine', 'shadcn', 'antd', 'mui', 'animal-island']

export default defineConfig({
  root: __dirname,
  base: '/react-headless-form/demos/',
  plugins: [react(), tailwindcss()],
  server: { port: 5180 },
  build: {
    outDir: resolve(__dirname, '../doc_build/demos'),
    emptyOutDir: true,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        ...Object.fromEntries(pages.map(page => [page, resolve(__dirname, page, 'index.html')])),
      },
    },
  },
})
