import { copyFileSync, mkdirSync, readdirSync } from 'node:fs'
import path, { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  plugins: [
    react(),
    {
      name: 'copy-extension-files',
      writeBundle() {
        // Copy manifest.json
        copyFileSync(resolve(__dirname, 'manifest.json'), resolve(__dirname, 'dist/manifest.json'))
        // Copy icon PNGs
        mkdirSync(resolve(__dirname, 'dist/icons'), { recursive: true })
        for (const file of readdirSync(resolve(__dirname, 'resources/icons'))) {
          if (file.endsWith('.png')) {
            copyFileSync(
              resolve(__dirname, 'resources/icons', file),
              resolve(__dirname, 'dist/icons', file),
            )
          }
        }
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'popup.html'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
  },
})
