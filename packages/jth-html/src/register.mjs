import { registry, op } from "jth-runtime";
import { Stack } from "jth-runtime";
import { createElement } from "./nodes.mjs";
import { hTag, hText, hRaw, hFrag, hVoid, hAttrs, hRender } from "./operators.mjs";

const STATIC_OPS = new Set([
  "h-tag", "h-text", "h-raw", "h-frag", "h-void", "h-attrs", "h-render",
]);

export function registerHTML() {
  // Static operators
  registry.set("h-tag", hTag);
  registry.set("h-text", hText);
  registry.set("h-raw", hRaw);
  registry.set("h-frag", hFrag);
  registry.set("h-void", hVoid);
  registry.set("h-attrs", hAttrs);
  registry.set("h-render", hRender);

  // Dynamic shorthand: h-div, h-h1, h-p, etc.
  // Matches h-<tagname> where tagname is lowercase alphanumeric.
  // Static ops take precedence since registry checks static before dynamic.
  registry.setDynamic(/^h-([a-z][a-z0-9]*)$/, (name, pattern) => {
    if (STATIC_OPS.has(name)) return undefined;
    const [, tagName] = pattern.exec(name);
    // Dynamic shorthand: { ... } h-div  ===  { ... } "div" h-tag
    return (stack) => {
      const block = stack.pop();
      const childStack = new Stack();
      const result = typeof block === "function" ? block(childStack) : undefined;
      if (result && typeof result.then === "function") {
        return result.then(() => {
          stack.push(createElement(tagName, {}, childStack.toArray()));
        });
      }
      stack.push(createElement(tagName, {}, childStack.toArray()));
    };
  });
}
