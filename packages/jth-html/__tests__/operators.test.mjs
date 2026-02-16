import { describe, it, expect } from "vitest";
import { Stack, processN, registry } from "jth-runtime";
import { ELEMENT, TEXT, RAW, FRAGMENT } from "../src/nodes.mjs";
import { registerHTML } from "../src/register.mjs";

// Ensure operators are registered
registerHTML();

describe("h-text", () => {
  it("creates a text node from a string", () => {
    const s = new Stack();
    s.push("hello");
    registry.resolve("h-text")(s);
    const node = s.pop();
    expect(node._type).toBe(TEXT);
    expect(node.value).toBe("hello");
  });

  it("coerces numbers to strings", () => {
    const s = new Stack();
    s.push(42);
    registry.resolve("h-text")(s);
    const node = s.pop();
    expect(node.value).toBe("42");
  });
});

describe("h-raw", () => {
  it("creates a raw node from HTML string", () => {
    const s = new Stack();
    s.push("<hr>");
    registry.resolve("h-raw")(s);
    const node = s.pop();
    expect(node._type).toBe(RAW);
    expect(node.value).toBe("<hr>");
  });
});

describe("h-void", () => {
  it("creates a void element", () => {
    const s = new Stack();
    s.push("br");
    registry.resolve("h-void")(s);
    const node = s.pop();
    expect(node._type).toBe(ELEMENT);
    expect(node.tag).toBe("br");
    expect(node.children).toEqual([]);
  });
});

describe("h-tag", () => {
  it("creates an element from a block and tag name", () => {
    const s = new Stack();
    const block = (childStack) => {
      childStack.push({ _type: TEXT, value: "hello" });
    };
    s.push(block);
    s.push("p");
    registry.resolve("h-tag")(s);
    const node = s.pop();
    expect(node._type).toBe(ELEMENT);
    expect(node.tag).toBe("p");
    expect(node.children).toHaveLength(1);
    expect(node.children[0]._type).toBe(TEXT);
    expect(node.children[0].value).toBe("hello");
  });

  it("creates element with multiple children", () => {
    const s = new Stack();
    const block = (childStack) => {
      childStack.push({ _type: TEXT, value: "one" });
      childStack.push({ _type: TEXT, value: "two" });
    };
    s.push(block);
    s.push("ul");
    registry.resolve("h-tag")(s);
    const node = s.pop();
    expect(node.children).toHaveLength(2);
  });

  it("creates empty element when block pushes nothing", () => {
    const s = new Stack();
    const block = () => {};
    s.push(block);
    s.push("div");
    registry.resolve("h-tag")(s);
    const node = s.pop();
    expect(node.children).toEqual([]);
  });
});

describe("h-frag", () => {
  it("creates a fragment from a block", () => {
    const s = new Stack();
    const block = (childStack) => {
      childStack.push({ _type: TEXT, value: "a" });
      childStack.push({ _type: TEXT, value: "b" });
    };
    s.push(block);
    registry.resolve("h-frag")(s);
    const node = s.pop();
    expect(node._type).toBe(FRAGMENT);
    expect(node.children).toHaveLength(2);
  });
});

describe("h-attrs", () => {
  it("merges attributes onto an element", () => {
    const s = new Stack();
    s.push({ _type: ELEMENT, tag: "div", attrs: {}, children: [] });
    s.push({ class: "foo", id: "bar" });
    registry.resolve("h-attrs")(s);
    const node = s.pop();
    expect(node.attrs).toEqual({ class: "foo", id: "bar" });
  });

  it("merges with existing attributes", () => {
    const s = new Stack();
    s.push({ _type: ELEMENT, tag: "div", attrs: { class: "old" }, children: [] });
    s.push({ id: "bar" });
    registry.resolve("h-attrs")(s);
    const node = s.pop();
    expect(node.attrs).toEqual({ class: "old", id: "bar" });
  });

  it("overwrites existing attributes", () => {
    const s = new Stack();
    s.push({ _type: ELEMENT, tag: "div", attrs: { class: "old" }, children: [] });
    s.push({ class: "new" });
    registry.resolve("h-attrs")(s);
    const node = s.pop();
    expect(node.attrs).toEqual({ class: "new" });
  });
});

describe("h-render", () => {
  it("renders a text node to HTML string", () => {
    const s = new Stack();
    s.push({ _type: TEXT, value: "hello" });
    registry.resolve("h-render")(s);
    expect(s.pop()).toBe("hello");
  });

  it("renders an element to HTML string", () => {
    const s = new Stack();
    s.push({
      _type: ELEMENT,
      tag: "p",
      attrs: {},
      children: [{ _type: TEXT, value: "hi" }],
    });
    registry.resolve("h-render")(s);
    expect(s.pop()).toBe("<p>hi</p>");
  });

  it("renders a void element", () => {
    const s = new Stack();
    s.push({ _type: ELEMENT, tag: "br", attrs: {}, children: [] });
    registry.resolve("h-render")(s);
    expect(s.pop()).toBe("<br>");
  });
});

