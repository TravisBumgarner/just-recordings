import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    fileParallelism: false,
    env: {
      NODE_ENV: 'test',
    },
    // Exclude integration tests from default run
    exclude: ['**/integration/**', '**/node_modules/**'],
  },
})
