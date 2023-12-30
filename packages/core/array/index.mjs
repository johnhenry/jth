import { attackStack } from "../tools/index.mjs"; // jth-tools
export const push = attackStack((index = 0, n = 1) => (...stack) => {
  if (!stack.length) {
    return stack;
  }
  const spare = [];
  for (let i = 0; i < index; i++) {
    spare.push(stack.pop());
  }
  while (stack.length) {
    const thing = stack.pop();
    if (Array.isArray(thing)) {
      thing.push(...spare.splice(-n, Infinity));
      spare.unshift(thing);
      break;
    } else {
      spare.unshift(thing);
    }
  }
  return [...stack, ...spare];
});

export const unshift = attackStack((index = 0, n = 1) => (...stack) => {
  if (!stack.length) {
    return stack;
  }
  const spare = [];
  for (let i = 0; i < index; i++) {
    spare.push(stack.pop());
  }
  while (stack.length) {
    const thing = stack.pop();
    if (Array.isArray(thing)) {
      thing.unshift(...spare.splice(-n, Infinity));
      spare.unshift(thing);
      break;
    } else {
      spare.unshift(thing);
    }
  }
  return [...stack, ...spare];
});

export const pop = attackStack((index = 0, n = 1) => (...stack) => {
  if (!stack.length) {
    return stack;
  }
  const spare = [];
  for (let i = 0; i < index; i++) {
    spare.push(stack.pop());
  }
  while (stack.length) {
    const thing = stack.pop();
    if (Array.isArray(thing)) {
      stack.push(thing);
      const items = [];
      for (let i = 0; i < n; i++) {
        if (thing.length) {
          items.push(thing.pop());
        }
      }
      return [...stack, ...spare, ...items];
    } else {
      spare.unshift(thing);
    }
  }
  return [...stack, ...spare];
});

export const shift = attackStack((index = 0, n = 1) => (...stack) => {
  if (!stack.length) {
    return stack;
  }
  const spare = [];
  for (let i = 0; i < index; i++) {
    spare.push(stack.pop());
  }
  while (stack.length) {
    const thing = stack.pop();
    if (Array.isArray(thing)) {
      stack.push(thing);
      const items = [];
      for (let i = 0; i < n; i++) {
        if (thing.length) {
          items.push(thing.shift());
        }
      }
      return [...stack, ...spare, ...items];
    } else {
      spare.unshift(thing);
    }
  }
  return [...stack, ...spare];
});

export const suppose = attackStack((index = 0, n = 1) => (...stack) => {
  if (!stack.length) {
    return stack;
  }
  const spare = [];
  for (let i = 0; i < index; i++) {
    spare.push(stack.pop());
  }
  const arr = stack.pop();

  for (let i = 0; i < n; i++) {
    if (stack.length) {
      if (Array.isArray(arr)) {
        arr.unshift(stack.pop());
      } else if (arr instanceof Set) {
        arr.add(stack.pop());
      } else if (arr instanceof Map) {
        const item = stack.pop;
        arr.set(item, item);
      }
    }
  }
  return [...stack, arr, ...spare];
});