describe("dynamic shorthand", () => {
  it("h-div creates a div element", () => {
    const s = new Stack();
    const block = (childStack) => {
      childStack.push({ _type: TEXT, value: "content" });
    };
    s.push(block);
    registry.resolve("h-div")(s);
    const node = s.pop();
    expect(node._type).toBe(ELEMENT);
    expect(node.tag).toBe("div");
    expect(node.children).toHaveLength(1);
  });

  it("h-h1 creates an h1 element", () => {
    const s = new Stack();
    const block = (childStack) => {
      childStack.push({ _type: TEXT, value: "Title" });
    };
    s.push(block);
    registry.resolve("h-h1")(s);
    const node = s.pop();
    expect(node.tag).toBe("h1");
  });

  it("h-p creates a p element", () => {
    const s = new Stack();
    const block = (childStack) => {
      childStack.push({ _type: TEXT, value: "Paragraph" });
    };
    s.push(block);
    registry.resolve("h-p")(s);
    const node = s.pop();
    expect(node.tag).toBe("p");
  });

  it("h-ul creates a ul element", () => {
    const s = new Stack();
    const block = () => {};
    s.push(block);
    registry.resolve("h-ul")(s);
    const node = s.pop();
    expect(node.tag).toBe("ul");
  });

  it("static ops take precedence over dynamic", () => {
    // h-tag should be the constructor, not create a <tag> element
    const s = new Stack();
    const block = (childStack) => {
      childStack.push({ _type: TEXT, value: "hi" });
    };
    s.push(block);
    s.push("span");
    registry.resolve("h-tag")(s);
    const node = s.pop();
    expect(node.tag).toBe("span");
  });
});

describe("integration: composing operators", () => {
  it("builds a complete element with text and attrs", () => {
    const s = new Stack();

    // { "Hello" h-text } "p" h-tag #{ "class" "greeting" } h-attrs
    const block = (childStack) => {
      childStack.push("Hello");
      registry.resolve("h-text")(childStack);
    };
    s.push(block);
    s.push("p");
    registry.resolve("h-tag")(s);
    s.push({ class: "greeting" });
    registry.resolve("h-attrs")(s);

    const node = s.pop();
    expect(node.tag).toBe("p");
    expect(node.attrs).toEqual({ class: "greeting" });
    expect(node.children[0].value).toBe("Hello");
  });

  it("builds nested elements", () => {
    const s = new Stack();

    // Build: <ul><li>one</li><li>two</li></ul>
    const ulBlock = (ulStack) => {
      // First li
      const li1Block = (liStack) => {
        liStack.push("one");
        registry.resolve("h-text")(liStack);
      };
      ulStack.push(li1Block);
      ulStack.push("li");
      registry.resolve("h-tag")(ulStack);

      // Second li
      const li2Block = (liStack) => {
        liStack.push("two");
        registry.resolve("h-text")(liStack);
      };
      ulStack.push(li2Block);
      ulStack.push("li");
      registry.resolve("h-tag")(ulStack);
    };

    s.push(ulBlock);
    s.push("ul");
    registry.resolve("h-tag")(s);
    registry.resolve("h-render")(s);

    expect(s.pop()).toBe("<ul><li>one</li><li>two</li></ul>");
  });

  it("builds void element with attrs", () => {
    const s = new Stack();

    // "meta" h-void #{ "charset" "utf-8" } h-attrs h-render
    s.push("meta");
    registry.resolve("h-void")(s);
    s.push({ charset: "utf-8" });
    registry.resolve("h-attrs")(s);
    registry.resolve("h-render")(s);

    expect(s.pop()).toBe('<meta charset="utf-8">');
  });

  it("builds fragment with multiple children", () => {
    const s = new Stack();

    const block = (childStack) => {
      childStack.push("hello ");
      registry.resolve("h-text")(childStack);
      childStack.push("<hr>");
      registry.resolve("h-raw")(childStack);
      childStack.push("world");
      registry.resolve("h-text")(childStack);
    };
    s.push(block);
    registry.resolve("h-frag")(s);
    registry.resolve("h-render")(s);

    expect(s.pop()).toBe("hello <hr>world");
  });

  it("renders a full page structure", () => {
    const s = new Stack();

    const htmlBlock = (htmlStack) => {
      // head
      const headBlock = (headStack) => {
        headStack.push("meta");
        registry.resolve("h-void")(headStack);
        headStack.push({ charset: "utf-8" });
        registry.resolve("h-attrs")(headStack);

        const titleBlock = (titleStack) => {
          titleStack.push("Test");
          registry.resolve("h-text")(titleStack);
        };
        headStack.push(titleBlock);
        headStack.push("title");
        registry.resolve("h-tag")(headStack);
      };
      htmlStack.push(headBlock);
      htmlStack.push("head");
      registry.resolve("h-tag")(htmlStack);

      // body
      const bodyBlock = (bodyStack) => {
        const h1Block = (h1Stack) => {
          h1Stack.push("Hello");
          registry.resolve("h-text")(h1Stack);
        };
        bodyStack.push(h1Block);
        bodyStack.push("h1");
        registry.resolve("h-tag")(bodyStack);
      };
      htmlStack.push(bodyBlock);
      htmlStack.push("body");
      registry.resolve("h-tag")(htmlStack);
    };

    s.push(htmlBlock);
    s.push("html");
    registry.resolve("h-tag")(s);
    registry.resolve("h-render")(s);

    expect(s.pop()).toBe(
      '<html><head><meta charset="utf-8"><title>Test</title></head>' +
      "<body><h1>Hello</h1></body></html>"
    );
  });

  it("dynamic shorthand renders same as constructor", () => {
    // { "Hi" h-text } h-p  vs  { "Hi" h-text } "p" h-tag
    const s1 = new Stack();
    const block1 = (cs) => {
      cs.push("Hi");
      registry.resolve("h-text")(cs);
    };
    s1.push(block1);
    registry.resolve("h-p")(s1);
    registry.resolve("h-render")(s1);

    const s2 = new Stack();
    const block2 = (cs) => {
      cs.push("Hi");
      registry.resolve("h-text")(cs);
    };
    s2.push(block2);
    s2.push("p");
    registry.resolve("h-tag")(s2);
    registry.resolve("h-render")(s2);

    expect(s1.pop()).toBe(s2.pop());
  });
});
