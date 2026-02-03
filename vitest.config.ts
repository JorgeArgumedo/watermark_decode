import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import { quasar, transformAssetUrls } from "@quasar/vite-plugin";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [
    vue({
      template: { transformAssetUrls },
    }),
    quasar(),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@shared": fileURLToPath(new URL("./src/shared", import.meta.url)),
      "@domain": fileURLToPath(new URL("./src/domain", import.meta.url)),
      "@infrastructure": fileURLToPath(new URL("./src/infrastructure", import.meta.url)),
      "@presentation": fileURLToPath(new URL("./src/presentation", import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["test/vitest-setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      exclude: [
        "node_modules/",
        "test/",
        "*.config.*",
        "src/main.ts",
        "src/**/*.d.ts",
        "src/i18n/**",
        "src/router/**",
        "src/constants/**",
        "src/layouts/**",
        "src/App.vue",
        ".eslintrc.cjs",
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
    include: ["test/**/*.test.ts"],
    exclude: ["node_modules", "dist"],
  },
});
