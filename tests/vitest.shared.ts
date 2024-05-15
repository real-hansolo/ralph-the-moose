import { defineConfig } from 'vitest/config'
import path from 'path'
import swc from 'unplugin-swc'
import react from "@vitejs/plugin-react";
// import react from "@vitejs/plugin-react-swc";
// eslint-disable-next-line @typescript-eslint/no-unsafe-call
const sharedConfig = defineConfig({
  // optimizeDeps: {
  //   esbuildOptions: {
  //     tsconfigRaw: {
  //       compilerOptions: {
  //         experimentalDecorators: true,
  //       }
  //     },
  //   }
  // },
  esbuild: false,
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
  plugins: [
    // swc.vite({
    //   tsconfigFile: "../tsconfig.json",
    // }),
    // react({
    //   jsxRuntime: "classic",
    // }),
  ]
})

export default sharedConfig