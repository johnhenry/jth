import { TokenType, token } from "jth-types/tokens";
import { JthLexerError } from "jth-types/errors";

/**
 * Operator characters used for single/multi-char operators.
 */
const OPERATOR_CHARS = new Set([
  "+", "-", "*", "/", "=", "<", ">", "@", "$", ".", "%", "~", "&", "|", "^", "!", "?",
]);

/**
 * Multi-character operators, ordered longest-first so we match greedily.
 */
const MULTI_CHAR_OPERATORS = [
  "<<-", "->>",
  "<=>",
  "==", "<=", ">=",
  "**", "@@", "$$", "%%", "~~", "++", "--", "&&", "||",
  "...",
];

/**
 * Unicode operator characters.
 */
const UNICODE_OPERATORS = new Set([
  "\u03A3", // Sigma
  "\u03A0", // Pi
  "\u221A", // sqrt
  "\u00F7", // division
  "\u22C5", // dot operator
  "\u2205", // empty set
  "\u0305", // combining overline (for x-bar)
]);

function isUnicodeOperator(ch) {
  return UNICODE_OPERATORS.has(ch);
}

function isDigit(ch) {
  return ch >= "0" && ch <= "9";
}

function isAlpha(ch) {
  return (ch >= "a" && ch <= "z") || (ch >= "A" && ch <= "Z");
}

function isIdentStart(ch) {
  return isAlpha(ch) || ch === "_";
}

function isIdentChar(ch) {
  return isAlpha(ch) || isDigit(ch) || ch === "-" || ch === "_";
}

function isWhitespace(ch) {
  return ch === " " || ch === "\t" || ch === "\r" || ch === "\n";
}

function isOperatorChar(ch) {
  return OPERATOR_CHARS.has(ch);
}

/**
 * Lex jth source code into an array of tokens.
 * @param {string} source - jth source code
 * @returns {Array<{type: string, value: *, line: number, column: number}>}
 */
