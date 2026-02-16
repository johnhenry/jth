// wait (_): await a promise on top of stack
export const wait = (stack) => {
  const val = stack.pop();
  if (val && typeof val.then === "function") {
    return val.then((resolved) => {
      stack.push(resolved);
    });
  }
  stack.push(val);
};

// waitAll (__): await all promises on stack
export const waitAll = async (stack) => {
  const arr = stack.toArray();
  stack.clear();
  const results = await Promise.all(arr);
  stack.push(...results);
};
