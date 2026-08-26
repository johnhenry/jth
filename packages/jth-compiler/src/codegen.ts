/**
 * Code generator: walks jth AST and emits JavaScript source code.
 *
 * Compiled output imports from jth-runtime and jth-stdlib, creates a
 * persistent Stack, and processes each statement via processN.
 */

import type { ProgramNodeType } from "@johnhenry/jth-types/ast";
import { JthRuntimeError, JthParserError } from "@johnhenry/jth-types";

/**
 * JS reserved words (keywords + strict-mode reserved + future reserved).
 * A jth definition whose sanitized name collides with one of these would
 * emit invalid JS (e.g. `const class = ...;`), so definitions are rejected
 * at compile time before that happens.
 */
const JS_RESERVED_WORDS = new Set([
  "break", "case", "catch", "class", "const", "continue", "debugger",
  "default", "delete", "do", "else", "enum", "export", "extends", "false",
  "finally", "for", "function", "if", "import", "in", "instanceof", "new",
  "null", "return", "super", "switch", "this", "throw", "true", "try",
  "typeof", "var", "void", "while", "with", "yield", "let", "static",
  "await", "implements", "interface", "package", "private", "protected",
  "public", "arguments", "eval",
]);

/**
 * Source position of a statement: the first expression that carries one.
 */
function statementPosition(exprs: any[]): { line: number; column: number } | null {
  for (const e of exprs) {
    if (e && typeof e.line === "number") {
      return { line: e.line, column: typeof e.column === "number" ? e.column : 0 };
    }
  }
  return null;
}

/**
 * Wrap a compiled processN call in a try/rethrow that annotates any thrown
 * error with the statement's source line/column (statement-level source
 * positions — the MVP of runtime source mapping). Errors that already carry
 * a position (e.g. from a nested statement) keep it.
 */
function wrapWithPosition(code: string, pos: { line: number; column: number } | null): string {
  if (!pos) return code;
  return (
    `try { ${code} } ` +
    `catch (e) { ` +
    `if (e && typeof e === "object" && e.line == null) { e.line = ${pos.line}; e.column = ${pos.column}; } ` +
    `throw e; }`
  );
}

/**
 * Sanitize a jth identifier to a valid JS identifier.
 * Replaces hyphens with underscores, trailing ? with _p.
 */
function sanitize(name: string): string {
  return name
    .replace(/-/g, "_")
    .replace(/\?$/, "_p");
}

export interface GenerateOptions {
  preamble?: boolean;
  /**
   * When true, InlineJSExpression nodes (`((...))`) and ValueDefinition
   * nodes (`::name`) throw at compile time with code OP_NOT_ALLOWED. Used
   * by sandboxed evaluation (jth-eval): inline JS trivially escapes any
   * operator allowlist, and `::name` writes directly to `globalThis`
   * (mid-statement) or can shadow runtime bindings like `registry`
   * (terminal position) — both bypass the allowlist and must be rejected
   * before any code runs.
   */
  forbidInlineJS?: boolean;
  /**
   * Called with each ::import's specifier (already rewritten .jth -> .mjs)
   * for RELATIVE paths only (bare package specifiers like
   * "@johnhenry/jth-html" or "lodash" are never passed through this hook).
   * Lets a caller re-express the specifier relative to wherever the
   * compiled output will actually be written — e.g. `jth compile
   * --no-bundle in/main.jth out/main.mjs` needs `./lib.mjs` rewritten to
   * `../in/lib.mjs` (or similar) so Node resolves it against `out/`, not
   * `in/`. Not called for bare specifiers. Return value is used verbatim
   * as the new import specifier.
   */
  resolveImportPath?: (relativePath: string) => string;
}

/**
 * Module-scope compile flags: set for the duration of a generate() call.
 * generate() is the only entry point and is synchronous, so this cannot
 * interleave across compilations.
 */
let inlineJSForbidden = false;
let importPathResolver: ((relativePath: string) => string) | undefined;

/**
 * Generate JavaScript source from a jth AST.
 */
export function generate(ast: ProgramNodeType, options: GenerateOptions = {}): string {
  const { preamble = true, forbidInlineJS = false, resolveImportPath } = options;
  inlineJSForbidden = forbidInlineJS;
  importPathResolver = resolveImportPath;
  try {
    return generateProgram(ast, preamble);
  } finally {
    inlineJSForbidden = false;
    importPathResolver = undefined;
  }
}

