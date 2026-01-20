// electron.vite.config.ts
import react from "@vitejs/plugin-react";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
var electron_vite_config_default = defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: "out/main",
      rollupOptions: {
        input: {
          index: "src/main/index.ts"
        }
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: "out/preload",
      rollupOptions: {
        input: {
          index: "src/preload/index.ts"
        }
      }
    }
  },
  renderer: {
    plugins: [react()],
    build: {
      outDir: "out/renderer",
      rollupOptions: {
        input: {
          index: "src/renderer/index.html"
        }
      }
    }
  }
});
export {
  electron_vite_config_default as default
};
