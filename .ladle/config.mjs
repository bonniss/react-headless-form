import { themes } from "prism-react-renderer"

/** @type {import('@ladle/react').UserConfig} */
export default {
  base: "/blueform/",
  outDir: "ladle-static",
  defaultStory: "core--hello-world",
  addons: {
    theme: {
      enabled: false,
    },
    source: {
      themeLight: themes.dracula,
      themeDark: themes.gruvboxMaterialLight,
    },
  },
}
