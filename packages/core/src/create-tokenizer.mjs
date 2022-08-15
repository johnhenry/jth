const exMatch = /(?<expand>\.?)(?<func>[^!]+)?!(?<all>(?:!|\{(?<count>.+)\}))?/;

const progMatch =
  /^\[(?<line>.*)\](?<dot>\.?)(?<firstex>!?)(?:(?:\{(?<count>.+)\})|(?<secondex>!))?$/;

const commentMatch = /^\/\*.*\*\/$/;
import transformLine from "./transform-line.mjs";
export const createTokenizer = ({ process, apply, expand, compose, peek }) => {
  const tokenizer = async (s) => {
    const outvars = [];
    if (commentMatch.test(s)) {
      return { vars: outvars, tokens: [] };
    } else if (progMatch.test(s)) {
      const match = progMatch.exec(s).groups;
      const { lineJS, vars } = await transformLine(
        match.line,
        process,
        tokenizer
      );
      outvars.push(...vars);
      const result = [lineJS];
      if ((match.dot && match.firstex) || (!match.dot && !match.firstex)) {
        result.push(expand, `${apply}(1)`);
      } else if (!match.dot && match.firstex) {
        result.push(expand, `${apply}(1)`);
        if (match.secondex) {
          result.push(`${apply}()`);
        } else if (match.count) {
          result.push(`${apply}(${match.count})`);
        } else {
          result.push(`${apply}(1)`);
        }
        // result.push(expand);
      } else if (match.firstex) {
        // do nothing
      }

      return { vars: outvars, tokens: result };
    } else if (s === ".") {
      return { vars: outvars, tokens: [expand] };
    } else if (s === ":") {
      return { vars: outvars, tokens: [compose] };
    } else if (s === "@") {
      return { vars: outvars, tokens: [peek] };
    } else if (exMatch.test(s)) {
      const match = exMatch.exec(s).groups;
      if (!match.expand && !match.func && !match.all && !match.count) {
        return { vars: outvars, tokens: [`${apply}(1)`] };
      }
      const a = [];
      if (match.expand) {
        a.push(expand);
        if (match.func) {
          a.push(`${apply}(1)`);
          const { tokens, vars } = await tokenizer(match.func);
          a.push(...tokens);
          outvars.push(...vars);
          if (match.all) {
            if (match.count) {
              a.push(`${apply}(${match.count})`);
            } else {
              a.push(`${apply}()`);
            }
          } else {
            a.push(`${apply}(1)`);
          }
        } else if (match.all) {
          if (match.count) {
            a.push(`${apply}(${match.count})`);
          } else {
            a.push(`${apply}()`);
          }
        } else {
          a.push(`${apply}(1)`);
        }
      } else {
        if (match.func) {
          const { tokens, vars } = await tokenizer(match.func);
          a.push(...tokens);
          outvars.push(...vars);
          if (match.all) {
            if (match.count) {
              a.push(`${apply}(${match.count})`);
            } else {
              a.push(`${apply}()`);
            }
          } else {
            a.push(`${apply}(1)`);
          }
        } else if (match.all) {
          if (match.count) {
            a.push(`${apply}(${match.count})`);
          } else {
            a.push(`${apply}()`);
          }
        }
      }

      return { vars: outvars, tokens: a };
    }
    return { vars: outvars, tokens: [s] };
  };
  return tokenizer;
};

export default createTokenizer;
