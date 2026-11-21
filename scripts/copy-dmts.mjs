// The declarations are rolled up into a single dist/index.d.ts (no relative
// imports), so the same file can serve ESM consumers as index.d.mts.
// Without it, node16/nodenext ESM resolution sees CJS types ("masquerading as CJS").
import { copyFileSync } from "node:fs";

copyFileSync("dist/index.d.ts", "dist/index.d.mts");
