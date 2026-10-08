import { describe, it, expect, beforeEach } from "vitest";
import { registry } from "../src/registry.ts";
import { getMeta } from "../src/meta.ts";
import { op, variadic } from "../src/op.ts";

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

describe("registry enumeration", () => {
  beforeEach(() => {
    registry.clear();
  });

  it("names() lists all static operator names", () => {
    registry.set("alpha", () => {});
    registry.set("beta", () => {});
    expect(registry.names().sort()).toEqual(["alpha", "beta"]);
  });

  it("names() is empty after clear()", () => {
    registry.set("x", () => {});
    registry.clear();
    expect(registry.names()).toEqual([]);
  });

  it("names() does not include dynamic pattern matches", () => {
    registry.setDynamic(/^dyn-/, () => () => {});
    expect(registry.names()).toEqual([]);
    // ...even though the dynamic op resolves:
    expect(registry.has("dyn-thing")).toBe(true);
  });

  it("dynamicPatterns() lists registered patterns", () => {
    const p1 = /^dyn-/;
    const p2 = /^\d+log$/;
    registry.setDynamic(p1, () => () => {});
    registry.setDynamic(p2, () => () => {});
    expect(registry.dynamicPatterns()).toEqual([p1, p2]);
  });

  it("names() reflects remove()", () => {
    registry.set("gone", () => {});
    registry.remove("gone");
    expect(registry.names()).toEqual([]);
  });
});

describe("registry operator documentation (issue #54)", () => {
  beforeEach(() => {
    registry.clear();
  });

  it("set(name, fn, doc) records name, derived arity and description", () => {
    registry.set("double", op(1)((x) => [x * 2]), { description: "Double a number." });
    expect(registry.info("double")).toEqual({ name: "double", arity: 1, description: "Double a number." });
  });

  it("variadic ops derive arity 'variadic'; undeclared raw ops derive 'varies'; explicit arity wins", () => {
    registry.set("all", variadic(() => []), { description: "d" });
    registry.set("raw", () => {}, { description: "d" });
    registry.set("two", () => {}, { description: "d", arity: 2 });
    expect(registry.info("all")?.arity).toBe("variadic");
    expect(registry.info("raw")?.arity).toBe("varies");
    expect(registry.info("two")?.arity).toBe(2);
  });

  it("ops registered without docs have no info", () => {
    registry.set("plain", () => {});
    expect(registry.info("plain")).toBeUndefined();
    expect(registry.infos()).toEqual([]);
  });

  it("infos() lists documented static ops in registration order", () => {
    registry.set("a", () => {}, { description: "A" });
    registry.set("b", () => {}, { description: "B" });
    expect(registry.infos().map((i) => i.name)).toEqual(["a", "b"]);
  });

  it("re-registering without docs drops the stale description; remove/clear drop info", () => {
    registry.set("x", () => {}, { description: "old" });
    registry.set("x", () => {});
    expect(registry.info("x")).toBeUndefined();
    registry.set("y", () => {}, { description: "y" });
    registry.remove("y");
    expect(registry.info("y")).toBeUndefined();
    registry.set("z", () => {}, { description: "z" });
    registry.clear();
    expect(registry.infos()).toEqual([]);
  });

  it("getMeta() of a documented operator carries description and arity next to timing annotations", () => {
    const fn = op(2)(() => []);
    registry.set("two", fn, { description: "Two things." });
    expect(getMeta(fn)).toEqual({ description: "Two things.", arity: 2 });
  });

  it("getMeta() of an undocumented function is still {}", () => {
    expect(getMeta(() => {})).toEqual({});
  });

  it("dynamic families can be documented", () => {
    registry.setDynamic(/^x\d$/, () => undefined, { syntax: "xN", arity: 1, description: "d" });
    expect(registry.dynamicInfos()).toEqual([{ syntax: "xN", arity: 1, description: "d" }]);
  });
});

