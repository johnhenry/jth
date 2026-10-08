/**
 * Error hierarchy for jth.
 * All errors carry line/column for source location.
 */

export class JthError extends Error {
  line: number | null;
  column: number | null;

  constructor(message: string, line?: number, column?: number) {
    super(message);
    this.name = "JthError";
    this.line = line ?? null;
    this.column = column ?? null;
  }
}

export class JthLexerError extends JthError {
  constructor(message: string, line?: number, column?: number) {
    super(message, line, column);
    this.name = "JthLexerError";
  }
}

export class JthParserError extends JthError {
  constructor(message: string, line?: number, column?: number) {
    super(message, line, column);
    this.name = "JthParserError";
  }
}

export class JthRuntimeError extends JthError {
  /** Machine-readable error code, e.g. "ITERATION_LIMIT", "UNKNOWN_OPERATOR". */
  code: string | null;

  constructor(message: string, line?: number, column?: number, code?: string) {
    super(message, line, column);
    this.name = "JthRuntimeError";
    this.code = code ?? null;
  }
}

export interface StackUnderflowDetails {
  /** Number of stack items the operation needed. */
  expected: number;
  /** Number of stack items actually available. */
  actual: number;
  /** Name of the jth operator that underflowed, when known. */
  operator?: string | null;
}

/**
 * Thrown when an operation needs more items than the stack holds.
 * `code` is always "STACK_UNDERFLOW". `operator` is attributed by the
 * runtime driver (processN) when the failing operator is known; source
 * position (`line`/`column`) is attached by the generated code.
 */
export class StackUnderflowError extends JthRuntimeError {
  expected: number;
  actual: number;
  operator: string | null;

  constructor(details: StackUnderflowDetails, line?: number, column?: number) {
    super(
      StackUnderflowError.describe(details.expected, details.actual, details.operator ?? null),
      line,
      column,
      "STACK_UNDERFLOW"
    );
    this.name = "StackUnderflowError";
    this.expected = details.expected;
    this.actual = details.actual;
    this.operator = details.operator ?? null;
  }

  private static describe(expected: number, actual: number, operator: string | null): string {
    const who = operator ? ` in "${operator}"` : "";
    return `Stack underflow${who}: needed ${expected} item(s), stack has ${actual}`;
  }

  /**
   * Attribute the underflow to an operator. The first (innermost)
   * attribution wins, so nested blocks report the operator that actually
   * ran out of operands.
   */
  withOperator(operator: string): this {
    if (this.operator === null) {
      this.operator = operator;
      this.message = StackUnderflowError.describe(this.expected, this.actual, operator);
    }
    return this;
  }
}
