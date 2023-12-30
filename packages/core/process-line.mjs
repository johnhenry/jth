import splitString from "split-string";
import operators from "./operators.mjs";
const matchAssingment = /^(?<str>.*)\s*:::\s*(?<vars>.+)$/;

const matchEmbed = /^::embed\s+(?<lang>\S+)\s*:(?<code>.*)$/;
const matchComment = /^\/\/.*$/;

const matchExport = /^::export\s+(?<dec>.*)$/;
const matchImport = /^::import\s+((['"`]).+\2)\s*(.*)\s*$/;
const matchGlobal = /^::import\s+((['"`]).+\2)\s*(.*)\s*$/;

// const matchLoopvalue =
//   /^::loopvalue\s+(?<iterator>\S+)\s+(?<value>\S+)\s*:(?<code>.*)$/;
// const matchLoopkey =
//   /^::loopkey\s+(?<iterator>\S+)\s+(?<key>\S+)\s*:(?<code>.*)$/;

const matchUseOp = /^(?<func>.*)\(\s*(?<cmd>[^)]*?)\s*\)$/;
// TODO: ...<cmd>[^)]...
// will this properly mstch thing ending with")" make lazier?

const matchDeclaration =
  /^(?:\s*(?<default>[^{\s]+))?\s*(?:\{\s*(?<rest>.*)\s*})?$/;

// TODO: parse for "import * as"
const parseDeclaration = (str) => {
  const desired = {};
  const groups = matchDeclaration.exec(str)?.groups;
  if (!groups) {
    return desired;
  }
  if (groups.default) {
    desired["default"] = groups.default;
  }
  if (groups.rest) {
    for (const variable of groups.rest.split(" ")) {
      const [k, v] = variable.split(":");
      desired[k] = v || k;
    }
  }
  return desired;
};

const matchMainSubs = /^\s*(?<main>[^{]+)?\s*(?:{(?<subs>.+)\})?\s*$/;

const parseDec = (str) => {
  let main;
  let named = [];
  let renamed = [];
  let collection;
  if (matchComment.test(str)) {
    return "";
  }
  if (matchMainSubs.test(str)) {
    let { main: m, subs: s } = matchMainSubs.exec(str).groups;
    m = m ? m.trim() : "";
    s = s ? s.trim() : "";
    if (m) {
      if (m.startsWith("...")) {
        collection = m.replace("...", "");
      } else {
        main = m;
      }
    }
    if (s) {
      for (const sub of s.split(" ")) {
        const [key, value] = sub.split(":").map((s) => s.trim());
        if (!value) {
          named.push(key);
        } else {
          renamed.push([key, value]);
        }
      }
    }
  }
  return {
    main,
    collection,
    named,
    renamed,
  };
};

const subArrayMatch = /^\[(.+)\]$/;
const splitOnSpace = (name) =>
  splitString(name, {
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

const insertOperator = (o, options = { operatorFunc: "$" }) => {
  if (operators(o) !== undefined) {
    return `${options.operatorFunc}("${o}")`;
  } else if (matchUseOp.test(o)) {
    const { func, cmd } = matchUseOp.exec(o).groups;
    return `${pL(func, options)}(${splitOnSpace(cmd)
      .map((cmd) => pL(cmd, options))
      .join(",")})`;
  } else if (subArrayMatch.test(o)) {
    const [, cmd] = subArrayMatch.exec(o);
    return `[${pL(cmd, options)}]`;
  }
  return o;
};

export const pL = (cmd, options) => {
  return splitOnSpace(cmd)
    .map((o) => insertOperator(o, options))
    .join(",");
};

import splitOnSemicolon from "./split-on-semicolon.mjs";

const ensureExt = (line, replacement = ".mjs", target = ".jth") => {
  const l = line.slice(1, -1);
  if (!l.endsWith(target)) {
    return line;
  }
  return line[0] + l.slice(0, l.lastIndexOf(target)) + replacement + line[0];
};

export const processLine = (cmd, options) => {
  let string = splitOnSemicolon(cmd)[0] || "";
  let variables = [];
  let declaration = "";
  const opts = {};
  let line;

  if (matchExport.test(string)) {
    const { dec } = matchExport.exec(string).groups;
    opts.export = parseDec(dec);
  } else if (matchImport.test(string)) {
    const [_, l, __, dec] = matchImport.exec(string);
    line = l;
    opts.import = parseDec(dec);
  } else if (matchGlobal.test(string)) {
    const [_, l, __, dec] = matchGlobal.exec(string);
    line = l;
    opts.global = parseDec(dec);
  } else if (matchAssingment.test(string)) {
    let { str, vars } = matchAssingment.exec(string).groups;
    str = str.trim();
    vars = vars.trim();
    if (vars.startsWith("[") && vars.endsWith("]")) {
      const protoVars = vars
        .slice(1, -1)
        .split(" ")
        .filter((x) => x);
      const spreadIndex = protoVars.findIndex((x) => x.startsWith("..."));
      if (spreadIndex > -1) {
        opts.spread = protoVars[spreadIndex].replace("...", "") || true;
        opts.beginning = protoVars.slice(0, spreadIndex);
        opts.end = protoVars.slice(spreadIndex + 1);
      }
      vars = vars
        .slice(1, -1)
        .split(" ")
        .map((x) => x.replace("...", ""))
        .filter((x) => x);
      if (spreadIndex === -1) {
        opts.spread = false;
        opts.beginning = vars;
        opts.end = [];
      }
    } else if (vars.startsWith("...")) {
      vars = [vars.replace("...", "")];
      opts.spread = vars[0];
      opts.beginning = [];
      opts.end = [];
    } else {
      declaration = vars;
      vars = [vars];
    }
    variables = vars;
    string = str;
  } else if (matchEmbed.test(string)) {
    const { lang, code } = matchEmbed.exec(string).groups;
    opts.embed = true;
    opts.lang = lang;
    opts.code = code;
  }

  const vars = variables;
  if (!line) {
    line = pL(string, options);
  }
  return { vars, declaration, line, opts };
};
export default processLine;
