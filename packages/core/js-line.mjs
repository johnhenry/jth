import nodeprocess from "node:process";
import { join } from "node:path";
const { log } = console;
const importExportDeclaration = (obj, json = true) => {
  if (json) {
    return JSON.stringify(obj);
  }
  const result = [];
  if (obj.default) {
    result.push(obj.default);
  }
  const entries = Object.entries(obj);
  if (entries.length) {
    result.push(
      `{${entries
        .filter(([key]) => key !== "default")
        .map(([key, value]) => (key === value ? key : `${key} as ${value}`))}}`
    );
  }
  return result.join(",");
};

const a = ({ beginning, spread, end }, copyID, lineID) => {
  const items = [`${copyID} = ${lineID}.slice();`];
  end = [...(end || [])].reverse();
  for (const e of end) {
    items.push(`${e} = ${copyID}.pop();`);
  }
  spread = spread === true ? "" : spread ? `...${spread}` : "";
  beginning = beginning ? beginning.join(",") : "";
  const i = [];
  if (beginning) {
    i.push(beginning);
  }
  if (spread) {
    i.push(spread);
  }
  if (i.length) {
    items.push(`[${i.join(",")}] = ${copyID};`);
  }
  return items;
};
const decla = ({ main, collection, named, renamed }) => {
  const comma = main && (named.length || renamed.length || collection);
  return `${main ? main : ""} ${comma ? ", " : ""} ${
    collection ? `* as ${collection} ` : ""
  }${
    named.length || renamed.length
      ? `{${named.concat(renamed.map(([k, v]) => `${k} as ${v}`)).join(",")}}`
      : ""
  }`;
};
const decla2 = ({ named, renamed }) => {
  return `{${named
    .map((n) => [n, n])
    .concat(renamed)
    .mapped(([k, v]) => `${k}:${v}`)
    .join(",")}}`;
};
const decla3 = ({ named, renamed }) => {
  return Object.entries(named.map((n) => [n, n]).concat(renamed));
};

const javascriptEmbedIdentifiers = new Set([
  "javascript",
  "ecmascript",
  "js",
  "mjs",
  "cjs",
]);

export const jsLine = (
  line,
  {
    declaration = "",
    opts = {},
    vars = [],
    recordVar = "___",
    //TODO: varGlobal -> varContext?
    varGlobal = true,
    processFunc = "processN",
    operatorFunc = "operators",
    imports = false,
    exports = false,
    dynamicImport = false,
    useAwait = true,
    context = globalThis,
  } = {
    declaration: "",
    opts: {},
    vars: [],
    recordVar: "___",
    varGlobal: true,
    processFunc: "processN",
    operatorFunc: "operators",
    imports: false,
    exports: false,
    dynamicImport: false,
    useAwait: true,
    context: globalThis,
  }
) => {
  if (exports) {
    if (varGlobal) {
      return "";
    }
    return `export ${importExportDeclaration(declaration, false)};`;
  }
  if (imports) {
    if (dynamicImport) {
      if (varGlobal) {
        let l = line.slice(1, -1);
        l = l[0] === "." ? join(nodeprocess.cwd(), l) : l;
        import(l).then((vars) => {
          const desired = declaration;

          for (const [k, v] of Object.entries(vars)) {
            const key = desired[k];
            if (key) {
              context[key] = v;
              log(key, "imported");
            }
          }
        });
        return "";
      } else {
        return `const ${importExportDeclaration(
          declaration,
          true
        )} = await import(${line});`;
      }
    } else {
      if (declaration) {
        const vars = importExportDeclaration(declaration, false).trim();
        return `import ${vars ? `${vars} from ` : ""}${line};`;
      } else {
        return `import ${line};`;
      }
    }
  }
  // // // // //
  if (varGlobal) {
    if (opts.export) {
      return "";
    }
    if (opts.import) {
      if (dynamicImport) {
        let l = line.slice(1, -1);
        l = l[0] === "." ? join(nodeprocess.cwd(), l) : l;
        import(l).then((vars) => {
          const desired = decla3(opts.import);
          for (const [k, v] of Object.entries(vars)) {
            const key = desired[k];
            if (key) {
              context[key] = v;
              log(key, "imported");
            }
          }
        });
        return "";
      } else {
        return `const ${decla2(opts.import)} = await import(${line});`;
      }
    }
    if (opts.global) {
      if (dynamicImport) {
      } else {
      }
    }
  }
  // // // // //
  if (opts.embed) {
    if (javascriptEmbedIdentifiers.has(opts.lang)) {
      return `${opts.code};`;
    }
    return "";
  }
  if (opts.export) {
    return `export ${decla(opts.export)};`;
  }
  if (opts.import) {
    if (dynamicImport) {
      return `const ${importExportDeclaration(
        declaration,
        true
      )} = await import(${line});`;
    } else {
      const claim =
        opts.import.main ||
        opts.import.collection ||
        opts.import.named.length ||
        opts.import.renamed.length;
      return `import ${claim ? `${decla(opts.import)} from ` : ""}${line};`;
    }
  }
  if (opts.global) {
    const globalName = `__${String(Math.random()).slice(2)}__`;
    return `import * as ${globalName} from ${line};
      const ${dictName}__rename = {${opts.renamed
      .map(([k, v]) => `${k}:${v}`)
      .join(",")}};
      for(const [key,value] of ${globalName}){
        globalThis[${dictName}__rename[key] || key] = value;
      }
    `;
  }

  const lineID = `__${String(Math.random()).slice(2)}__`;
  const copyID =
    opts.beginning || opts.end || opts.spread
      ? `__${String(Math.random()).slice(2)}__`
      : "";
  let v = "";
  if (varGlobal) {
    context[lineID] = undefined;
    if (copyID) {
      context[copyID] = undefined;
    }
    if (vars.length) {
      for (const x of vars) {
        context[x] = context[x];
      }
    }
  } else {
    v = `let ${lineID};\n${copyID ? `let ${copyID};\n` : ""}${
      vars.length ? `let ${vars.join(",")};\n` : ""
    }`;
  }

  const ln = `${processFunc}(0,${recordVar ? recordVar : "[]"})(${line})`;
  const result = [];
  if (v) {
    result.push(v);
  }
  result.push(
    `${lineID} = ${recordVar ? `${recordVar} = ` : ""}${
      useAwait ? "await " : ""
    }${ln};`
  );
  if (declaration) {
    result.push(`${declaration} = ${lineID};`);
  } else if (copyID) {
    result.push(...a(opts, copyID, lineID));
  }
  return result.join("\n");
};
export default jsLine;
