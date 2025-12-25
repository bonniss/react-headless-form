import path from "node:path"
import react from "@vitejs/plugin-react"
import type { UserConfigExport } from "vite"
import dts from "vite-plugin-dts"
import tsconfigPaths from "vite-tsconfig-paths"
import { configDefaults, defineConfig } from "vitest/config"
import { name } from "./package.json"
import tscBuildConfig from "./tsconfig.build.json"

const app = async (): Promise<UserConfigExport> => {
  /**
   * Removes everything before the last
   * @octocat/library-repo -> library-repo
   * vite-component-library-template -> vite-component-library-template
   */
  const formattedName = name.match(/[^/]+$/)?.[0] ?? name

  return defineConfig({
    plugins: [
      react(),
      tsconfigPaths(),
      dts({
        tsconfigPath: path.resolve(__dirname, "tsconfig.build.json"),
        insertTypesEntry: true,
      }),
    ],
    build: {
      lib: {
        entry: {
          index: path.resolve(__dirname, "src/lib/index.ts"),
          // platform: path.resolve(__dirname, "src/lib/platform/index.tsx"),
          // plugins: path.resolve(__dirname, "src/lib/plugins/index.tsx"),
        },
        name: formattedName,
        formats: ["es"],
      },
      rollupOptions: {
        external: ["react", "react/jsx-runtime", "react-dom", "tailwindcss"],
        output: {
          globals: {
            react: "React",
            "react/jsx-runtime": "react/jsx-runtime",
            "react-dom": "ReactDOM",
            tailwindcss: "tailwindcss",
          },
          preserveModules: true,
          preserveModulesRoot: "src/lib",
          entryFileNames: "[name].js",
          chunkFileNames: "[name].js",
        },
      },
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./vitest.setup.ts",
      coverage: {
        exclude: [
          ...(configDefaults.coverage.exclude ?? []),
          ...tscBuildConfig.exclude,
          "ladle-static/**",
          "**/*.config.js",
        ],
      },
    },
  })
}
// https://vitejs.dev/config/
export default app
