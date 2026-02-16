import { Stack, op } from "jth-runtime";
import { createElement, createText, createRaw, createFragment } from "./nodes.mjs";
import { render } from "./render.mjs";

// h-tag: block "tagName" → element
// Pops tag name and block, executes block on a child stack, collects children.
export const hTag = (stack) => {
  const tagName = stack.pop();
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

// h-text: "string" → textNode
export const hText = op(1)((value) => [createText(value)]);

// h-raw: "<html>" → rawNode
export const hRaw = op(1)((value) => [createRaw(value)]);

// h-frag: block → fragmentNode
// Pops block, executes on child stack, wraps children in fragment.
export const hFrag = (stack) => {
  const block = stack.pop();
  const childStack = new Stack();
  const result = typeof block === "function" ? block(childStack) : undefined;
  if (result && typeof result.then === "function") {
    return result.then(() => {
      stack.push(createFragment(childStack.toArray()));
    });
  }
  stack.push(createFragment(childStack.toArray()));
};

// h-void: "tagName" → voidElement
export const hVoid = op(1)((tagName) => [createElement(tagName, {}, [])]);

// h-attrs: element { k v ... } → element
// Pops element and attrs, merges attrs onto element.
export const hAttrs = op(2)((element, attrs) => {
  return [{ ...element, attrs: { ...element.attrs, ...attrs } }];
});

// h-render: node → "htmlString"
export const hRender = op(1)((node) => [render(node)]);
