# ⚛️⚡ React library template

## Features

- ⚛️ [React >=18](https://reactjs.org/)
- 🖌️ [Tailwind CSS 3](https://tailwindcss.com/) — Utility-first CSS framework
- 🧩 [Ladle](https://ladle.dev/) — Fast component playground (Storybook alternative)
- ⏩ [Vite](https://vitejs.dev/) - Run and build the project blazingly fast!
- ⚡ [Vitest](https://vitest.dev/) - Components Unit Testing
- 📐 [Biome](https://biomejs.dev/) - Formatting and Linting
- 🌟 [Typescript](https://www.typescriptlang.org/)
- 🐶 [Husky](https://typicode.github.io/husky) & [Lint Staged](https://www.npmjs.com/package/lint-staged) - Pre-commit Hooks
- ⏰ [Release Please](https://github.com/googleapis/release-please) — Generate the changelog with the release-please workflow
- 👷 [Github Actions](https://github.com/features/actions) — Releasing versions to NPM

## Getting Started

1. Create a new repository using this one as template
2. Clone your repo
3. Install dependencies with `pnpm i` (first run `corepack enable` to enable pnpm)

## Scripts

Always prepending pnpm:

- `dev`: Bootstrap the **Ladle** development server to preview components with fast HMR.
- `build`: Builds the component library into the **dist** folder using TypeScript and Vite.
- `static`: Builds a **static Ladle site** for component previews and documentation.
- `preview`: Serves the generated **static Ladle build** locally for production preview.
- `lint`: Applies linting based on the rules defined in **biome.json**.
- `format`: Formats files and organizes imports using the rules defined in **biome.json**.
- `test`: Runs unit tests using **Vitest** in watch mode.
- `test:cov`: Runs unit tests and generates a **coverage report**.

## `release-please` notes

### Publishing to npm

Make sure the repository has an `NPM_TOKEN` secret configured.
This token is required for `pnpm publish` to work in CI.

### Avoid bumping to `1.0.0`

When bootstrapping a new package, `release-please` may promote the first feature release to `1.0.0`.
If you want to control the initial version explicitly, you can override it using `Release-As`.

See the related issue:
[https://github.com/googleapis/release-please/issues/1209](https://github.com/googleapis/release-please/issues/1209)

```sh
git commit -m "feat: add new module" -m "Release-As: 0.1.0"
```

This forces the first release to be `0.1.0` instead of `1.0.0`.

## Acknowledgements

Inspired by **[react-lib-template by Ignacio N. Miranda](https://github.com/IgnacioNMiranda/react-lib-template)**.

## License

[MIT](LICENSE)
