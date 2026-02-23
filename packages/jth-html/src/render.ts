import { ELEMENT, TEXT, RAW, FRAGMENT } from "./nodes.ts";
import type { HtmlNode } from "./nodes.ts";

const VOID_ELEMENTS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr",
]);

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderAttrs(attrs: Record<string, string | boolean>): string {
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

export function render(node: HtmlNode | unknown): string {
  const n = node as any;
  if (n._type === TEXT) {
    return escapeHtml(n.value);
  }
  if (n._type === RAW) {
    return n.value;
  }
  if (n._type === FRAGMENT) {
    return n.children.map(render).join("");
  }
  if (n._type === ELEMENT) {
    const attrs = renderAttrs(n.attrs);
    if (VOID_ELEMENTS.has(n.tag)) {
      return `<${n.tag}${attrs}>`;
    }
    const children = n.children.map(render).join("");
    return `<${n.tag}${attrs}>${children}</${n.tag}>`;
  }
  return String(node);
}
