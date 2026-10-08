export { Stack } from "./stack.ts";
export { op, variadic } from "./op.ts";
export type { StackOperator } from "./op.ts";
export { annotate, getMeta, getTiming, delay, persist, rewind, skip, limit } from "./meta.ts";
export { processN } from "./process-n.ts";
export { registry, nameOperator, operatorName, operatorInfo } from "./registry.ts";
export { emit, captureOutput } from "./output.ts";
export type { StaticOpDoc } from "./registry.ts";
