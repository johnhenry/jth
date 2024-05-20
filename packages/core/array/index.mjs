import { attackStack } from "../tools/index.mjs"; // jth-tools
/**
 * @category StackFunction
 * @description If penultimate element of stack is an array, push the last element onto it's end
 * @param {(array|any)?} - Penultimate element of stack
 * @param {any?} - Last element of stack
 * @returns {[array|any?]} - Modified stack
 * @example
 * ```javascript
 * const newStack = push([[4, 5], 6]);
 * console.log(newStack); // [[4, 5, 6]]
 * ```
 */
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
/**
 * @category StackFunction
 * @description If penultimate element of stack is an array, unshift the last element onto it's beginning
 * @param {(array|any)?} - Penultimate element of stack
 * @param {any?} - Last element of stack
 * @returns {[array|any?]} - Modified stack
 * @example
 * ```javascript
 * const newStack = unshift([[4, 5], 6]);
 * console.log(newStack); // [[6, 4, 5]]
 * ```
 */
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
/**
 * @category StackFunction
 * @description If last element of stack is an array, pop the last element off of it
 * and push it onto the stack
 * @param {(array|any)?} - Last element of stack
 * @returns {[array|any?]} - Modified stack
 * @example
 * ```javascript
 * const newStack = pop([4, 5, 6]);
 * console.log(newStack); // [[4, 5], 6]
 * ```
 */
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

/**
 * @category StackFunction
 * If last element of stack is an array, shift the first element off of it
 * and push it onto the stack
 * @param {(array|any)?} - Last element of stack
 * @returns {[array|any?]} - Modified stack
 * @example
 * ```javascript
 * const newStack = shift([4, 5, 6]);
 * console.log(newStack); // [[5, 6], 4]
 * ```
 */
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

/**
 * @category StackFunction
 * If penultimate element of stack is an array, set, or map add the last element of the stack to it
 * @param {(array|set|map)?} - Penultimate element of stack
 * @param {any?} - Last element of stack
 * @returns {[array|set|map?]} - Modified stack
 * @example array
 * ```javascript
 * const newStack = suppose([4, 5], 6);
 * console.log(newStack); // [[4, 5, 6]]
 * ```
 * @example set
 * ```javascript
 * const newStack = suppose(new Set([4, 5]), 6);
 * console.log(newStack); // [Set(3) { 4, 5, 6 }]
 * ```
 * @example map
 * ```
 * const newStack = suppose(new Map([["a", 1], ["b", 2]]), ["c", 3]);
 * console.log(newStack); // [Map(3) { 'a' => 1, 'b' => 2, 'c' => 3 }]
 * ```
 */
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
        // Should I extract a key and value from the item?
        // I don't know if it makes sense
        // to attempt to susppose a map at all.
        const item = stack.pop;
        arr.set(item, item);
      }
    }
  }
  return [...stack, arr, ...spare];
});

export const array =
  (n = Infinity) =>
  (...stack) => {
    // split stack into two parts
    // firtst part is the origninal stack with last n elements removed
    // second part is the rest of the stack
    const end = stack.splice(-n, Infinity);

    return [...stack, end];
  };

export const arrayRev =
  (n = Infinity) =>
  (...stack) => {
    // split stack into two parts
    // firtst part is the origninal stack with last n elements removed
    // second part is the rest of the stack
    const end = stack.splice(-n, Infinity).reverse();

    return [...stack, end];
  };

// export const collect =
//   (n = Infinity) =>
//   (...stack) => {
//     // split stack into two parts
//     // firtst part is the origninal stack with last n elements removed
//     // second part is the rest of the stack
//     const end = stack.splice(-n, Infinity).reverse();

//     return [...stack, end];
//   };

export const pushItem =
  (...items) =>
  (...stack) => {
    const last = stack.pop();
    if (Array.isArray(last)) {
      for (const item of items) {
        last.push(item);
      }
      return [...stack, last];
    }
    return [...stack, last, [...items]];
  };

export const unshiftItem =
  (...items) =>
  (...stack) => {
    const last = stack.pop();
    if (Array.isArray(last)) {
      for (const item of items) {
        last.unshift(item);
      }
      return [...stack, last];
    }
    return [...stack, last, [...items]];
  };

export const flatten = (...stack) => {
  const flattened = [];
  stack.forEach((item) => {
    if (Array.isArray(item)) {
      const items = flatten(...item);
      for (const subItem of items) {
        flattened.push(subItem);
      }
    } else {
      flattened.push(item);
    }
  });
  return flattened;
};
