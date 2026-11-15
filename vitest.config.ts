import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: [
      "packages/*/src/**/*.test.ts",
      "apps/*/src/**/*.test.ts",
      "apps/*/scripts/**/*.test.mjs",
      "apps/site/src/**/*.test.mjs",
    ],
  },
});
