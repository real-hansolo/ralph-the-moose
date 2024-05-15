import { defineProject, mergeConfig } from "vitest/config";
import sharedConfig from "../vitest.shared";
import react from "@vitejs/plugin-react";
import swc from "unplugin-swc";

const config = mergeConfig(
  sharedConfig,
  defineProject({
    // optimizeDeps: {
    //   esbuildOptions: {
    //     tsconfigRaw: {
    //       compilerOptions: {
    //         experimentalDecorators: true,
    //         emitDecoratorMetadata: true,
    //       },
    //     },
    //   },
    // },
    test: {
      name: "client",
      environment: "node",
      rootDir: "tests/client",
      include: ["**/*.test.ts"],
      globals: true,
      allowJSX: true,
      alias: {
        // "react/jsx-runtime": "react/jsx-runtime.js",
      },
      coverage: {
        provider: "v8",
        reporter: ["json", "json-summary", "html", "lcov", "text"],
        reportOnFailure: true,
        // TODO: update coverage thresholds
        // thresholds: {
        //   statements: 10,
        //   branches: 10,
        //   functions: 10,
        //   lines: 10,
        // },
        exclude: ["tests/**/*.{ts,tsx}", "**/*.config.{ts,tsx,js}", ".storybook/", "stories/**/*.{ts,tsx}", ".eslint*"],
      },
      // plugins: [
      //   react({
      //     jsxRuntime: "classic",
      //   }),
       
      // ],
    },
    plugins: [
     
      swc.vite({
        tsconfigFile: "./tsconfig.json",
      })
    ],
  }),
);

export default config;
