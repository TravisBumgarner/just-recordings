import react from '@vitejs/plugin-react'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'out/main',
      rollupOptions: {
        input: {
          index: 'src/main/index.ts',
        },
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'out/preload',
      rollupOptions: {
        input: {
          index: 'src/preload/index.ts',
        },
      },
    },
  },
  renderer: {
    plugins: [react()],
    build: {
      outDir: 'out/renderer',
      rollupOptions: {
        input: {
          index: 'src/renderer/index.html',
        },
      },
    },
  },
})
