export const ELEMENT = Symbol.for("jth.html.element");
export const TEXT = Symbol.for("jth.html.text");
export const RAW = Symbol.for("jth.html.raw");
export const FRAGMENT = Symbol.for("jth.html.fragment");

export function createElement(tag, attrs = {}, children = []) {
  return { _type: ELEMENT, tag, attrs, children };
}

export function createText(value) {
  return { _type: TEXT, value: String(value) };
}

export function createRaw(value) {
  return { _type: RAW, value: String(value) };
}

export function createFragment(children = []) {
  return { _type: FRAGMENT, children };
}
