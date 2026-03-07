export class Stack {
  #data: unknown[] = [];
  _condStack?: unknown[];

  push(...vals: unknown[]) {
    this.#data.push(...vals);
  }

  pop(): unknown {
    return this.#data.pop();
  }

  popN(n: number): unknown[] {
    const result: unknown[] = [];
    for (let i = 0; i < n; i++) {
      if (this.#data.length === 0) break;
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
    if (len >= 2) {
      const tmp = this.#data[len - 1];
      this.#data[len - 1] = this.#data[len - 2];
      this.#data[len - 2] = tmp;
    }
  }

  dup() {
    if (this.#data.length > 0) {
      this.#data.push(this.#data[this.#data.length - 1]);
    }
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
