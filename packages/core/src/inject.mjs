const __PROCESS__ = (...tokens) => {
  const func = async () => {
    const stack = [];
    let index = 0;
    L: for (const token of tokens.slice(index)) {
      if (token.EXECUTE) {
        const substack = [];
        const parity = token.PARITY === null ? stack.length : token.PARITY + 1;
        for (let i = 0; i < parity; i++) {
          if (stack.length) {
            substack.unshift(stack.pop());
          }
        }
        // index -= substack.length;
        index = stack.length;
        stack.push(...(await token(substack)));
        continue L;
      } else {
        stack.push(token);
      }
    }
    return stack;
  };
  func.PROCESS = true;
  func.toString = function () {
    return tokens.toString();
  };
  func[Symbol.iterator] = function* () {
    yield* tokens;
  };
  return func;
};
const __EXECUTE__ = (parity = null) => {
  const a = async (stack) => {
    if (typeof stack[stack.length - 1] === "function") {
      const fn = stack.pop();
      if (fn.PROCESS) {
        const result = [...(await fn())];
        stack.push(result);
        return stack;
      }
      return await fn(stack);
    }
    return stack;
  };
  a.EXECUTE = true;
  a.PARITY = parity;
  return a;
};
const __EXPAND__ = () => (stack) => {
  const iterator = stack[Symbol.iterator]();
  const newStack = [];
  for (const item of iterator) {
    for (const i of item) {
      newStack.push(i);
    }
  }
  return newStack;
};
const __COMPOSE__ =
  (...funcs) =>
  (stack) => {
    let newStack = stack;
    for (const fn of funcs) {
      newStack = fn(newStack);
    }
    return newStack;
  };
const __PEEK__ =
  (logger = console.log) =>
  (stack) => {
    logger(...stack);
    return stack;
  };
export const genDefaults = (NONCE = "") => ({
  process: "__PROCESS__" + NONCE,
  execute: "__EXECUTE__" + NONCE,
  expand: "__EXPAND__" + NONCE,
  compose: "__COMPOSE__" + NONCE,
  peek: "__PEEK__" + NONCE,
});
const defaults = genDefaults();
export const preamble = (
  {
    PROCESS = defaults.process,
    EXECUTE = defaults.execute,
    EXPAND = defaults.expand,
    COMPOSE = defaults.compose,
    PEEK = defaults.peek,
  } = genDefaults()
) => [
  `const ${PROCESS} = ${__PROCESS__.toString()};`,
  `const ${EXECUTE} = ${__EXECUTE__.toString()};`,
  `const ${EXPAND} = ${__EXPAND__.toString()};`,
  `const ${COMPOSE} = ${__COMPOSE__.toString()};`,
  `const ${PEEK} = ${__PEEK__.toString()};`,
];
