import { defineProject, mergeConfig } from "vitest/config";
import sharedConfig from "../vitest.shared";
const config = mergeConfig(
  sharedConfig,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  defineProject({
    test: {
      name: "server",
      environment: "node",
      rootDir: "tests/server",
      include: ["**/*.test.ts"],
      globals: true,
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
        exclude: [
          "**/*.ts",
          "tests/**/*.{ts,tsx}",
          "**/*.config.{ts,tsx,js}",
          ".storybook/",
          "stories/**/*.{ts,tsx}",
          ".eslint*",
        ],
        include: ["src/lib/infrastructure/server/**/*.ts"],
      },
    },
  }),
);

export default config;
