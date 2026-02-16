/**
 * Code generator: walks jth AST and emits JavaScript source code.
 *
 * Compiled output imports from jth-runtime and jth-stdlib, creates a
 * persistent Stack, and processes each statement via processN.
 */

/**
 * Sanitize a jth identifier to a valid JS identifier.
 * Replaces hyphens with underscores, trailing ? with _p.
 */
function sanitize(name) {
  return name
    .replace(/-/g, "_")
    .replace(/\?$/, "_p");
}

/**
 * Generate JavaScript source from a jth AST.
 * @param {object} ast - ProgramNode from the parser
 * @param {object} [options]
 * @param {boolean} [options.preamble=true] - emit import/stack boilerplate
 * @returns {string} JavaScript source code
 */
export function generate(ast, options = {}) {
  const { preamble = true } = options;
  const lines = [];

  if (preamble) {
    lines.push('import { Stack, processN, registry } from "jth-runtime";');
    lines.push('import "jth-stdlib";');
    lines.push("const stack = new Stack();");
  }

  for (const stmt of ast.body) {
    const code = generateStatement(stmt);
    if (code) lines.push(code);
  }

  return lines.join("\n");
}

function generateStatement(stmt) {
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
    return generateDefinition(last.name, exprs.slice(0, -1));
  }

  // ::name value definition — processN body, then const = stack.pop()
  if (last.type === "ValueDefinition") {
    return generateValueDefinition(last.name, exprs.slice(0, -1));
  }

  // Normal statement — await processN(stack, [...])
  const items = exprs.map(generateExpression);
  return `await processN(stack, [${items.join(", ")}]);`;
}

/**
 * Compile a single AST expression node to a JS code string.
 */
function generateExpression(node) {
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
          .map((a) => `s.push(${generateExpression(a)});`)
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
      return generateJSObject(node.properties);
    }

    case "InlineJSExpression":
      return node.code;

    case "Definition":
      // Definition appearing mid-statement: compile as a stack function
      return `((s) => { registry.set(${JSON.stringify(node.name)}, s.pop()); })`;

    case "ValueDefinition":
      // Should normally be at end of statement, but handle inline too
      return `((s) => { globalThis[${JSON.stringify(node.name)}] = s.pop(); })`;

    default:
      throw new Error(`Unknown AST node type in codegen: ${node.type}`);
  }
}

/**
 * Compile a JSObjectLiteral's properties into a JS object expression.
 * Properties come from the parser as flat expressions; we pair them
 * as alternating key/value entries.
 */
function generateJSObject(properties) {
  // Handle { key, value } objects (from manual AST construction)
  if (properties.length > 0 && properties[0].key !== undefined) {
    const pairs = properties.map(
      (p) => `[${typeof p.key === "string" ? JSON.stringify(p.key) : generateExpression(p.key)}]: ${generateExpression(p.value)}`
    );
    return `({${pairs.join(", ")}})`;
  }

  // Flat expressions: pair as key, value, key, value, ...
  if (properties.length % 2 === 0) {
    const pairs = [];
    for (let i = 0; i < properties.length; i += 2) {
      const key = generateExpression(properties[i]);
      const value = generateExpression(properties[i + 1]);
      pairs.push(`[${key}]: ${value}`);
    }
    return `({${pairs.join(", ")}})`;
  }

  // Odd number of expressions — emit as array for runtime construction
  const items = properties.map(generateExpression);
  return `[${items.join(", ")}]`;
}

/**
 * Compile a :name definition.
 */
function generateDefinition(name, bodyExprs) {
  const jsName = sanitize(name);

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
  return `await processN(stack, [${items.join(", ")}]);\nconst ${jsName} = stack.pop();\nregistry.set(${JSON.stringify(name)}, ${jsName});`;
}

/**
 * Compile a ::name value definition.
 */
function generateValueDefinition(name, bodyExprs) {
  const jsName = sanitize(name);

  if (bodyExprs.length > 0) {
    const items = bodyExprs.map(generateExpression);
    return `await processN(stack, [${items.join(", ")}]);\nconst ${jsName} = stack.pop();`;
  }
  return `const ${jsName} = stack.pop();`;
}

/**
 * Compile an ::import node.
 */
function generateImport(node) {
  let path = node.path;
  // Rewrite .jth → .mjs
  if (path.endsWith(".jth")) {
    path = path.slice(0, -4) + ".mjs";
  }

  if (node.bindings && node.bindings.length > 0) {
    const names = node.bindings.join(", ");
    return `import { ${names} } from ${JSON.stringify(path)};`;
  }
  return `import ${JSON.stringify(path)};`;
}

/**
 * Compile an ::export node.
 */
function generateExport(node) {
  if (!node.names || node.names.length === 0) return "";
  const parts = node.names.map((n) => {
    const jsName = sanitize(n);
    if (jsName !== n) {
      return `${jsName} as ${JSON.stringify(n)}`;
    }
    return n;
  });
  return `export { ${parts.join(", ")} };`;
}
