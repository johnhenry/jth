import split from "split-string";

export const splitOnSemicolon = (name) =>
  split(name, {
    separator: ";",
    // brackets: true,
    brackets: {
      "//": "\n",
      "[": "]",
      "{": "}",
      "(": ")",
      "/*": "*/",
    },
    quotes: ['"', "'", "`"],
  })
    .map((x) => x.trim())
    .filter((x) => x);

export default splitOnSemicolon;
