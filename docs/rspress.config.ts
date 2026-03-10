import * as path from "node:path";
import { defineConfig } from "@rspress/core";
import {
  transformerNotationHighlight,
  transformerNotationFocus,
} from "@shikijs/transformers";

export default defineConfig({
  root: path.join(__dirname, "src"),
  title: "React headless form",
  icon: "/icon.png",
  logo: {
    light: "/light-logo.png",
    dark: "/dark-logo.png",
  },
  themeConfig: {
    socialLinks: [
      {
        icon: "github",
        mode: "link",
        content: "https://github.com/bonniss/react-headless-form",
      },
    ],
  },
  markdown: {
    shiki: {
      themes: {
        light: "min-light",
        dark: "min-dark",
      },
      transformers: [
        transformerNotationHighlight(),
        transformerNotationFocus(),
      ],
    },
  },
});
