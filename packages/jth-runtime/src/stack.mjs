export class Stack {
  #data = [];

  push(...vals) {
    this.#data.push(...vals);
  }

  pop() {
    return this.#data.pop();
  }

  popN(n) {
    const result = [];
    for (let i = 0; i < n; i++) {
      if (this.#data.length === 0) break;
      result.unshift(this.#data.pop());
    }
    return result;
  }

  peek() {
    return this.#data[this.#data.length - 1];
  }

  peekN(n) {
    return this.#data.slice(-n);
  }

  get length() {
    return this.#data.length;
  }

  toArray() {
    return [...this.#data];
  }

  clear() {
    this.#data.length = 0;
  }

  isEmpty() {
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

  clone() {
    const s = new Stack();
    s.push(...this.#data);
    return s;
  }

  [Symbol.iterator]() {
    return this.#data[Symbol.iterator]();
  }
}
