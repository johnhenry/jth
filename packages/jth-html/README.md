# jth-html

HTML DSL for jth: build HTML trees on the stack and render them to strings. Importing the package registers its operators with the global jth-runtime registry as a side effect.

## Installation

```bash
npm install jth-html
```

## Loading the ops (opt-in)

The compiler preamble only auto-loads `jth-stdlib` — the `h-*` ops are **not** available by default. A `.jth` program opts in with an import directive, which the compiler passes through so the package registers its ops at module load:

```jth
::import "jth-html";

#[ "Hello" h-text ] "h1" h-tag h-render peek;
```

```bash
jth run page.jth
# <h1>Hello</h1>
```

From JavaScript, `import "jth-html"` (or call `registerHTML()` explicitly).

## Registered operators

| Operator | Stack effect | Description |
|----------|--------------|-------------|
| `h-tag` | `block "tag"` → `element` | Executes the block on a child stack; its items become children |
| `h-text` | `value` → `textNode` | Text node (HTML-escaped on render) |
| `h-raw` | `value` → `rawNode` | Raw HTML, rendered without escaping |
| `h-frag` | `block` → `fragment` | Fragment: children render with no wrapper tag |
| `h-void` | `"tag"` → `element` | Element with no children (e.g. `meta`, `br`) |
| `h-attrs` | `element { k v … }` → `element` | Merges an attribute object onto an element |
| `h-render` | `node` → `"html"` | Renders a node tree to an HTML string |

### Dynamic `h-<tag>` shorthand

Any name matching `h-<lowercase-tag>` that is not one of the static ops works as a shorthand: `block h-div` ≡ `block "div" h-tag` (registered via a dynamic registry pattern in `src/register.ts`).

## Rendering rules

- Text nodes and attribute values are HTML-escaped (`& < > " '`); `h-raw` output is not.
- Boolean attributes: `true` renders as a bare attribute, `false` is omitted.
- Void elements (`br`, `meta`, `img`, …) render without a closing tag.

## JavaScript API

```ts
import { registerHTML, render, createElement, createText, createRaw, createFragment } from "jth-html";
```

Also exported: the operator implementations (`hTag`, `hText`, `hRaw`, `hFrag`, `hVoid`, `hAttrs`, `hRender`), node type interfaces (`ElementNode`, `TextNode`, `RawNode`, `FragmentNode`, `HtmlNode`), and `escapeHtml`.

## Example

See [`examples/html.jth`](../../examples/html.jth) in the repo root — it builds a full page and is covered by an end-to-end CLI test.
