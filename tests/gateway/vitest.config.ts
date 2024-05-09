import { defineProject, mergeConfig } from "vitest/config";
import sharedConfig from "../vitest.shared";
const config = mergeConfig(
  sharedConfig,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  defineProject({
    test: {
      name: "gateway",
      environment: "node",
      rootDir: "tests/gateway",
      include: ["**/*.test.ts"],
      globals: true
    },
  }),
);

export default config;
