// Packaging guarantees — run after `pnpm build`. See CONTRIBUTING.md → "Core guarantees".
// Fails (exit 1) when a guarantee is broken. Do not raise a budget or extend an
// allowlist just to make a PR pass; discuss it first.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { gzipSync } from "node:zlib";
import { build } from "esbuild";

// 7 → 8 KB in 0.17 (schema prop, JSON conditions, compute: +1.26 KB minified).
// Deliberate; see the 0.17 commit and DEVNOTE.
const BUNDLE_BUDGET_GZIP = 8 * 1024; // bytes, ESM bundle (unminified)
const ALLOWED_RUNTIME_IMPORTS = ["react", "react/jsx-runtime", "react-hook-form"];
const ALLOWED_TYPE_IMPORTS = ["react", "react/jsx-runtime", "react-hook-form"];
const REQUIRED_PEERS = ["react", "react-dom", "react-hook-form"];

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const failures = [];
const ok = [];
const check = (cond, pass, fail) => (cond ? ok.push(pass) : failures.push(fail));

// G2 react-hook-form is a peer, never bundled or installed as a dependency.
// G6 zero runtime dependencies.
const deps = Object.keys(pkg.dependencies ?? {});
check(deps.length === 0, "no runtime dependencies", `runtime dependencies are not allowed: ${deps.join(", ")}`);
for (const peer of REQUIRED_PEERS) {
  check(pkg.peerDependencies?.[peer], `peer: ${peer}`, `"${peer}" must be a peerDependency`);
}

// G7 every file referenced by package.json exists (publint/attw check resolution).
const targets = [pkg.main, pkg.module, pkg.types];
const collect = (node) => {
  if (typeof node === "string") targets.push(node);
  else if (node && typeof node === "object") Object.values(node).forEach(collect);
};
collect(pkg.exports);
for (const t of new Set(targets.filter(Boolean))) {
  check(existsSync(t), `exists: ${t}`, `package.json points to a missing file: ${t}`);
}

// G1 headless: no stylesheets shipped.
const distFiles = readdirSync("dist", { recursive: true }).map(String);
const css = distFiles.filter((f) => f.endsWith(".css"));
check(css.length === 0, "no CSS in dist", `headless package must not ship CSS: ${css.join(", ")}`);

// G2/G6 bundles only import externals (anything else means it got bundled in or is undeclared).
const specifiers = (code, re) => [...code.matchAll(re)].map((m) => m[1]).filter((s) => !s.startsWith("."));
for (const file of ["dist/react-headless-form.mjs", "dist/react-headless-form.umd.cjs"]) {
  const code = readFileSync(file, "utf8");
  const found = new Set([
    ...specifiers(code, /from\s*["']([^"']+)["']/g),
    ...specifiers(code, /require\(["']([^"']+)["']\)/g),
  ]);
  const extra = [...found].filter((s) => !ALLOWED_RUNTIME_IMPORTS.includes(s));
  check(extra.length === 0, `${file} imports only ${[...found].join(", ")}`, `${file} imports ${extra.join(", ")}`);
  check(found.has("react-hook-form"), `${file} keeps react-hook-form external`, `${file} does not import react-hook-form (bundled?)`);
}

// G6 types only reference peers (no hidden type dependencies).
for (const file of distFiles.filter((f) => /\.d\.m?ts$/.test(f))) {
  const code = readFileSync(`dist/${file}`, "utf8");
  const found = new Set([
    ...specifiers(code, /from\s*["']([^"']+)["']/g),
    ...specifiers(code, /import\(["']([^"']+)["']\)/g),
  ]);
  const extra = [...found].filter((s) => !ALLOWED_TYPE_IMPORTS.includes(s));
  check(extra.length === 0, `dist/${file} references only peers`, `dist/${file} references ${extra.join(", ")}`);
}

// G6 small bundle.
const gz = gzipSync(readFileSync("dist/react-headless-form.mjs")).length;
check(
  gz <= BUNDLE_BUDGET_GZIP,
  `bundle ${(gz / 1024).toFixed(2)} KB gzip (budget ${BUNDLE_BUDGET_GZIP / 1024} KB)`,
  `bundle is ${(gz / 1024).toFixed(2)} KB gzip, over the ${BUNDLE_BUDGET_GZIP / 1024} KB budget`,
);

// G6 tree-shakable: an app that imports only helpers or react-hook-form
// re-exports must not pull in the form engine. Measured with esbuild (stricter
// than Rollup), minified + gzip, peers external.
const TREE_SHAKE_BUDGET_GZIP = 0.75 * 1024;
const treeShakeEntries = {
  "react-hook-form re-exports": "export { useForm, useFormContext, Controller } from",
  helpers: "export { defineMapping, defineDynamicConfig } from",
};
for (const [label, statement] of Object.entries(treeShakeEntries)) {
  const result = await build({
    stdin: {
      contents: `${statement} ${JSON.stringify(path.resolve("dist/react-headless-form.mjs"))};`,
      resolveDir: process.cwd(),
    },
    bundle: true,
    minify: true,
    format: "esm",
    write: false,
    logLevel: "silent",
    external: ALLOWED_RUNTIME_IMPORTS,
  });
  const size = gzipSync(result.outputFiles[0].contents).length;
  check(
    size <= TREE_SHAKE_BUDGET_GZIP,
    `tree-shaking: ${label} only → ${(size / 1024).toFixed(2)} KB (budget ${TREE_SHAKE_BUDGET_GZIP / 1024} KB)`,
    `tree-shaking: importing ${label} only bundles ${(size / 1024).toFixed(2)} KB (budget ${TREE_SHAKE_BUDGET_GZIP / 1024} KB); a module-level call is missing /* @__PURE__ */`,
  );
}

for (const line of ok) console.log(`  ✓ ${line}`);
for (const line of failures) console.error(`  ✗ ${line}`);
if (failures.length) {
  console.error(`\n${failures.length} packaging guarantee(s) broken.`);
  process.exit(1);
}
console.log("\nAll packaging guarantees hold.");
