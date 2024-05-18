// const deasync = require("deasync");
import deasync from "deasync";
const wait = (promise) => {
  let resolved = 0;
  let result;
  promise
    .then((data) => {
      result = data;
      resolved = 1;
    })
    .catch((error) => {
      result = error;
      resolved = -1;
    });
  // deasync.loopWhile(function () {
  //   return !resolved;
  // });
  while (resolved === 0) {
    deasync.sleep(1);
  }

  if (resolved === -1) {
    throw result;
  }
  return result;
};
const x = wait(
  new Promise((resolve) => {
    setTimeout(() => {
      resolve("x");
    }, 2500);
  })
);
console.log({ x });
