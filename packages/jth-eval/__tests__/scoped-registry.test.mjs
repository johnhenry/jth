import { describe, it, expect, beforeEach } from "vitest";
import { registry } from "jth-runtime";
import "jth-stdlib";
import { ScopedRegistry } from "../src/scoped-registry.mjs";

describe("ScopedRegistry", () => {
  let scoped;

  beforeEach(() => {
    scoped = new ScopedRegistry();
  });

  describe("local overlay", () => {
    it("stores and retrieves local operators", () => {
      const fn = () => {};
      scoped.set("my-op", fn);
      expect(scoped.get("my-op")).toBe(fn);
    });

    it("has() returns true for local operators", () => {
      scoped.set("my-op", () => {});
      expect(scoped.has("my-op")).toBe(true);
    });

    it("resolve() returns local operators", () => {
      const fn = () => {};
      scoped.set("my-op", fn);
      expect(scoped.resolve("my-op")).toBe(fn);
    });

    it("remove() deletes local operators", () => {
      scoped.set("my-op", () => {});
      scoped.remove("my-op");
      expect(scoped.has("my-op")).toBe(false);
    });

    it("clear() removes all local operators", () => {
      scoped.set("a", () => {});
      scoped.set("b", () => {});
      scoped.clear();
      expect(scoped.has("a")).toBe(false);
      expect(scoped.has("b")).toBe(false);
    });
  });

  describe("global fallback", () => {
    it("falls through to global registry for stdlib operators", () => {
      const fn = scoped.get("+");
      expect(fn).toBeDefined();
      expect(fn).toBe(registry.get("+"));
    });

    it("has() returns true for global operators", () => {
      expect(scoped.has("+")).toBe(true);
      expect(scoped.has("plus")).toBe(true);
    });

    it("resolve() works for global operators", () => {
      expect(scoped.resolve("+")).toBeDefined();
    });
  });

  describe("local overrides global", () => {
    it("local operator shadows global of same name", () => {
      const myPlus = () => {};
      scoped.set("+", myPlus);
      expect(scoped.get("+")).toBe(myPlus);
      expect(scoped.get("+")).not.toBe(registry.get("+"));
    });

    it("removing local reveals global again", () => {
      const myPlus = () => {};
      scoped.set("+", myPlus);
      scoped.remove("+");
      expect(scoped.get("+")).toBe(registry.get("+"));
    });
  });

  describe("no global pollution", () => {
    it("set() does not modify the global registry", () => {
      const before = registry.get("unique-test-op-xyz");
      scoped.set("unique-test-op-xyz", () => {});
      expect(registry.get("unique-test-op-xyz")).toBe(before);
    });

    it("remove() does not affect global registry", () => {
      const globalPlus = registry.get("+");
      scoped.set("+", () => {});
      scoped.remove("+");
      expect(registry.get("+")).toBe(globalPlus);
    });

    it("clear() does not affect global registry", () => {
      scoped.set("+", () => {});
      scoped.clear();
      expect(registry.get("+")).toBeDefined();
    });
  });

  describe("dynamic patterns", () => {
    it("resolves local dynamic patterns", () => {
      scoped.setDynamic(/^double-(\d+)$/, (name) => {
        const n = parseInt(name.split("-")[1]);
        return (stack) => stack.push(n * 2);
      });
      const fn = scoped.get("double-5");
      expect(fn).toBeDefined();
    });

    it("local dynamic patterns are checked before global", () => {
      scoped.setDynamic(/.*/, () => "local-dynamic");
      expect(scoped.get("anything")).toBe("local-dynamic");
    });

    it("clear() removes local dynamic patterns", () => {
      scoped.setDynamic(/^test-/, () => () => {});
      scoped.clear();
      expect(scoped.get("test-foo")).toBe(registry.get("test-foo"));
    });
  });

  describe("sandbox (allowlist)", () => {
    it("blocks global operators not in allowlist", () => {
      const restricted = new ScopedRegistry({ allowlist: new Set(["+", "-"]) });
      expect(restricted.has("+")).toBe(true);
      expect(restricted.has("*")).toBe(false);
      expect(restricted.get("*")).toBeUndefined();
    });

    it("resolve() throws descriptive error for blocked operators", () => {
      const restricted = new ScopedRegistry({ allowlist: new Set(["+", "-"]) });
      expect(() => restricted.resolve("*")).toThrow("Operator not allowed in sandbox");
    });

    it("allows local operators even when allowlist blocks them globally", () => {
      const restricted = new ScopedRegistry({ allowlist: new Set() });
      restricted.set("custom", () => {});
      expect(restricted.has("custom")).toBe(true);
      expect(restricted.resolve("custom")).toBeDefined();
    });

    it("empty allowlist blocks all global operators", () => {
      const bare = new ScopedRegistry({ allowlist: new Set() });
      expect(bare.has("+")).toBe(false);
      expect(bare.has("plus")).toBe(false);
    });

    it("no allowlist allows all global operators", () => {
      const full = new ScopedRegistry();
      expect(full.has("+")).toBe(true);
      expect(full.has("plus")).toBe(true);
      expect(full.has("map")).toBe(true);
    });
  });
});
