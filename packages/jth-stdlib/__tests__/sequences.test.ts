import { describe, it, expect } from "vitest";
import { Stack } from "@johnhenry/jth-runtime";
import { fibonacci } from "../src/sequences.ts";
import { run } from "@johnhenry/jth-compiler";
import "../src/index.ts";

describe("sequences: fibonacci", () => {
  it("(a b -- b a a+b): pushes three values", () => {
    const s = new Stack();
    s.push(2, 3);
    fibonacci(s);
    expect(s.toArray()).toEqual([3, 2, 5]);
  });

  it("starts the sequence from (0, 1)", () => {
    const s = new Stack();
    s.push(0, 1);
    fibonacci(s);
    expect(s.toArray()).toEqual([1, 0, 1]);
  });

  it("iterates with the `swap drop` trim idiom (as in examples/fibonacci.jth)", () => {
    const s = new Stack();
    s.push(0, 1);
    for (let i = 0; i < 5; i++) {
      fibonacci(s); // [b, a, a+b]
      s.swap(); // [b, a+b, a]
      s.pop(); // [b, a+b]
    }
    expect(s.toArray()).toEqual([5, 8]);
  });

  it("is registered and usable from a jth program", async () => {
    const { value } = await run("0 1 #[ fibonacci swap drop ] 6 times;");
    expect(value).toBe(13); // 0 1 1 2 3 5 8 13
  });
});
