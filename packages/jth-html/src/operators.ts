import { Stack, op } from "jth-runtime";
import type { StackOperator } from "jth-runtime";
import { createElement, createText, createRaw, createFragment } from "./nodes.ts";
import { render } from "./render.ts";

// h-tag: block "tagName" → element
// Pops tag name and block, executes block on a child stack, collects children.
export const hTag: StackOperator = (stack: Stack) => {
  const tagName = stack.pop() as string;
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

// h-text: "string" → textNode
export const hText: StackOperator = op(1)((value: unknown) => [createText(value)]);

// h-raw: "<html>" → rawNode
export const hRaw: StackOperator = op(1)((value: unknown) => [createRaw(value)]);

// h-frag: block → fragmentNode
// Pops block, executes on child stack, wraps children in fragment.
export const hFrag: StackOperator = (stack: Stack) => {
  const block = stack.pop() as ((s: Stack) => void | Promise<void>) | undefined;
  const childStack = new Stack();
  const result = typeof block === "function" ? block(childStack) : undefined;
  if (result && typeof (result as any).then === "function") {
    return (result as Promise<void>).then(() => {
      stack.push(createFragment(childStack.toArray() as any));
    });
  }
  stack.push(createFragment(childStack.toArray() as any));
};

// h-void: "tagName" → voidElement
export const hVoid: StackOperator = op(1)((tagName: unknown) => [createElement(tagName as string, {}, [])]);

// h-attrs: element { k v ... } → element
// Pops element and attrs, merges attrs onto element.
export const hAttrs: StackOperator = op(2)((element: any, attrs: any) => {
  return [{ ...element, attrs: { ...element.attrs, ...attrs } }];
});

// h-render: node → "htmlString"
export const hRender: StackOperator = op(1)((node: unknown) => [render(node)]);
