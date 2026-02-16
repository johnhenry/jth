import { describe, it, expect } from "vitest";
import { createElement, createText, createRaw, createFragment } from "../src/nodes.mjs";
import { render, escapeHtml } from "../src/render.mjs";

describe("escapeHtml", () => {
  it("escapes ampersands", () => {
    expect(escapeHtml("a & b")).toBe("a &amp; b");
  });

  it("escapes less-than", () => {
    expect(escapeHtml("a < b")).toBe("a &lt; b");
  });

  it("escapes greater-than", () => {
    expect(escapeHtml("a > b")).toBe("a &gt; b");
  });

  it("escapes double quotes", () => {
    expect(escapeHtml('say "hi"')).toBe("say &quot;hi&quot;");
  });

  it("escapes single quotes", () => {
    expect(escapeHtml("it's")).toBe("it&#39;s");
  });

  it("escapes all special chars together", () => {
    expect(escapeHtml(`<a href="x">&`)).toBe("&lt;a href=&quot;x&quot;&gt;&amp;");
  });

  it("returns empty string unchanged", () => {
    expect(escapeHtml("")).toBe("");
  });

  it("returns plain text unchanged", () => {
    expect(escapeHtml("hello world")).toBe("hello world");
  });
});

describe("render", () => {
  describe("text nodes", () => {
    it("renders escaped text", () => {
      const node = createText("Hello & world");
      expect(render(node)).toBe("Hello &amp; world");
    });

    it("escapes angle brackets in text", () => {
      const node = createText("<script>alert('xss')</script>");
      expect(render(node)).toBe("&lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt;");
    });
  });

  describe("raw nodes", () => {
    it("renders raw HTML without escaping", () => {
      const node = createRaw("<hr>");
      expect(render(node)).toBe("<hr>");
    });

    it("passes through any HTML", () => {
      const node = createRaw('<div class="foo">bar</div>');
      expect(render(node)).toBe('<div class="foo">bar</div>');
    });
  });

  describe("fragment nodes", () => {
    it("renders children without wrapper", () => {
      const frag = createFragment([
        createText("hello "),
        createText("world"),
      ]);
      expect(render(frag)).toBe("hello world");
    });

    it("renders empty fragment as empty string", () => {
      const frag = createFragment([]);
      expect(render(frag)).toBe("");
    });
  });

  describe("element nodes", () => {
    it("renders a simple element", () => {
      const el = createElement("div", {}, []);
      expect(render(el)).toBe("<div></div>");
    });

    it("renders an element with text child", () => {
      const el = createElement("p", {}, [createText("hello")]);
      expect(render(el)).toBe("<p>hello</p>");
    });

    it("renders an element with attributes", () => {
      const el = createElement("a", { href: "/about", class: "link" }, [
        createText("About"),
      ]);
      expect(render(el)).toBe('<a href="/about" class="link">About</a>');
    });

    it("escapes attribute values", () => {
      const el = createElement("div", { title: 'say "hi" & bye' }, []);
      expect(render(el)).toBe('<div title="say &quot;hi&quot; &amp; bye"></div>');
    });

    it("renders nested elements", () => {
      const el = createElement("ul", {}, [
        createElement("li", {}, [createText("one")]),
        createElement("li", {}, [createText("two")]),
      ]);
      expect(render(el)).toBe("<ul><li>one</li><li>two</li></ul>");
    });

    it("renders deeply nested structure", () => {
      const el = createElement("div", {}, [
        createElement("p", {}, [
          createElement("span", {}, [createText("deep")]),
        ]),
      ]);
      expect(render(el)).toBe("<div><p><span>deep</span></p></div>");
    });
  });

  describe("void elements", () => {
    it("renders br as self-closing", () => {
      const el = createElement("br", {}, []);
      expect(render(el)).toBe("<br>");
    });

    it("renders img with attributes", () => {
      const el = createElement("img", { src: "pic.jpg", alt: "A pic" }, []);
      expect(render(el)).toBe('<img src="pic.jpg" alt="A pic">');
    });

    it("renders input as self-closing", () => {
      const el = createElement("input", { type: "text", name: "q" }, []);
      expect(render(el)).toBe('<input type="text" name="q">');
    });

    it("renders meta as self-closing", () => {
      const el = createElement("meta", { charset: "utf-8" }, []);
      expect(render(el)).toBe('<meta charset="utf-8">');
    });

    it("renders hr as self-closing", () => {
      const el = createElement("hr", {}, []);
      expect(render(el)).toBe("<hr>");
    });

    it("renders link as self-closing", () => {
      const el = createElement("link", { rel: "stylesheet", href: "style.css" }, []);
      expect(render(el)).toBe('<link rel="stylesheet" href="style.css">');
    });
  });

  describe("boolean attributes", () => {
    it("renders true boolean as name only", () => {
      const el = createElement("input", { type: "checkbox", checked: true }, []);
      expect(render(el)).toBe('<input type="checkbox" checked>');
    });

    it("omits false boolean attributes", () => {
      const el = createElement("input", { type: "checkbox", checked: false }, []);
      expect(render(el)).toBe('<input type="checkbox">');
    });

    it("renders disabled attribute", () => {
      const el = createElement("button", { disabled: true }, [createText("No")]);
      expect(render(el)).toBe("<button disabled>No</button>");
    });
  });

  describe("mixed content", () => {
    it("renders text and elements together", () => {
      const el = createElement("p", {}, [
        createText("Hello "),
        createElement("strong", {}, [createText("world")]),
        createText("!"),
      ]);
      expect(render(el)).toBe("<p>Hello <strong>world</strong>!</p>");
    });

    it("renders fragments inside elements", () => {
      const frag = createFragment([
        createText("one"),
        createText("two"),
      ]);
      const el = createElement("div", {}, [frag]);
      expect(render(el)).toBe("<div>onetwo</div>");
    });

    it("renders raw inside elements", () => {
      const el = createElement("div", {}, [
        createRaw("<hr>"),
        createText("after"),
      ]);
      expect(render(el)).toBe("<div><hr>after</div>");
    });
  });

  describe("full page", () => {
    it("renders a complete HTML page", () => {
      const page = createElement("html", {}, [
        createElement("head", {}, [
          createElement("meta", { charset: "utf-8" }, []),
          createElement("title", {}, [createText("Test")]),
        ]),
        createElement("body", {}, [
          createElement("h1", {}, [createText("Hello")]),
          createElement("p", {}, [createText("World")]),
        ]),
      ]);
      expect(render(page)).toBe(
        '<html><head><meta charset="utf-8"><title>Test</title></head>' +
        "<body><h1>Hello</h1><p>World</p></body></html>"
      );
    });
  });
});
