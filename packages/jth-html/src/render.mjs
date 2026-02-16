import { ELEMENT, TEXT, RAW, FRAGMENT } from "./nodes.mjs";

const VOID_ELEMENTS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr",
]);

export function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderAttrs(attrs) {
  let result = "";
  for (const [key, value] of Object.entries(attrs)) {
    if (value === false) continue;
    if (value === true) {
      result += ` ${key}`;
    } else {
      result += ` ${key}="${escapeHtml(String(value))}"`;
    }
  }
  return result;
}

export function render(node) {
  if (node._type === TEXT) {
    return escapeHtml(node.value);
  }
  if (node._type === RAW) {
    return node.value;
  }
  if (node._type === FRAGMENT) {
    return node.children.map(render).join("");
  }
  if (node._type === ELEMENT) {
    const attrs = renderAttrs(node.attrs);
    if (VOID_ELEMENTS.has(node.tag)) {
      return `<${node.tag}${attrs}>`;
    }
    const children = node.children.map(render).join("");
    return `<${node.tag}${attrs}>${children}</${node.tag}>`;
  }
  return String(node);
}
