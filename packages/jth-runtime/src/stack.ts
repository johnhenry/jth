import { JthRuntimeError } from "@johnhenry/jth-types";

export class Stack {
  #data: unknown[] = [];
  _condStack?: unknown[];

  push(...vals: unknown[]) {
    this.#data.push(...vals);
  }

  /**
   * Pop and return the top item. Throws JthRuntimeError (STACK_UNDERFLOW)
   * if the stack is empty, rather than silently returning `undefined` and
   * letting that corruption (NaN, false-positive comparisons, etc.)
   * propagate through downstream operators.
   */
  pop(): unknown {
    if (this.#data.length === 0) {
      throw new JthRuntimeError(
        "Stack underflow: pop() called on an empty stack",
        undefined,
        undefined,
        "STACK_UNDERFLOW"
      );
    }
    return this.#data.pop();
  }

  /**
   * Pop and return the top `n` items (bottom-to-top order). Throws
   * JthRuntimeError (STACK_UNDERFLOW) if fewer than `n` items are
   * available — a partial/short result would otherwise silently corrupt
   * whatever operator requested exactly `n` operands.
   *
   * Use `n = 0` (fixed-arity variadic-like calls) or the dedicated
   * `variadic()` helper in op.ts for "consume however many there are,
   * including zero" semantics — that is a deliberately different contract
   * from this "I need exactly n" one.
   */
  popN(n: number): unknown[] {
    if (this.#data.length < n) {
      throw new JthRuntimeError(
        `Stack underflow: expected ${n} item(s), got ${this.#data.length}`,
        undefined,
        undefined,
        "STACK_UNDERFLOW"
      );
    }
    const result: unknown[] = [];
    for (let i = 0; i < n; i++) {
      result.unshift(this.#data.pop());
    }
    return result;
  }

  peek(): unknown {
    return this.#data[this.#data.length - 1];
  }

  peekN(n: number): unknown[] {
    return this.#data.slice(-n);
  }

  get length(): number {
    return this.#data.length;
  }

  toArray(): unknown[] {
    return [...this.#data];
  }

  clear() {
    this.#data.length = 0;
  }

  isEmpty(): boolean {
    return this.#data.length === 0;
  }

  swap() {
    const len = this.#data.length;
    if (len < 2) {
      throw new JthRuntimeError(
        `Stack underflow: swap requires 2 item(s), got ${len}`,
        undefined,
        undefined,
        "STACK_UNDERFLOW"
      );
    }
    const tmp = this.#data[len - 1];
    this.#data[len - 1] = this.#data[len - 2];
    this.#data[len - 2] = tmp;
  }

  dup() {
    if (this.#data.length === 0) {
      throw new JthRuntimeError(
        "Stack underflow: dup requires 1 item(s), got 0",
        undefined,
        undefined,
        "STACK_UNDERFLOW"
      );
    }
    this.#data.push(this.#data[this.#data.length - 1]);
  }

  clone(): Stack {
    const s = new Stack();
    s.push(...this.#data);
    return s;
  }

  [Symbol.iterator]() {
    return this.#data[Symbol.iterator]();
  }
}
