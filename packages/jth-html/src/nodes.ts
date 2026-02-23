export const ELEMENT = Symbol.for("jth.html.element");
export const TEXT = Symbol.for("jth.html.text");
export const RAW = Symbol.for("jth.html.raw");
export const FRAGMENT = Symbol.for("jth.html.fragment");

export interface ElementNode {
  _type: typeof ELEMENT;
  tag: string;
  attrs: Record<string, string | boolean>;
  children: HtmlNode[];
}

export interface TextNode {
  _type: typeof TEXT;
  value: string;
}

export interface RawNode {
  _type: typeof RAW;
  value: string;
}

export interface FragmentNode {
  _type: typeof FRAGMENT;
  children: HtmlNode[];
}

export type HtmlNode = ElementNode | TextNode | RawNode | FragmentNode;

export function createElement(tag: string, attrs: Record<string, string | boolean> = {}, children: HtmlNode[] = []): ElementNode {
  return { _type: ELEMENT, tag, attrs, children };
}

export function createText(value: unknown): TextNode {
  return { _type: TEXT, value: String(value) };
}

export function createRaw(value: unknown): RawNode {
  return { _type: RAW, value: String(value) };
}

export function createFragment(children: HtmlNode[] = []): FragmentNode {
  return { _type: FRAGMENT, children };
}
