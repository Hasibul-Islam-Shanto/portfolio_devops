import { defineConfig } from "vitest/config";
import { getViteConfig } from "astro/config";

export default getViteConfig(
  defineConfig({
    test: {
      environment: "jsdom",
      globals: true,
      globalSetup: ["./src/test/render-fixtures.ts"],
      setupFiles: ["./src/test/setup.ts"],
      include: ["src/**/*.{test,spec}.{ts,tsx}"],
    },
  }) as Parameters<typeof getViteConfig>[0],
);
