/**
 * Token types for the jth lexer.
 */
export const TokenType = Object.freeze({
  // Literals
  NUMBER: "NUMBER",
  STRING: "STRING",
  BOOLEAN: "BOOLEAN",
  NULL: "NULL",
  UNDEFINED: "UNDEFINED",

  // Identifiers and operators
  IDENTIFIER: "IDENTIFIER",
  OPERATOR: "OPERATOR",

  // Definitions
  DEFINITION: "DEFINITION",         // :name
  VALUE_DEFINITION: "VALUE_DEFINITION", // ::name

  // Directives
  IMPORT: "IMPORT",                 // ::import
  EXPORT: "EXPORT",                 // ::export

  // Delimiters
  BLOCK_OPEN: "BLOCK_OPEN",         // #[
  OBJECT_OPEN: "OBJECT_OPEN",       // {
  OBJECT_CLOSE: "OBJECT_CLOSE",     // }
  ARRAY_OPEN: "ARRAY_OPEN",         // [
  ARRAY_CLOSE: "ARRAY_CLOSE",       // ]
  PAREN_OPEN: "PAREN_OPEN",         // (
  PAREN_CLOSE: "PAREN_CLOSE",       // )

  // Inline JS
  INLINE_JS: "INLINE_JS",           // ((...) => ...)

  // Statement separator
  SEMICOLON: "SEMICOLON",

  // Comment (stripped by parser, but lexer emits it)
  COMMENT: "COMMENT",               // // ...

  // End of file
  EOF: "EOF",
});

/**
 * Create a token.
 * @param {string} type - One of TokenType values
 * @param {*} value - The token value
 * @param {number} line - Line number (1-based)
 * @param {number} column - Column number (1-based)
 * @returns {{ type: string, value: *, line: number, column: number }}
 */
export function token(type, value, line, column) {
  return { type, value, line, column };
}