function generateProgram(ast: ProgramNodeType, preamble: boolean): string {
  const lines: string[] = [];

  if (preamble) {
    lines.push('import { Stack, processN, registry } from "@johnhenry/jth-runtime";');
    lines.push('import "@johnhenry/jth-stdlib";');
    lines.push("const stack = new Stack();");
    // Standalone execution (node): print "line:col: message" for jth errors
    // instead of a raw stack trace, so the CLI reports source positions.
    lines.push(
      'if (typeof process !== "undefined" && typeof process.on === "function") {\n' +
        '  process.on("uncaughtException", (err) => {\n' +
        '    if (err && err.line != null) {\n' +
        '      console.error(`${err.name ?? "Error"} at ${err.line}:${err.column ?? 0}: ${err.message}`);\n' +
        "      process.exit(1);\n" +
        "    }\n" +
        "    throw err;\n" +
        "  });\n" +
        "}"
    );
  }

  for (const stmt of ast.body) {
    const code = generateStatement(stmt as any);
    if (code) lines.push(code);
  }

  return lines.join("\n");
}

function generateStatement(stmt: any): string {
  const exprs = stmt.expressions;
  if (!exprs || exprs.length === 0) return "";

  // Single-expression special forms
  if (exprs.length === 1) {
    if (exprs[0].type === "Import") return generateImport(exprs[0]);
    if (exprs[0].type === "Export") return generateExport(exprs[0]);
  }

  const last = exprs[exprs.length - 1];

  // :name definition — pop from stack / optimize block case
  if (last.type === "Definition") {
    return generateDefinition(last.name, exprs.slice(0, -1), last.line, last.column);
  }

  // ::name value definition — processN body, then const = stack.pop()
  if (last.type === "ValueDefinition") {
    return generateValueDefinition(last.name, exprs.slice(0, -1), last.line, last.column);
  }

  // Normal statement — await processN(stack, [...])
  const items = exprs.map(generateExpression);
  return wrapWithPosition(
    `await processN(stack, [${items.join(", ")}]);`,
    statementPosition(exprs)
  );
}

/**
 * Compile a single AST expression node to a JS code string.
 */
function generateExpression(node: any): string {
  switch (node.type) {
    case "NumberLiteral":
      return Object.is(node.value, -0) ? "-0" : String(node.value);

    case "StringLiteral":
      return JSON.stringify(node.value);

    case "BooleanLiteral":
      return String(node.value);

    case "NullLiteral":
      return "null";

    case "UndefinedLiteral":
      return "undefined";

    case "OperatorCall": {
      if (node.args.length > 0) {
        // Configured operator: push config args, then call operator
        const pushes = node.args
          .map((a: any) => `s.push(${generateExpression(a)});`)
          .join(" ");
        return `((s) => { ${pushes} return registry.resolve(${JSON.stringify(node.name)})(s); })`;
      }
      return `registry.resolve(${JSON.stringify(node.name)})`;
    }

    case "BlockLiteral": {
      const items = node.body.map(generateExpression);
      const blockFn = `(s) => processN(s, [${items.join(", ")}])`;
      return `((s) => { s.push(${blockFn}); })`;
    }

    case "ArrayLiteral": {
      const elements = node.elements.map(generateExpression);
      return `[${elements.join(", ")}]`;
    }

    case "JSObjectLiteral": {
      return generateJSObject(node.properties, node.line, node.column);
    }

    case "InlineJSExpression":
      if (inlineJSForbidden) {
        throw new JthRuntimeError(
          "Inline JS ((...)) is not allowed in sandbox mode",
          node?.line,
          node?.column,
          "OP_NOT_ALLOWED"
        );
      }
      return node.code;

    case "Definition":
      // Definition appearing mid-statement: compile as a stack function
      return `((s) => { registry.set(${JSON.stringify(node.name)}, s.pop()); })`;

    case "ValueDefinition":
      // Should normally be at end of statement, but handle inline too
      if (inlineJSForbidden) {
        throw new JthRuntimeError(
          "::name value-definitions are not allowed in sandbox mode",
          node?.line,
          node?.column,
          "OP_NOT_ALLOWED"
        );
      }
      return `((s) => { globalThis[${JSON.stringify(node.name)}] = s.pop(); })`;

    default:
      throw new JthRuntimeError(
        `Unknown AST node type in codegen: ${node.type}`,
        node?.line,
        node?.column,
        "UNKNOWN_NODE"
      );
  }
}

/**
 * Compile a JSObjectLiteral's properties into a JS object expression.
 * Properties come from the parser as flat expressions; we pair them
 * as alternating key/value entries.
 */
function generateJSObject(properties: any[], line?: number, column?: number): string {
  // Handle { key, value } objects (from manual AST construction)
  if (properties.length > 0 && properties[0].key !== undefined) {
    const pairs = properties.map(
      (p: any) => `[${typeof p.key === "string" ? JSON.stringify(p.key) : generateExpression(p.key)}]: ${generateExpression(p.value)}`
    );
    return `({${pairs.join(", ")}})`;
  }

  // Flat expressions: pair as key, value, key, value, ...
  if (properties.length % 2 === 0) {
    const pairs: string[] = [];
    for (let i = 0; i < properties.length; i += 2) {
      const key = generateExpression(properties[i]);
      const value = generateExpression(properties[i + 1]);
      pairs.push(`[${key}]: ${value}`);
    }
    return `({${pairs.join(", ")}})`;
  }

  // Odd number of expressions — object-literal syntax `{ ... }` signals
  // object intent; an odd count can't pair into key/value entries, so this
  // is almost certainly a typo. Fail at compile time instead of silently
  // emitting an array (matches the runtime convention in dict-ops.ts's
  // `record` operator, which rejects odd arg counts with RECORD_ODD_ARGS).
  throw new JthParserError(
    `Object literal { ... } requires an even number of key/value expressions (got ${properties.length})`,
    line,
    column
  );
}

