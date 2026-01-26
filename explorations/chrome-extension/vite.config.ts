import { copyFileSync, mkdirSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyDirFirst: true,
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
  resolve: {
    alias: {
      '@just-recordings/recorder': resolve(__dirname, '../../packages/recorder/src'),
    },
  },
  plugins: [
    {
      name: 'copy-extension-files',
      writeBundle() {
        // Copy manifest.json
        copyFileSync(
          resolve(__dirname, 'manifest.json'),
          resolve(__dirname, 'dist/manifest.json')
        )
        // Copy icon PNGs only
        mkdirSync(resolve(__dirname, 'dist/icons'), { recursive: true })
        for (const file of readdirSync(resolve(__dirname, 'icons'))) {
          if (file.endsWith('.png')) {
            copyFileSync(
              resolve(__dirname, 'icons', file),
              resolve(__dirname, 'dist/icons', file)
            )
          }
        }
      },
    },
  ],
})
