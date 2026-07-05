import { describe, it, expect } from "vitest";
import { Stack, registry } from "jth-runtime";
import { hyperoperation } from "../src/hyperoperations.ts";
import { run } from "jth-compiler";
import "../src/index.ts";

describe("hyperoperation(n) semantics", () => {
  it("n=0 is successor of a (b unused)", () => {
    expect(hyperoperation(0)(5, 0)).toBe(6);
    // The b parameter defaults to 0n, so the one-arg form needs BigInt a:
    expect(hyperoperation(0n)(5n)).toBe(6n);
  });

  it("n=1 is addition", () => {
    expect(hyperoperation(1)(2, 3)).toBe(5);
  });

  it("n=2 is multiplication", () => {
    expect(hyperoperation(2)(4, 5)).toBe(20);
  });

  it("n=3 is exponentiation", () => {
    expect(hyperoperation(3)(2, 10)).toBe(1024);
  });

  it("n=4 is tetration", () => {
    expect(hyperoperation(4)(2, 3)).toBe(16); // 2^(2^2)
    expect(hyperoperation(4)(3, 2)).toBe(27); // 3^3
  });

  it("n=5 is pentation", () => {
    expect(hyperoperation(5)(2, 2)).toBe(4);
    expect(hyperoperation(5)(2, 3)).toBe(65536);
  });

  it("base cases: b=0 -> 1, b=1 -> a, a=1 -> 1 (n>3)", () => {
    expect(hyperoperation(4)(7, 0)).toBe(1);
    expect(hyperoperation(4)(7, 1)).toBe(7);
    expect(hyperoperation(5)(1, 99)).toBe(1);
  });

  it("works with BigInt inputs (returns BigInt)", () => {
    expect(hyperoperation(4n)(2n, 3n)).toBe(16n);
    expect(hyperoperation(3n)(2n, 64n)).toBe(18446744073709551616n);
  });
});

describe("hyperoperation error throws", () => {
  it("throws HYPEROP_DOMAIN for non-integer arguments", () => {
    expect(() => hyperoperation(4)(1.5, 2)).toThrow(
      "All arguments must be integers or BigInts"
    );
    try {
      hyperoperation(4)(1.5, 2);
      expect.unreachable();
    } catch (e: any) {
      expect(e.code).toBe("HYPEROP_DOMAIN");
    }
  });

  it("throws HYPEROP_DOMAIN for negative BigInt arguments", () => {
    expect(() => hyperoperation(4n)(-1n, 2n)).toThrow(
      "Non-negative integers only"
    );
    try {
      hyperoperation(4n)(-1n, 2n);
      expect.unreachable();
    } catch (e: any) {
      expect(e.code).toBe("HYPEROP_DOMAIN");
    }
  });

  it("Number path maps overflow/domain errors to Infinity", () => {
    // The Number branch catches the internal throw and yields Infinity.
    expect(hyperoperation(4)(-1, 2)).toBe(Infinity);
  });

  it("throws for a mix of Number and non-integer", () => {
    expect(() => hyperoperation(2)(2, "x")).toThrow(
      "All arguments must be integers or BigInts"
    );
  });
});

describe("hyperoperations: dynamic *** registration", () => {
  it('"***" resolves to tetration (n=4)', () => {
    const fn = registry.get("***");
    expect(fn).toBeDefined();
    const s = new Stack();
    s.push(2, 3);
    fn!(s);
    expect(s.toArray()).toEqual([16]);
  });

  it('"****" resolves to pentation (n=5)', () => {
    const fn = registry.get("****");
    expect(fn).toBeDefined();
    const s = new Stack();
    s.push(2, 2);
    fn!(s);
    expect(s.toArray()).toEqual([4]);
  });

  it('"**" is NOT captured by the dynamic pattern (static exp op)', () => {
    // The pattern requires 3+ asterisks; ** is plain exponentiation.
    const s = new Stack();
    s.push(2, 8);
    registry.resolve("**")(s);
    expect(s.toArray()).toEqual([256]);
  });

  it("works via a jth program", async () => {
    const { value } = await run("2 3 ***;");
    expect(value).toBe(16);
  });
});
