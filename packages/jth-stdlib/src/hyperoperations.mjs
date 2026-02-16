import { op, registry } from "jth-runtime";

const bigH = (n, a, b) => {
  if (n < 0n || a < 0n || b < 0n) throw Error("Non-negative integers only");
  if (n === 0n) return a + 1n;
  if (n === 1n) return a + b;
  if (n === 2n) return a * b;
  if (n === 3n) return a ** b;
  if (a === 0n) return b % 2n === 0n ? 1n : 0n;
  if (a === 1n) return 1n;
  if (b === 0n) return 1n;
  if (b === 1n) return a;
  if (a === 2n && b === 2n) return 4n;
  let result = a;
  for (let i = 1n; i < b; i++) result = bigH(n - 1n, a, result);
  return result;
};

export const hyperoperation = (n) => (a, b = 0n) => {
  if ([n, a, b].every((x) => typeof x === "bigint")) return bigH(n, a, b);
  if ([n, a, b].every((x) => Number.isInteger(x))) {
    try {
      return Number(bigH(BigInt(n), BigInt(a), BigInt(b)));
    } catch {
      return Infinity;
    }
  }
  throw Error("All arguments must be integers or BigInts");
};

export function registerHyperops() {
  registry.setDynamic(/^\*{3,}$/, (name) => {
    const h = hyperoperation(name.length + 1);
    return op(2)((a, b) => [h(a, b)]);
  });
}
