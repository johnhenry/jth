export const wait = async (...stack) => {
  const last = stack.pop();
  return [...stack, await last];
};

export const waitAll = async (...stack) => {
  return Promise.all(stack);
};
