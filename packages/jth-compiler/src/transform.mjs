/**
 * Convenience pipeline: jth source → lex → parse → codegen → JavaScript.
 */
import { lex } from "./lexer.mjs";
import { parse } from "./parser.mjs";
import { generate } from "./codegen.mjs";

/**
 * Transform jth source code into JavaScript.
 * @param {string} source - jth source code
 * @param {object} [options] - passed through to generate()
 * @returns {string} JavaScript source code
 */
export function transform(source, options = {}) {
  const tokens = lex(source);
  const ast = parse(tokens);
  return generate(ast, options);
}
