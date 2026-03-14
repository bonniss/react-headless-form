import * as path from "node:path";
import { defineConfig } from "@rspress/core";
import { pluginPreview } from "@rspress/plugin-preview";
import {
  transformerNotationHighlight,
  transformerNotationFocus,
} from "@shikijs/transformers";

const base = "/react-headless-form/";
const description =
  "Form as configuration. Great DX. Bring your own UI, entirely. Built on React Hook Form.";

export default defineConfig({
  base,
  root: path.join(__dirname, "src"),
  title: "React headless form",
  icon: "/icon.png",
  logo: {
    light: "/light-logo.png",
    dark: "/dark-logo.png",
  },
  head: [
    ["meta", { name: "author", content: "bonniss" }],
    [
      "meta",
      {
        property: "og:image",
        content: `https://bonniss.github.io${base}light-logo.png`,
      },
    ],
    [
      "meta",
      {
        property: "og:description",
        content: description,
      },
    ],
    [
      "meta",
      {
        name: "description",
        content: description,
      },
    ],
  ],
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
    defaultWrapCode: true,
    shiki: {
      themes: {
        light: "one-light",
        dark: "horizon",
      },
      transformers: [
        transformerNotationHighlight(),
        transformerNotationFocus(),
      ],
    },
  },
  plugins: [pluginPreview()],
});
