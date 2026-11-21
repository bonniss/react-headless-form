/* eslint-disable @typescript-eslint/no-explicit-any */
import { toRegExp } from "./resolve-rules";

const isEmpty = (v: unknown) =>
  v == null || v === "" || (Array.isArray(v) && v.length === 0);

const toNumber = (v: unknown) => (v == null || v === "" ? Number.NaN : Number(v));

// Walks a dot path one key at a time, so reads through a tracking proxy record
// the precise path (`rows.2.kind`) as a dependency.
export const readPath = (source: any, path: string) => {
  let target = source;
  for (const key of path.split(".")) target = target?.[key];
  return target;
};

const OPERATORS: Record<string, (value: any, arg: any) => boolean> = {
  eq: (v, a) => v === a,
  neq: (v, a) => v !== a,
  in: (v, a) => a.includes(v),
  notIn: (v, a) => !a.includes(v),
  empty: (v) => isEmpty(v),
  notEmpty: (v) => !isEmpty(v),
  gt: (v, a) => toNumber(v) > a,
  gte: (v, a) => toNumber(v) >= a,
  lt: (v, a) => toNumber(v) < a,
  lte: (v, a) => toNumber(v) <= a,
  matches: (v, a) => typeof v === "string" && toRegExp(a).test(v),
};

/**
 * Evaluates a JSON condition (`{ when, from?, ...operators }`, `and`, `or`,
 * `not`). `scope` is the field's array row / nested section values; `root` the
 * whole form values (`from: "root"`).
 */
export function evaluateCondition(condition: any, root: any, scope: any): boolean {
  if (condition.and) return condition.and.every((c: any) => evaluateCondition(c, root, scope));
  if (condition.or) return condition.or.some((c: any) => evaluateCondition(c, root, scope));
  if (condition.not) return !evaluateCondition(condition.not, root, scope);

  const { when, from, ...operators } = condition;
  if (typeof when !== "string") {
    throw new Error(
      `[react-headless-form] Invalid condition ${JSON.stringify(condition)}: expected \`when\`, \`and\`, \`or\` or \`not\`.`,
    );
  }
  const value = readPath(from === "root" ? root : scope, when);
  const names = Object.keys(operators);
  if (!names.length) return Boolean(value);
  return names.every((name) => {
    const test = OPERATORS[name];
    if (!test) {
      throw new Error(`[react-headless-form] Unknown condition operator "${name}" in ${JSON.stringify(condition)}.`);
    }
    return test(value, operators[name]);
  });
}
