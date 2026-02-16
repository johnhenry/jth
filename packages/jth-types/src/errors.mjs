/**
 * Error hierarchy for jth.
 * All errors carry line/column for source location.
 */

export class JthError extends Error {
  constructor(message, line, column) {
    super(message);
    this.name = "JthError";
    this.line = line ?? null;
    this.column = column ?? null;
  }
}

export class JthLexerError extends JthError {
  constructor(message, line, column) {
    super(message, line, column);
    this.name = "JthLexerError";
  }
}

export class JthParserError extends JthError {
  constructor(message, line, column) {
    super(message, line, column);
    this.name = "JthParserError";
  }
}

export class JthRuntimeError extends JthError {
  constructor(message, line, column) {
    super(message, line, column);
    this.name = "JthRuntimeError";
  }
}