/**
 * Throw a JthParserError if a sanitized identifier collides with a JS
 * reserved word — emitting `const class = ...;` etc. would otherwise be a
 * SyntaxError at execution time, deep in generated code the user never sees.
 */
function assertValidJsIdentifier(
  jsName: string,
  originalName: string,
  line?: number,
  column?: number
): void {
  if (JS_RESERVED_WORDS.has(jsName)) {
    throw new JthParserError(
      `Definition name "${originalName}" compiles to the reserved JS word "${jsName}" and cannot be used as a :name/::name definition`,
      line,
      column
    );
  }
}

/**
 * Compile a :name definition.
 */
function generateDefinition(name: string, bodyExprs: any[], line?: number, column?: number): string {
  const jsName = sanitize(name);
  assertValidJsIdentifier(jsName, name, line, column);

  // Optimised: single block literal → direct registry.set
  if (bodyExprs.length === 1 && bodyExprs[0].type === "BlockLiteral") {
    const items = bodyExprs[0].body.map(generateExpression);
    const fn = `(s) => processN(s, [${items.join(", ")}])`;
    return `const ${jsName} = ${fn};\nregistry.set(${JSON.stringify(name)}, ${jsName});`;
  }

  // No body: pop from current stack
  if (bodyExprs.length === 0) {
    return `const ${jsName} = stack.pop();\nregistry.set(${JSON.stringify(name)}, ${jsName});`;
  }

  // General case: evaluate body, pop result, register
  const items = bodyExprs.map(generateExpression);
  const body = wrapWithPosition(
    `await processN(stack, [${items.join(", ")}]);`,
    statementPosition(bodyExprs)
  );
  return `${body}\nconst ${jsName} = stack.pop();\nregistry.set(${JSON.stringify(name)}, ${jsName});`;
}

/**
 * Compile a ::name value definition.
 */
function generateValueDefinition(name: string, bodyExprs: any[], line?: number, column?: number): string {
  if (inlineJSForbidden) {
    throw new JthRuntimeError(
      "::name value-definitions are not allowed in sandbox mode",
      line,
      column,
      "OP_NOT_ALLOWED"
    );
  }
  const jsName = sanitize(name);
  assertValidJsIdentifier(jsName, name, line, column);

  if (bodyExprs.length > 0) {
    const items = bodyExprs.map(generateExpression);
    const body = wrapWithPosition(
      `await processN(stack, [${items.join(", ")}]);`,
      statementPosition(bodyExprs)
    );
    return `${body}\nconst ${jsName} = stack.pop();`;
  }
  return `const ${jsName} = stack.pop();`;
}

/**
 * Compile an ::import node.
 */
function generateImport(node: any): string {
  let path: string = node.path;
  // Rewrite .jth → .mjs
  if (path.endsWith(".jth")) {
    path = path.slice(0, -4) + ".mjs";
  }

  // Relative paths ("./..." or "../...") may need re-resolving against
  // wherever the compiled output actually lands on disk (see
  // resolveImportPath doc comment on GenerateOptions). Bare specifiers
  // (package names) are untouched — they resolve via node_modules
  // regardless of where the output file lives.
  if (importPathResolver && (path.startsWith("./") || path.startsWith("../"))) {
    path = importPathResolver(path);
  }

  if (node.bindings && node.bindings.length > 0) {
    // Sanitize binding names (hyphenated jth identifiers aren't valid JS
    // binding names). A sanitized name is imported by its original string
    // name via `as` — this matches how generateExport emits the module's
    // export under the original (possibly hyphenated) string name.
    const names = node.bindings
      .map((n: string) => {
        const jsName = sanitize(n);
        return jsName !== n ? `${JSON.stringify(n)} as ${jsName}` : n;
      })
      .join(", ");
    return `import { ${names} } from ${JSON.stringify(path)};`;
  }
  return `import ${JSON.stringify(path)};`;
}

/**
 * Compile an ::export node.
 */
function generateExport(node: any): string {
  if (!node.names || node.names.length === 0) return "";
  const parts = node.names.map((n: string) => {
    const jsName = sanitize(n);
    if (jsName !== n) {
      return `${jsName} as ${JSON.stringify(n)}`;
    }
    return n;
  });
  return `export { ${parts.join(", ")} };`;
}
