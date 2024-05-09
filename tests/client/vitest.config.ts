import { defineProject, mergeConfig } from "vitest/config";
import sharedConfig from "../vitest.shared";
const config = mergeConfig(
  sharedConfig,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  defineProject({
    test: {
      name: "client",
      environment: "node",
      rootDir: "tests/client",
      include: ["**/*.test.ts"],
      globals: true
    },
  }),
);

export default config;
