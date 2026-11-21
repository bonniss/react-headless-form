import { isRelatedPath, trackReads } from "@/components/helper/track-reads";
import { describe, expect, it } from "vitest";

const depsOf = (values: any, fn: (v: any) => unknown) => {
  const { proxy, deps } = trackReads(values);
  fn(proxy);
  return deps();
};

describe("trackReads", () => {
  const values = {
    role: "student",
    empty: "",
    profile: { name: "A", address: { city: "HN", zip: "1" } },
    rows: [{ v: 1 }, { v: 2 }],
    date: new Date(0),
  };

  it("records top-level and nested leaf reads", () => {
    expect(depsOf(values, (v) => v.role === "x")).toEqual(["role"]);
    expect(depsOf(values, (v) => v.profile.address.city)).toEqual(["profile.address.city"]);
  });

  it("only records what was actually read (short-circuit)", () => {
    expect(depsOf(values, (v) => v.empty && v.role)).toEqual(["empty"]);
    expect(depsOf(values, (v) => v.role && v.empty)?.sort()).toEqual(["empty", "role"]);
  });

  it("keeps a traversed object when nothing below it was read", () => {
    expect(depsOf(values, (v) => v.profile !== undefined)).toEqual(["profile"]);
    expect(depsOf(values, (v) => v.profile && v.profile.name)).toEqual(["profile.name"]);
  });

  it("treats arrays and non-plain objects as a whole", () => {
    expect(depsOf(values, (v) => v.rows.length > 1)).toEqual(["rows"]);
    expect(depsOf(values, (v) => v.rows.some((r: any) => r.v === 2))).toEqual(["rows"]);
    expect(depsOf(values, (v) => v.date.getTime())).toEqual(["date"]);
  });

  it("enumerating an object depends on the whole object", () => {
    expect(depsOf(values, (v) => Object.keys(v.profile).length)).toEqual(["profile"]);
    expect(depsOf(values, (v) => "zip" in v.profile.address)).toEqual(["profile.address.zip"]);
    expect(depsOf(values, (v) => JSON.stringify(v.profile.address))).toEqual(["profile.address"]);
  });

  it("enumerating the root depends on everything", () => {
    expect(depsOf(values, (v) => Object.keys(v))).toBeNull();
    expect(depsOf(values, (v) => ({ ...v }))).toBeNull();
  });

  it("drops paths covered by an ancestor read as a whole", () => {
    expect(depsOf(values, (v) => [v.profile.name, Object.keys(v.profile)])).toEqual(["profile"]);
  });

  it("returns real values through the proxy", () => {
    const { proxy } = trackReads(values);
    expect(proxy.profile.address.city).toBe("HN");
    expect(proxy.rows).toBe(values.rows);
    expect(JSON.parse(JSON.stringify(proxy))).toEqual(JSON.parse(JSON.stringify(values)));
  });

  it("respects the invariant for frozen nested objects", () => {
    const frozen = Object.freeze({ inner: Object.freeze({ a: 1 }) });
    const { proxy, deps } = trackReads({ frozen } as any);
    expect(proxy.frozen.inner.a).toBe(1);
    expect(deps()).toEqual(["frozen.inner"]);
  });
});

describe("isRelatedPath", () => {
  it("matches equal, ancestor and descendant paths only", () => {
    expect(isRelatedPath("a.b", "a.b")).toBe(true);
    expect(isRelatedPath("a.b", "a")).toBe(true);
    expect(isRelatedPath("a", "a.b.c")).toBe(true);
    expect(isRelatedPath("ab", "a")).toBe(false);
    expect(isRelatedPath("a.b", "a.bc")).toBe(false);
  });
});
