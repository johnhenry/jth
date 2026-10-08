import { registry, op } from "@johnhenry/jth-runtime";
import { Stack } from "@johnhenry/jth-runtime";
import { createElement } from "./nodes.ts";
import { hTag, hText, hRaw, hFrag, hVoid, hAttrs, hRender } from "./operators.ts";

const STATIC_OPS = new Set([
  "h-tag", "h-text", "h-raw", "h-frag", "h-void", "h-attrs", "h-render",
]);

export function registerHTML(): void {
  // Static operators
  registry.set("h-tag", hTag, { description: "Build an element: `#[ ... ] \"div\" h-tag` runs the block on a fresh stack and uses its output as the children.", arity: 2 });
  registry.set("h-text", hText, { description: "Make an escaped text node.", arity: 1 });
  registry.set("h-raw", hRaw, { description: "Make a raw (UNESCAPED) HTML node. Never feed it untrusted input.", arity: 1 });
  registry.set("h-frag", hFrag, { description: "Collect a block's output into a fragment node (no wrapping element).", arity: 1 });
  registry.set("h-void", hVoid, { description: "Make an empty element (no children), e.g. br or img, from a tag name.", arity: 1 });
  registry.set("h-attrs", hAttrs, { description: "Merge an attributes object onto an element.", arity: 2 });
  registry.set("h-render", hRender, { description: "Render a node tree to an HTML string.", arity: 1 });

  // Dynamic shorthand: h-div, h-h1, h-p, etc.
  // Matches h-<tagname> where tagname is lowercase alphanumeric.
  // Static ops take precedence since registry checks static before dynamic.
  registry.setDynamic(/^h-([a-z][a-z0-9]*)$/, (name, pattern) => {
    if (STATIC_OPS.has(name)) return undefined;
    const match = pattern.exec(name);
    if (!match) return undefined;
    const tagName = match[1];
    // Dynamic shorthand: { ... } h-div  ===  { ... } "div" h-tag
    return (stack: Stack) => {
      const block = stack.pop() as ((s: Stack) => void | Promise<void>) | undefined;
      const childStack = new Stack();
      const result = typeof block === "function" ? block(childStack) : undefined;
      if (result && typeof (result as any).then === "function") {
        return (result as Promise<void>).then(() => {
          stack.push(createElement(tagName, {}, childStack.toArray() as any));
        });
      }
      stack.push(createElement(tagName, {}, childStack.toArray() as any));
    };
  }, {
    syntax: "h-<tag>",
    arity: 1,
    description: "Shorthand for a block then a tag name then h-tag: `#[ ... ] h-div` builds a <div> with the block's output as children.",
  });
}
