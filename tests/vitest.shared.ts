import { defineConfig } from 'vitest/config'
import path from 'path'

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
const sharedConfig = defineConfig({
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "../src"),
      "@/sdk": path.resolve(__dirname, "../src/sdk"),
    }
  },
  test: {
    clearMocks: true,
    globals: true,
    setupFiles: ['../setupTestEnv.ts'],
    env: {
      type: 'node',
      runner: 'node',
      FLAG_TEST_ENV: 'true',
    }
  },
})

export default sharedConfig