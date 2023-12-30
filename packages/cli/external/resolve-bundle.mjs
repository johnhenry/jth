import { rollup } from "rollup";
import nodeResolve from "@rollup/plugin-node-resolve";

export const resolveBundle = async (input = "") => {
  const up = await rollup({ input, plugins: [nodeResolve()] });
  const { output } = await up.generate({ format: "iife" });
  return output.map(({ code }) => code).join("\n");
};
export default resolveBundle;
