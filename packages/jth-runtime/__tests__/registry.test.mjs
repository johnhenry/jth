import { describe, it, expect, beforeEach } from "vitest";
import { registry } from "../src/registry.mjs";

describe("registry", () => {
  beforeEach(() => {
    registry.clear();
  });

  it("set and get a static operator", () => {
    const fn = () => {};
    registry.set("add", fn);
    expect(registry.get("add")).toBe(fn);
  });

  it("get returns undefined for unknown operator", () => {
    expect(registry.get("nonexistent")).toBeUndefined();
  });

  it("resolve returns operator for known name", () => {
    const fn = () => {};
    registry.set("mul", fn);
    expect(registry.resolve("mul")).toBe(fn);
  });

  it("resolve throws for unknown operator", () => {
    expect(() => registry.resolve("nonexistent")).toThrow(
      "Unknown operator: nonexistent"
    );
  });

  it("has returns true for existing operator", () => {
    registry.set("div", () => {});
    expect(registry.has("div")).toBe(true);
  });

  it("has returns false for missing operator", () => {
    expect(registry.has("missing")).toBe(false);
  });

  it("remove deletes a static operator", () => {
    registry.set("sub", () => {});
    expect(registry.has("sub")).toBe(true);
    registry.remove("sub");
    expect(registry.has("sub")).toBe(false);
  });

  it("clear removes all static and dynamic operators", () => {
    registry.set("a", () => {});
    registry.set("b", () => {});
    registry.setDynamic(/^num:/, () => {});
    registry.clear();
    expect(registry.has("a")).toBe(false);
    expect(registry.has("b")).toBe(false);
    expect(registry.has("num:5")).toBe(false);
  });

  it("setDynamic registers a pattern-based operator", () => {
    registry.setDynamic(/^num:(\d+)$/, (name, pattern) => {
      const match = name.match(pattern);
      const n = parseInt(match[1], 10);
      return () => n;
    });
    const fn = registry.get("num:42");
    expect(fn).toBeDefined();
    expect(fn()).toBe(42);
  });

  it("static ops take precedence over dynamic", () => {
    const staticFn = () => "static";
    registry.set("test", staticFn);
    registry.setDynamic(/^test$/, () => () => "dynamic");
    expect(registry.get("test")).toBe(staticFn);
  });

  it("dynamic factory receives name and pattern", () => {
    let receivedName, receivedPattern;
    const pattern = /^prefix:(.+)$/;
    registry.setDynamic(pattern, (name, pat) => {
      receivedName = name;
      receivedPattern = pat;
      return () => {};
    });
    registry.get("prefix:hello");
    expect(receivedName).toBe("prefix:hello");
    expect(receivedPattern).toBe(pattern);
  });

  it("first matching dynamic pattern wins", () => {
    registry.setDynamic(/^x:/, () => () => "first");
    registry.setDynamic(/^x:/, () => () => "second");
    const fn = registry.get("x:test");
    expect(fn()).toBe("first");
  });
});
