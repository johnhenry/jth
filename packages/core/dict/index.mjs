const getString =
  (key, bind) =>
  (...stack) => {
    const member = stack.pop();
    return [
      ...stack,
      bind && typeof member[key] === "function"
        ? member[key].bind(object)
        : member[key],
    ];
  };

const getList =
  (keys, bind) =>
  (...stack) => {
    const member = stack.pop();
    const object = {};
    for (const key of keys) {
      object[key] =
        bind && typeof member[key] === "function"
          ? member[key].bind(object)
          : member[key];
    }
    return [...stack, object];
  };

const getAll =
  (bind) =>
  (...stack) => {
    const member = stack.pop();
    const object = {};
    for (const key in member) {
      object[key] =
        bind && typeof member[key] === "function"
          ? member[key].bind(object)
          : member[key];
    }
    return [...stack, object];
  };

/**
 * @description Get a value from a dictionary
 * @param {string|string[]} key
 * @param {boolean} bind
 * @returns {function}
 */
export const get = (key, bind) => {
  if (key === undefined) {
    return getAll(bind);
  }
  if (typeof key === "string") {
    return getString(key, bind);
  } else {
    return getList(key, bind);
  }
};

/**
 * @description Set a value in a dictionary
 * @param {any} assingments
 * @returns {function}
 */
export const set = (...assingments) => {
  const entries = [];
  while (assingments.length > 1) {
    entries.push([assingments.shift(), assingments.shift()]);
  }
  const bind = assingments.length ? assingments.pop() : {};
  return (...stack) => {
    const target = stack.length > 0 ? Object.assign(stack.pop(), bind) : bind;
    for (const [key, value] of entries) {
      target[key] = value;
    }
    return [...stack, target];
  };
};

/**
 * @description Drills down into a dictionary to get a nested value
 * @param {any} assingments
 * @returns {function}
 */
export const drill = (...keys) => {
  return (...stack) => {
    let target = stack.pop();
    for (const key of keys) {
      if (!target) {
        break;
      }
      target = target[key];
    }
    return [...stack, target];
  };
}
/**
 * @description Drills down into a dictionary to set a nested value
 * @param {any} assingments
 * @returns {function}
 */
export const drillSet = (...keys) => {
  return (...stack) => {
    const value = keys.pop();
    let target = stack[stack.length - 1];
    const lastKey = keys.pop();
    for (const key of keys) {
      if (!target[key]) {
        target[key] = {};
      }
      target = target[key];
    }
    target[lastKey] = value;
    return stack;
  };
};
