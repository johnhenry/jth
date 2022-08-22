import split from "split-string";

export const splitOnSpaceOld = (name) => name.match(/(?:[^\s"]+|"[^"]*")+/g);

const countLeftBracket = (str) =>
  (str.match(new RegExp("[", "g")) || []).length;
const countRightBracket = (str) =>
  (str.match(new RegExp("[", "g")) || []).length;
export const splitOnSpace = (name) =>
  split(name, {
    separator: " ",
    brackets: {
      "{": "}",
      "(": ")",
      "[": "]",
      "/*": "*/",
    },
    quotes: ['"', "'", "`"],
  })
    .map((x) => x.trim())
    .filter((x) => x);

export default splitOnSpace;
