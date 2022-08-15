import split from "split-string";

export const splitOnSpaceOld = (name) => name.match(/(?:[^\s"]+|"[^"]*")+/g);
export const splitOnSpace = (name) =>
  split(name, {
    separator: " ",
    // brackets: true,
    brackets: {
      "[": "]",
      "{": "}",
      "(": ")",
      "<": ">",
      "/*": "*/",
    },
    quotes: ['"', "'", "`"],
  })
    .map((x) => x.trim())
    .filter((x) => x);

export default splitOnSpace;
