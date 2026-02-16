import { op, registry } from "jth-runtime";

// Register dynamic patterns: N+, N-, N*, N/, N%, N**, Nlog
export function registerDynamicOps() {
  // Number + operator: "3+" means "add 3", "14*" means "multiply by 14"
  registry.setDynamic(
    /^([+-]?(?:\d*\.)?\d+)(n?)([+\-*/÷⋅%]|\*{2}|%{2})$/,
    (name, pattern) => {
      const [, num, bigint, opChar] = pattern.exec(name);
      const n = bigint ? BigInt(num) : Number(num);
      switch (opChar) {
        case "+":
          return op(1)((a) => [n + a]);
        case "-":
          return op(1)((a) => [n - a]);
        case "*":
        case "\u22C5":
          return op(1)((a) => [n * a]);
        case "/":
        case "\u00F7":
          return op(1)((a) => [n / a]);
        case "%":
          return op(1)((a) => [((n % a) + a) % a]);
        case "**":
          return op(1)((a) => [n ** a]);
        case "%%":
          return op(1)((a) => [n % a]);
      }
    }
  );

  // Logarithms: "2log", "10log"
  registry.setDynamic(/^([+-]?(?:\d*\.)?\d+)log$/, (name, pattern) => {
    const [, base] = pattern.exec(name);
    return op(1)((a) => [Math.log(a) / Math.log(Number(base))]);
  });
}
