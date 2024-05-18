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
