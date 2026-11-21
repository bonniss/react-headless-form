// Benchmarks run against React's production build, so the source must be
// compiled with the production JSX runtime too (not `jsxDEV`).
process.env.NODE_ENV = "production";

import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  esbuild: { jsx: "automatic", jsxDev: false },
  test: {
    environment: "jsdom",
    benchmark: { include: ["bench/**/*.bench.tsx"] },
  },
});