export function lex(source) {
  const tokens = [];
  let pos = 0;
  let line = 1;
  let column = 1;

  function peek(offset = 0) {
    return source[pos + offset];
  }

  function current() {
    return source[pos];
  }

  function advance() {
    const ch = source[pos];
    pos++;
    if (ch === "\n") {
      line++;
      column = 1;
    } else {
      column++;
    }
    return ch;
  }

  function addToken(type, value, startLine, startCol) {
    tokens.push(token(type, value, startLine, startCol));
  }

  /**
   * Determine if the previous non-whitespace context allows a negative number.
   * Returns true if at start of input, or after an operator/delimiter/semicolon.
   */
  function canStartNegativeNumber() {
    if (tokens.length === 0) return true;
    const last = tokens[tokens.length - 1];
    const t = last.type;
    return (
      t === TokenType.OPERATOR ||
      t === TokenType.SEMICOLON ||
      t === TokenType.BLOCK_OPEN ||
      t === TokenType.OBJECT_OPEN ||
      t === TokenType.ARRAY_OPEN ||
      t === TokenType.PAREN_OPEN ||
      t === TokenType.COMMENT ||
      t === TokenType.DEFINITION ||
      t === TokenType.VALUE_DEFINITION ||
      t === TokenType.IMPORT ||
      t === TokenType.EXPORT
    );
  }

  function readNumber(startLine, startCol) {
    let num = "";

    // Handle negative
    if (current() === "-") {
      num += advance();
    }

    // Hex
    if (current() === "0" && (peek(1) === "x" || peek(1) === "X")) {
      num += advance(); // 0
      num += advance(); // x
      while (pos < source.length && /[0-9a-fA-F]/.test(current())) {
        num += advance();
      }
      const value = parseInt(num, 16);
      // Check for dynamic operator (number immediately followed by operator/ident char)
      if (pos < source.length && !isWhitespace(current()) && (isOperatorChar(current()) || isIdentStart(current()))) {
        return readDynamicOperator(String(value), startLine, startCol);
      }
      addToken(TokenType.NUMBER, value, startLine, startCol);
      return;
    }

    // Integer/float
    while (pos < source.length && isDigit(current())) {
      num += advance();
    }

    // Decimal part
    if (pos < source.length && current() === "." && pos + 1 < source.length && isDigit(peek(1))) {
      num += advance(); // .
      while (pos < source.length && isDigit(current())) {
        num += advance();
      }
    }

    const value = parseFloat(num);

    // Check for dynamic operator (number immediately followed by operator/ident char, no whitespace)
    if (pos < source.length && !isWhitespace(current()) && current() !== ";" && current() !== "}" && current() !== "]" && current() !== ")") {
      if (isOperatorChar(current()) || isIdentStart(current())) {
        return readDynamicOperator(num, startLine, startCol);
      }
    }

    addToken(TokenType.NUMBER, value, startLine, startCol);
  }

  function readDynamicOperator(numStr, startLine, startCol) {
    // Read the operator/identifier part that follows the number
    let opPart = "";
    if (isOperatorChar(current())) {
      // Read operator chars
      while (pos < source.length && isOperatorChar(current())) {
        opPart += advance();
      }
    } else if (isIdentStart(current())) {
      // Read identifier chars
      while (pos < source.length && isIdentChar(current())) {
        opPart += advance();
      }
    }
    addToken(TokenType.OPERATOR, numStr + opPart, startLine, startCol);
  }

  function readString(quote, startLine, startCol) {
    advance(); // skip opening quote
    let str = "";
    while (pos < source.length && current() !== quote) {
      if (current() === "\\") {
        advance(); // skip backslash
        if (pos >= source.length) {
          throw new JthLexerError("Unterminated string escape", line, column);
        }
        const escaped = advance();
        switch (escaped) {
          case "n": str += "\n"; break;
          case "t": str += "\t"; break;
          case "r": str += "\r"; break;
          case "\\": str += "\\"; break;
          case "'": str += "'"; break;
          case '"': str += '"'; break;
          case "`": str += "`"; break;
          default: str += "\\" + escaped; break;
        }
      } else if (current() === "\n" && quote !== "`") {
        throw new JthLexerError("Unterminated string", startLine, startCol);
      } else {
        str += advance();
      }
    }
    if (pos >= source.length) {
      throw new JthLexerError("Unterminated string", startLine, startCol);
    }
    advance(); // skip closing quote
    addToken(TokenType.STRING, str, startLine, startCol);
  }

  function readIdentifierOrKeyword(startLine, startCol) {
    let name = "";
    // Identifier: starts with alpha/underscore, then alpha/digit/hyphen/underscore
    while (pos < source.length && isIdentChar(current())) {
      name += advance();
    }
    // Trailing ? for predicates
    if (pos < source.length && current() === "?") {
      name += advance();
    }

    // Check for keywords
    if (name === "true") {
      addToken(TokenType.BOOLEAN, true, startLine, startCol);
    } else if (name === "false") {
      addToken(TokenType.BOOLEAN, false, startLine, startCol);
    } else if (name === "null") {
      addToken(TokenType.NULL, null, startLine, startCol);
    } else if (name === "undefined") {
      addToken(TokenType.UNDEFINED, undefined, startLine, startCol);
    } else {
      addToken(TokenType.IDENTIFIER, name, startLine, startCol);
    }
  }

  function readOperator(startLine, startCol) {
    // Try multi-char operators, longest first
    for (const op of MULTI_CHAR_OPERATORS) {
      if (source.startsWith(op, pos)) {
        for (let i = 0; i < op.length; i++) advance();
        addToken(TokenType.OPERATOR, op, startLine, startCol);
        return;
      }
    }
    // Single char operator
    const ch = advance();
    addToken(TokenType.OPERATOR, ch, startLine, startCol);
  }

  function readStars(startLine, startCol) {
    let stars = "";
    while (pos < source.length && current() === "*") {
      stars += advance();
    }
    // 3+ stars → hyperoperator, 2 → **, 1 → *
    addToken(TokenType.OPERATOR, stars, startLine, startCol);
  }

  function readInlineJS(startLine, startCol) {
    // We've confirmed we're at (( — read balanced parens
    let depth = 0;
    let code = "";
    while (pos < source.length) {
      if (current() === "(") {
        depth++;
        code += advance();
      } else if (current() === ")") {
        depth--;
        code += advance();
        if (depth === 0) break;
      } else {
        if (current() === "\n") {
          code += advance();
        } else {
          code += advance();
        }
      }
    }
    if (depth !== 0) {
      throw new JthLexerError("Unterminated inline JS expression", startLine, startCol);
    }
    addToken(TokenType.INLINE_JS, code, startLine, startCol);
  }

  function readComment(startLine, startCol) {
    advance(); // skip first /
    advance(); // skip second /
    let text = "";
    // Skip leading space if present
    if (pos < source.length && current() === " ") {
      advance();
    }
    while (pos < source.length && current() !== "\n") {
      text += advance();
    }
    addToken(TokenType.COMMENT, text, startLine, startCol);
  }

  function readHashComment(startLine, startCol) {
    advance(); // skip #
    let text = "";
    // Skip leading space if present
    if (pos < source.length && current() === " ") {
      advance();
    }
    while (pos < source.length && current() !== "\n") {
      text += advance();
    }
    addToken(TokenType.COMMENT, text, startLine, startCol);
  }

  function readColon(startLine, startCol) {
    advance(); // skip first :

    if (pos < source.length && current() === ":") {
      // Double colon: could be ::import, ::export, or ::name (value definition)
      advance(); // skip second :

      // Read the name/keyword
      let name = "";
      while (pos < source.length && isIdentChar(current())) {
        name += advance();
      }

      if (name === "import") {
        addToken(TokenType.IMPORT, "import", startLine, startCol);
      } else if (name === "export") {
        addToken(TokenType.EXPORT, "export", startLine, startCol);
      } else if (name.length > 0) {
        // Trailing ? for predicates
        if (pos < source.length && current() === "?") {
          name += advance();
        }
        addToken(TokenType.VALUE_DEFINITION, name, startLine, startCol);
      } else {
        throw new JthLexerError("Expected identifier after '::'", startLine, startCol);
      }
    } else {
      // Single colon: :name (definition)
      let name = "";
      while (pos < source.length && isIdentChar(current())) {
        name += advance();
      }
      // Trailing ? for predicates
      if (pos < source.length && current() === "?") {
        name += advance();
      }
      if (name.length === 0) {
        throw new JthLexerError("Expected identifier after ':'", startLine, startCol);
      }
      addToken(TokenType.DEFINITION, name, startLine, startCol);
    }
  }

  // Main lex loop
  while (pos < source.length) {
    const ch = current();
    const startLine = line;
    const startCol = column;

    // Whitespace
    if (isWhitespace(ch)) {
      advance();
      continue;
    }

    // Comment
    if (ch === "/" && peek(1) === "/") {
      readComment(startLine, startCol);
      continue;
    }

    // Semicolon
    if (ch === ";") {
      advance();
      addToken(TokenType.SEMICOLON, ";", startLine, startCol);
      continue;
    }

    // Strings
    if (ch === '"' || ch === "'" || ch === "`") {
      readString(ch, startLine, startCol);
      continue;
    }

    // Block literal: #[
    if (ch === "#" && peek(1) === "[") {
      advance(); // #
      advance(); // [
      addToken(TokenType.BLOCK_OPEN, "#[", startLine, startCol);
      continue;
    }

    // Hash comment: # (but not #[, which is handled above)
    if (ch === "#") {
      readHashComment(startLine, startCol);
      continue;
    }

    // Object open/close
    if (ch === "{") {
      advance();
      addToken(TokenType.OBJECT_OPEN, "{", startLine, startCol);
      continue;
    }
    if (ch === "}") {
      advance();
      addToken(TokenType.OBJECT_CLOSE, "}", startLine, startCol);
      continue;
    }

    // Array open/close
    if (ch === "[") {
      advance();
      addToken(TokenType.ARRAY_OPEN, "[", startLine, startCol);
      continue;
    }
    if (ch === "]") {
      advance();
      addToken(TokenType.ARRAY_CLOSE, "]", startLine, startCol);
      continue;
    }

    // Parentheses / Inline JS
    if (ch === "(") {
      if (peek(1) === "(") {
        // Inline JS: ((...) => ...)
        readInlineJS(startLine, startCol);
        continue;
      }
      advance();
      addToken(TokenType.PAREN_OPEN, "(", startLine, startCol);
      continue;
    }
    if (ch === ")") {
      advance();
      addToken(TokenType.PAREN_CLOSE, ")", startLine, startCol);
      continue;
    }

    // Colon: definitions, value definitions, directives
    if (ch === ":") {
      readColon(startLine, startCol);
      continue;
    }

    // Negative number: - followed by digit, when in a position that allows it
    if (ch === "-" && pos + 1 < source.length && isDigit(peek(1)) && canStartNegativeNumber()) {
      readNumber(startLine, startCol);
      continue;
    }

    // Numbers
    if (isDigit(ch)) {
      readNumber(startLine, startCol);
      continue;
    }

    // Stars (handled specially for hyperoperators)
    if (ch === "*") {
      readStars(startLine, startCol);
      continue;
    }

    // Operators
    if (isOperatorChar(ch)) {
      readOperator(startLine, startCol);
      continue;
    }

    // Unicode operators
    if (isUnicodeOperator(ch)) {
      advance();
      addToken(TokenType.OPERATOR, ch, startLine, startCol);
      continue;
    }

    // Identifiers and keywords
    if (isIdentStart(ch)) {
      readIdentifierOrKeyword(startLine, startCol);
      continue;
    }

    // Identifier starting with hyphen (e.g. stand-alone hyphenated words won't happen
    // since hyphen is an operator char, but identifiers like hyphenated-name start with alpha)

    // Unknown character
    throw new JthLexerError(`Unexpected character: '${ch}'`, startLine, startCol);
  }

  addToken(TokenType.EOF, null, line, column);
  return tokens;
}
