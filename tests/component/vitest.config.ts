import { defineProject, mergeConfig } from 'vitest/config'
import path from 'path'
import react from '@vitejs/plugin-react'
import sharedConfig from '../../vitest.shared'

export default mergeConfig(
  sharedConfig,
  defineProject({
    test: {
      environment: 'jsdom',
    },
    resolve: {
      alias: {
        "~": path.resolve(__dirname, "../", "../", "src"),
      }
    },
    plugins: [react()]
  })
)