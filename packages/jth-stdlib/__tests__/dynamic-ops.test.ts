import { describe, it, expect } from "vitest";
import { Stack, registry } from "jth-runtime";
import { run } from "jth-compiler";
import "../src/index.ts";

/** Resolve a dynamic op and apply it to a stack seeded with `top`. */
function applyDynamic(name: string, top: unknown): unknown[] {
  const fn = registry.get(name);
  expect(fn, `expected dynamic op "${name}" to resolve`).toBeDefined();
  const s = new Stack();
  s.push(top);
  fn!(s);
  return s.toArray();
}

describe("dynamic-ops: N<op> arithmetic patterns", () => {
  it('"3+" adds the literal', () => {
    expect(applyDynamic("3+", 4)).toEqual([7]);
  });

  it('"10-" subtracts the top FROM the literal (n - a)', () => {
    expect(applyDynamic("10-", 4)).toEqual([6]);
  });

  it('"14*" multiplies', () => {
    expect(applyDynamic("14*", 2)).toEqual([28]);
  });

  it('"⋅" alias multiplies ("3⋅")', () => {
    expect(applyDynamic("3⋅", 5)).toEqual([15]);
  });

  it('"20/" divides the literal by the top (n / a)', () => {
    expect(applyDynamic("20/", 5)).toEqual([4]);
  });

  it('"÷" alias divides ("20÷")', () => {
    expect(applyDynamic("20÷", 4)).toEqual([5]);
  });

  it('"2**" raises the literal to the top (n ** a)', () => {
    expect(applyDynamic("2**", 10)).toEqual([1024]);
  });

  it('"7%" is a floored modulo of the literal by the top', () => {
    expect(applyDynamic("7%", 3)).toEqual([1]);
  });

  it('"%" flooring differs from "%%" remainder for negative operands', () => {
    expect(applyDynamic("-7%", 3)).toEqual([2]); // ((-7 % 3) + 3) % 3
    expect(applyDynamic("-7%%", 3)).toEqual([-1]); // plain remainder
  });

  it("supports decimal literals ('0.5+')", () => {
    expect(applyDynamic("0.5+", 1)).toEqual([1.5]);
  });

  it("supports negative literals ('-3+')", () => {
    expect(applyDynamic("-3+", 10)).toEqual([7]);
  });
});

describe("dynamic-ops: BigInt-aware paths (Nn<op>)", () => {
  it('"3n+" adds BigInts', () => {
    expect(applyDynamic("3n+", 4n)).toEqual([7n]);
  });

  it('"2n**" exponentiates BigInts', () => {
    expect(applyDynamic("2n**", 64n)).toEqual([18446744073709551616n]);
  });

  it('"10n-" subtracts BigInts', () => {
    expect(applyDynamic("10n-", 4n)).toEqual([6n]);
  });
});

describe("dynamic-ops: Nlog patterns", () => {
  it('"2log" computes log base 2', () => {
    const [result] = applyDynamic("2log", 8);
    expect(result).toBeCloseTo(3);
  });

  it('"10log" computes log base 10', () => {
    const [result] = applyDynamic("10log", 1000);
    expect(result).toBeCloseTo(3);
  });
});

describe("dynamic-ops: via jth programs", () => {
  it("4 3+ evaluates to 7", async () => {
    const { value } = await run("4 3+;");
    expect(value).toBe(7);
  });

  it("8 2log evaluates to 3", async () => {
    const { value } = await run("8 2log;");
    expect(value).toBeCloseTo(3);
  });
});

describe("dynamic-ops: non-matching names do not resolve", () => {
  it("plain words are not captured by the numeric patterns", () => {
    expect(registry.get("nosuchop")).toBeUndefined();
  });
});
