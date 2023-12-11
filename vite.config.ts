import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react(), crx({ manifest })],

  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'devtools.html'),
        devtools: resolve(__dirname, 'panel.html')
      }
    }
  }
})
