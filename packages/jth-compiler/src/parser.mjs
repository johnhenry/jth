import { TokenType } from "jth-types/tokens";
import * as AST from "jth-types/ast";
import { JthParserError } from "jth-types/errors";

/**
 * Parse an array of tokens into a jth AST.
 * @param {Array<{type: string, value: *, line: number, column: number}>} tokens
 * @returns {{ type: "Program", body: Array }}
 */
export function parse(tokens) {
  let pos = 0;

  function current() {
    return tokens[pos];
  }

  function advance() {
    return tokens[pos++];
  }

  function expect(type) {
    const tok = current();
    if (!tok || tok.type !== type) {
      const found = tok ? `${tok.type} "${tok.value}"` : "end of input";
      throw new JthParserError(
        `Expected ${type} but found ${found}`,
        tok?.line,
        tok?.column
      );
    }
    return advance();
  }

  function parseProgram() {
    const body = [];
    while (current().type !== TokenType.EOF) {
      // Skip comments at top level
      if (current().type === TokenType.COMMENT) {
        advance();
        continue;
      }
      // Skip bare semicolons
      if (current().type === TokenType.SEMICOLON) {
        advance();
        continue;
      }
      body.push(parseStatement());
    }
    return AST.ProgramNode(body);
  }

  function parseStatement() {
    const expressions = [];
    while (
      current().type !== TokenType.SEMICOLON &&
      current().type !== TokenType.EOF &&
      current().type !== TokenType.COMMENT
    ) {
      expressions.push(parseExpression());
    }
    // Consume the semicolon if present
    if (current().type === TokenType.SEMICOLON) {
      advance();
    }
    // Consume trailing comment if present (comment acts as statement terminator too)
    if (current().type === TokenType.COMMENT) {
      advance();
    }
    return AST.StatementNode(expressions);
  }

  function parseExpression() {
    const tok = current();

    switch (tok.type) {
      case TokenType.NUMBER: {
        advance();
        return AST.NumberLiteral(tok.value, tok.line, tok.column);
      }
      case TokenType.STRING: {
        advance();
        return AST.StringLiteral(tok.value, tok.line, tok.column);
      }
      case TokenType.BOOLEAN: {
        advance();
        return AST.BooleanLiteral(tok.value, tok.line, tok.column);
      }
      case TokenType.NULL: {
        advance();
        return AST.NullLiteral(tok.line, tok.column);
      }
      case TokenType.UNDEFINED: {
        advance();
        return AST.UndefinedLiteral(tok.line, tok.column);
      }
      case TokenType.OPERATOR: {
        advance();
        return AST.OperatorCallNode(tok.value, [], tok.line, tok.column);
      }
      case TokenType.IDENTIFIER: {
        return parseIdentifierOrConfiguredOp();
      }
      case TokenType.BLOCK_OPEN: {
        return parseBlock();
      }
      case TokenType.ARRAY_OPEN: {
        return parseArray();
      }
      case TokenType.OBJECT_OPEN: {
        return parseJSObject();
      }
      case TokenType.INLINE_JS: {
        advance();
        return AST.InlineJSExpression(tok.value, tok.line, tok.column);
      }
      case TokenType.DEFINITION: {
        advance();
        return AST.DefinitionNode(tok.value, tok.line, tok.column);
      }
      case TokenType.VALUE_DEFINITION: {
        advance();
        return AST.ValueDefinitionNode(tok.value, tok.line, tok.column);
      }
      case TokenType.IMPORT: {
        return parseImport();
      }
      case TokenType.EXPORT: {
        return parseExport();
      }
      default: {
        throw new JthParserError(
          `Unexpected token: ${tok.type} "${tok.value}"`,
          tok.line,
          tok.column
        );
      }
    }
  }

  function parseIdentifierOrConfiguredOp() {
    const tok = advance(); // IDENTIFIER
    if (current().type === TokenType.PAREN_OPEN) {
      // Configured operator: sort(false), keepN(3), etc.
      advance(); // skip (
      const args = [];
      while (current().type !== TokenType.PAREN_CLOSE) {
        if (current().type === TokenType.EOF) {
          throw new JthParserError(
            "Unterminated configured operator arguments",
            tok.line,
            tok.column
          );
        }
        args.push(parseExpression());
      }
      advance(); // skip )
      return AST.OperatorCallNode(tok.value, args, tok.line, tok.column);
    }
    // Plain identifier treated as operator call (stack-based: identifiers are operator names)
    return AST.OperatorCallNode(tok.value, [], tok.line, tok.column);
  }

  function parseBlock() {
    const open = advance(); // skip #[
    const body = [];
    while (current().type !== TokenType.ARRAY_CLOSE) {
      if (current().type === TokenType.EOF) {
        throw new JthParserError("Unterminated block", open.line, open.column);
      }
      if (current().type === TokenType.SEMICOLON) {
        advance();
        continue;
      }
      if (current().type === TokenType.COMMENT) {
        advance();
        continue;
      }
      body.push(parseExpression());
    }
    advance(); // skip ]
    return AST.BlockLiteral(body, open.line, open.column);
  }

  function parseArray() {
    const open = advance(); // skip [
    const elements = [];
    while (current().type !== TokenType.ARRAY_CLOSE) {
      if (current().type === TokenType.EOF) {
        throw new JthParserError("Unterminated array", open.line, open.column);
      }
      if (current().type === TokenType.SEMICOLON) {
        advance();
        continue;
      }
      if (current().type === TokenType.COMMENT) {
        advance();
        continue;
      }
      elements.push(parseExpression());
    }
    advance(); // skip ]
    return AST.ArrayLiteral(elements, open.line, open.column);
  }

  function parseJSObject() {
    const open = advance(); // skip {
    const properties = [];
    while (current().type !== TokenType.OBJECT_CLOSE) {
      if (current().type === TokenType.EOF) {
        throw new JthParserError(
          "Unterminated object literal",
          open.line,
          open.column
        );
      }
      if (current().type === TokenType.SEMICOLON) {
        advance();
        continue;
      }
      if (current().type === TokenType.COMMENT) {
        advance();
        continue;
      }
      properties.push(parseExpression());
    }
    advance(); // skip }
    return AST.JSObjectLiteral(properties, open.line, open.column);
  }

  function parseImport() {
    const tok = advance(); // skip IMPORT token

    // ::import "path" { binding1 binding2 ... }
    // or ::import "path"
    let path = null;
    if (current().type === TokenType.STRING) {
      path = advance().value;
    } else {
      throw new JthParserError(
        "Expected string path after ::import",
        current().line,
        current().column
      );
    }

    let bindings = [];
    if (current().type === TokenType.OBJECT_OPEN) {
      advance(); // skip {
      while (current().type !== TokenType.OBJECT_CLOSE) {
        if (current().type === TokenType.EOF) {
          throw new JthParserError(
            "Unterminated import bindings",
            tok.line,
            tok.column
          );
        }
        if (current().type === TokenType.IDENTIFIER) {
          bindings.push(advance().value);
        } else {
          throw new JthParserError(
            `Expected identifier in import bindings, got ${current().type}`,
            current().line,
            current().column
          );
        }
      }
      advance(); // skip }
    }

    return AST.ImportNode(path, bindings, tok.line, tok.column);
  }

  function parseExport() {
    const tok = advance(); // skip EXPORT token

    // ::export name1 name2 ...
    // Collect identifiers until semicolon/EOF/comment
    const names = [];
    while (
      current().type !== TokenType.SEMICOLON &&
      current().type !== TokenType.EOF &&
      current().type !== TokenType.COMMENT
    ) {
      if (current().type === TokenType.IDENTIFIER) {
        names.push(advance().value);
      } else {
        throw new JthParserError(
          `Expected identifier in export, got ${current().type}`,
          current().line,
          current().column
        );
      }
    }

    return AST.ExportNode(names, tok.line, tok.column);
  }

  return parseProgram();
}
