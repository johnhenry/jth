import splitOnSemicolon from "./split-on-semicolon.mjs";
import splitOnSpace from "./split-on-space.mjs";

const operators = new Set([".", "@"]);

const matchOpExecute =
  /^(?<operator>[.@])?(?<execute>!)(?:(?<executeAll>!)|{\s*(?<executeSome>\S+)\s*}|(?<postExpand>\.?))?$/;

const matchAssingment = /^(?<str>.+)\s*->\s*(?<vars>.+)$/;
const matchProgram =
  /^(?:\[(?<content>.*)])(?<expand>[.])?(?<execute>!)?(?<postExpand>\.?)$/;

const matchImport = /^import .+/;
const matchExport = /^export .+/;
const matchComment = /^\/\//;
const DEFAULT_EXT = "jth";
const ENDMATCH = /\.jth(['"`])?$/;
const TARGET_EXT = "mjs";

const tokenize = (str) => {
  let string = str;
  let variables = [];
  let assingment = "";
  if (matchAssingment.test(string)) {
    let { str, vars } = matchAssingment.exec(string).groups;
    str = str.trim();
    vars = vars.trim();
    if (vars.startsWith("[") && vars.endsWith("]")) {
      assingment = vars.split(" ").join("");
      vars = vars
        .slice(1, -1)
        .split(",")
        .map((x) => x.trim());
    } else {
      assingment = vars;
      vars = [vars];
    }
    variables = vars;
    string = str;
  }

  const tokens = splitOnSpace(string)
    .map((token) => {
      if (token.startsWith("(") && token.endsWith(")")) {
        return [{ type: "literal", value: token }];
      }
      if (operators.has(token)) {
        return [{ type: "operator", value: token }];
      }
      if (matchOpExecute.test(token)) {
        const { operator, executeAll, executeSome, postExpand } =
          matchOpExecute.exec(token).groups;
        const result = [];
        if (operator) {
          result.push({
            type: "operator",
            value: operator,
          });
        }
        result.push({
          type: "execute",
          value: executeSome ?? Boolean(executeAll),
        });

        if (postExpand) {
          result.push({
            type: "operator",
            value: ".",
          });
          result.push({
            type: "execute",
            value: false,
          });
        }
        return result;
      }
      if (matchProgram.test(token)) {
        const { content, expand, execute, postExpand } =
          matchProgram.exec(token).groups;
        const result = [];
        result.push({
          type: "program",
          value: ast(content),
        });
        if (expand && !execute) {
          result.push({
            type: "operator",
            value: ".",
          });
          result.push({
            type: "execute",
            value: false,
          });
        }
        if (execute && !expand) {
          result.push({
            type: "execute",
            value: false,
          });
          if (postExpand) {
            result.push({
              type: "operator",
              value: ".",
            });
            result.push({
              type: "execute",
              value: false,
            });
          }
        }
        return result;
      } else if (token.includes("!")) {
        let tkn = token;
        const result = [];
        const index = token.lastIndexOf("!");
        let executeValue = undefined;
        if (token[index - 1] === "!" && token[index + 1] === undefined) {
          //...!!
          tkn = token.slice(0, -2);
          executeValue = true;
        } else if (token[index - 1] !== "!" && token[index + 1] === "{") {
          //...!{...}
          executeValue = token.slice(index + 2, -1);
          tkn = token.slice(0, index);
        } else if (token[index + 1] === undefined) {
          //...!
          executeValue = false;
          tkn = token.slice(0, -1);
        }
        const tkns = tkn.split("!");
        if (tkns.length === 1) {
          result.push({
            type: "literal",
            value: tkns[0],
          });
        } else {
          result.push({
            type: "composition",
            value: tkns,
          });
        }
        if (executeValue !== undefined) {
          result.push({
            type: "execute",
            value: executeValue,
          });
        }
        return result;
      }
      return [
        {
          type: "literal",
          value: token,
        },
      ];
    })
    .flat();
  return { tokens, variables, assingment };
};

export const ast = (string) => {
  const AST = [];
  const lines = splitOnSemicolon(string);
  for (const line of lines) {
    if (matchImport.test(line)) {
      AST.push({ type: "import", line });
    } else if (matchExport.test(line)) {
      AST.push({ type: "export", line });
    } else if (matchComment.test(line)) {
      AST.push({ type: "comment", line });
    } else {
      AST.push({ type: "statement", ...tokenize(line) });
    }
  }
  return AST;
};

const transformVariables = (variables, binding = "let") =>
  `${binding} ${[...new Set(variables)].join(",")}`;

const OPERATOR_TRANSLATION = {
  "!": "__EXECUTE__",
  ".": "__EXPAND__",
  "@": "__PEEK__",
  PROCESS: "__PROCESS__",
  COMPOSE: "__COMPOSE__",
  SUB_PROCESS: "__SUB_PROCESS__",
};
export const transformAST = (
  tree,
  options = { declarations: [], subprocess: false }
) => {
  options.declarations = options.declarations || [];
  const result = [];
  for (const line of tree) {
    switch (line.type) {
      case "import":
      case "export":
        if (ENDMATCH.test(line.line)) {
          const [, quote] = ENDMATCH.exec(line.line);
          result.push(
            line.line.replace(
              `.${DEFAULT_EXT}${quote}`,
              `.${TARGET_EXT}${quote}`
            )
          );
        } else {
          result.push(line.line);
        }

        break;
      case "comment":
        result.push(line.line);
        break;
      case "statement":
        {
          const { tokens, variables, assingment } = line;
          options.declarations.push(...variables);
          const lineArray = [];
          for (const token of tokens) {
            switch (token.type) {
              case "literal":
                lineArray.push(token.value);
                break;
              case "operator":
                lineArray.push(`${OPERATOR_TRANSLATION[token.value]}()`);
                break;
              case "execute":
                switch (token.value) {
                  case true:
                    lineArray.push(`${OPERATOR_TRANSLATION["!"]}()`);
                    break;
                  case false:
                    lineArray.push(`${OPERATOR_TRANSLATION["!"]}(1)`);
                    break;
                  default:
                    lineArray.push(
                      `${OPERATOR_TRANSLATION["!"]}(${token.value})`
                    );
                }
                break;
              case "program":
                lineArray.push(
                  transformAST(token.value, {
                    declarations: options.declarations,
                    subprocess: true,
                  })
                );
                break;
              case "composition":
                lineArray.push(
                  `${OPERATOR_TRANSLATION.COMPOSE}(${token.value.join(",")})`
                );
                break;
            }
          }
          result.push(
            `${assingment ? `${assingment} = ` : ""}${
              options.subprocess ? "" : `await`
            } ${OPERATOR_TRANSLATION.PROCESS}(${lineArray.join(",")})${
              options.subprocess ? "" : "()"
            }`
          );
        }
        break;
      default:
    }
  }
  if (options.subprocess) {
    return result.join(";");
  } else {
    if (options.declarations.length) {
      result.unshift(transformVariables(options.declarations));
    }
    result.push("\n");
    return result.join(";\n");
  }
};

import { preamble } from "./inject.mjs";

export { preamble };
export const transform = (string, usePreamble = true, options) =>
  `${usePreamble ? preamble().join("\n") : ""}${transformAST(
    ast(string),
    options
  )}`.trim();

export default ast;
