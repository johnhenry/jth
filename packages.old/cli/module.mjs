const __PROCESS__ = async function (iterator) {
  const stack = [];
  for await (const item of iterator) {
    if (typeof item === "function") {
      if (item.APPLY) {
        const parity = item.PARITY ?? stack.length - 1;
        const subStack = [];
        const fn = stack.pop();
        for (let i = 0; i < parity; i++) {
          subStack.unshift(stack.pop());
        }
        for (const i of await fn(subStack)) {
          stack.push(i);
        }
      } else {
        stack.push(item);
      }
    } else {
      stack.push(item);
    }
  }
  return stack;
};
const __APPLY__ = function (parity = null) {
  const a = async function (args) {
    const stack = [];
    const fn = args.pop();

    for (const arg of args) {
      stack.push(await fn(arg));
    }
    return stack;
  };
  a.APPLY = true;
  a.PARITY = parity;
  return a;
};
const __EXPAND__ = function (stack) {
  const newStack = [];
  for (const item of stack) {
    for (const i of item) {
      newStack.push(i);
    }
  }
  return newStack;
};
const __COMPOSE__ = function (funcs) {
  return [
    (stack) => {
      let newStack = stack;
      for (const fn of funcs) {
        newStack = fn(newStack);
      }
      return newStack;
    },
  ];
};
const __PEEK__ = function (stack) {
  console.log(...stack);
  return stack;
};
let x;
x = await __PROCESS__([0,1,2,3,(stack=>stack.map(x=>x+1)),__APPLY__(),__PEEK__,__APPLY__()]);
export {x};