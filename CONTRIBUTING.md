# Contributing

```bash
pnpm install
pnpm dev        # Ladle stories
pnpm test       # vitest (watch)
pnpm verify     # everything CI runs — run before opening a PR
```

Commits follow [Conventional Commits](https://www.conventionalcommits.org/) (release-please builds the changelog and version from them).

## Core guarantees

These are the promises the library makes to its users. Every pull request must keep all of them. Each one is enforced by an automated check in CI (`.github/workflows/ci.yml` runs `pnpm verify` on every PR, and the release workflow runs it again before publishing).

| # | Guarantee | Enforced by |
|---|---|---|
| **G1** | **Headless.** The library renders no DOM and ships no CSS of its own; all markup comes from `renderRoot`, `fieldMapping`, `render` and slots. | `core-guarantees.test.tsx` → G1 (empty renderers ⇒ empty container) · `check-package.mjs` (no `.css` in `dist`) |
| **G2** | **react-hook-form is a peer.** One shared RHF instance, so `useFormContext()` from `react-hook-form` works inside fields. RHF is never bundled. | `core-guarantees.test.tsx` → G2 · `check-package.mjs` (peerDependency, bundles import `react-hook-form`) |
| **G3** | **Scoped re-renders.** Typing in one field re-renders only that field; with `deps`, conditional fields re-render only when their deps change; array operations do not remount other rows. | `core-guarantees.test.tsx` → G3 (300-field / 200-row forms with render and mount counters) |
| **G4** | **Clear errors.** Misuse throws a descriptive error prefixed with `[react-headless-form]`. | `core-guarantees.test.tsx` → G4 · `setup-form.test.tsx` |
| **G5** | **End-to-end type safety.** Config keys are checked against the model, `type` against `fieldMapping`, `props` against the component, nested section/array configs against the mapping, `render` context by field type, i18n keys via `Register`. Verified from a consumer's point of view against the built `.d.ts`. | `test/types/**` (`pnpm check:types`, with `@ts-expect-error` for what must fail) · `pnpm typecheck` · `pnpm typecheck:test` |
| **G6** | **Zero runtime dependencies, small bundle.** Only peers are imported (in JS and in `.d.ts`); ESM bundle ≤ 7 KB gzip. | `check-package.mjs` |
| **G7** | **Works in every consumer setup.** ESM and CJS; `bundler`, `node10`, `node16` resolution; React 18 and 19. | `publint`, `attw --pack` (`pnpm check:package`) · `react-compat` CI job |
| **G8** | **Stable public API.** No export is removed or renamed without a deprecation period and a breaking-change commit. | runtime export snapshot (`core-guarantees.test.tsx` → G8) · `test/types/consumer/public-api.ts` |

### Rules

- **Never weaken a check to make a PR pass.** Raising the bundle budget, adding to an allowlist, deleting a `@ts-expect-error`, loosening a render/mount assertion or updating the G8 snapshot is a deliberate decision. Explain it in the PR description.
- **New features extend the checks.** Add a positive *and* a negative (`@ts-expect-error`) case in `test/types/consumer/` for new config or props, and a guarantee test when a feature touches rendering or subscriptions.
- **Breaking changes.** While the version is `0.x`, a breaking change bumps the minor version. Deprecate first (`@deprecated` JSDoc and keep an alias for at least one minor release), then remove it in a commit marked `!` / `BREAKING CHANGE:`.

### Scripts

| Script | What it does |
|---|---|
| `pnpm lint:ci` | Biome lint (no writes) |
| `pnpm typecheck` / `pnpm typecheck:test` | Library sources / tests and stories |
| `pnpm build` | `dist/` (rolled-up `index.d.ts`, copied to `index.d.mts` for ESM) |
| `pnpm check:types` | Consumer type tests against `dist/` (needs `pnpm build`) |
| `pnpm check:package` | Packaging guarantees, `publint`, `attw` |
| `pnpm verify` | All of the above plus `vitest run` |
