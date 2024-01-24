import { defineConfig } from 'vitest/config'
import path from 'path'

const sharedConfig = defineConfig({
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "src"),
    }
  }
})

export default sharedConfig