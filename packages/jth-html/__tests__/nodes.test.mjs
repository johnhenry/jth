import { describe, it, expect } from "vitest";
import {
  ELEMENT, TEXT, RAW, FRAGMENT,
  createElement, createText, createRaw, createFragment,
} from "../src/nodes.mjs";

describe("nodes", () => {
  describe("symbols", () => {
    it("ELEMENT is a well-known symbol", () => {
      expect(ELEMENT).toBe(Symbol.for("jth.html.element"));
    });

    it("TEXT is a well-known symbol", () => {
      expect(TEXT).toBe(Symbol.for("jth.html.text"));
    });

    it("RAW is a well-known symbol", () => {
      expect(RAW).toBe(Symbol.for("jth.html.raw"));
    });

    it("FRAGMENT is a well-known symbol", () => {
      expect(FRAGMENT).toBe(Symbol.for("jth.html.fragment"));
    });
  });

  describe("createElement", () => {
    it("creates an element with tag, attrs, and children", () => {
      const el = createElement("div", { class: "foo" }, []);
      expect(el._type).toBe(ELEMENT);
      expect(el.tag).toBe("div");
      expect(el.attrs).toEqual({ class: "foo" });
      expect(el.children).toEqual([]);
    });

    it("defaults attrs to empty object", () => {
      const el = createElement("p");
      expect(el.attrs).toEqual({});
    });

    it("defaults children to empty array", () => {
      const el = createElement("p");
      expect(el.children).toEqual([]);
    });

    it("preserves children array", () => {
      const child = createText("hello");
      const el = createElement("p", {}, [child]);
      expect(el.children).toEqual([child]);
    });
  });

  describe("createText", () => {
    it("creates a text node with string value", () => {
      const node = createText("hello");
      expect(node._type).toBe(TEXT);
      expect(node.value).toBe("hello");
    });

    it("coerces numbers to strings", () => {
      const node = createText(42);
      expect(node.value).toBe("42");
    });
  });

  describe("createRaw", () => {
    it("creates a raw node with string value", () => {
      const node = createRaw("<hr>");
      expect(node._type).toBe(RAW);
      expect(node.value).toBe("<hr>");
    });

    it("coerces numbers to strings", () => {
      const node = createRaw(123);
      expect(node.value).toBe("123");
    });
  });

  describe("createFragment", () => {
    it("creates a fragment with children", () => {
      const child = createText("hello");
      const frag = createFragment([child]);
      expect(frag._type).toBe(FRAGMENT);
      expect(frag.children).toEqual([child]);
    });

    it("defaults children to empty array", () => {
      const frag = createFragment();
      expect(frag.children).toEqual([]);
    });
  });
});
