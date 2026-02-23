/**
 * Convenience pipeline: jth source → lex → parse → codegen → JavaScript.
 */
import { lex } from "./lexer.ts";
import { parse } from "./parser.ts";
import { generate } from "./codegen.ts";

/**
 * Transform jth source code into JavaScript.
 */
export function transform(source: string, options: { preamble?: boolean } = {}): string {
  const tokens = lex(source);
  const ast = parse(tokens);
  return generate(ast, options);
}
