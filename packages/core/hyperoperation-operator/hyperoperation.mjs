//https://github.com/qntm/hyperoperate/edit/main/src/index.js
// also interesting: https://naruyoko.github.io/ExpantaNum.js/explanation.html
// All arguments must be BigInts. Return value is a BigInt or a thrown RangeError

const bigH = (n, a, b) => {
  if (n < 0n || a < 0n || b < 0n) {
    throw Error("Can only hyperoperate on non-negative integers");
  }

  // successor operator
  if (n === 0n) {
    // Ignore `b`
    return a + 1n;
  }

  // addition
  if (n === 1n) {
    return a + b;
  }

  // multiplication
  if (n === 2n) {
    return a * b;
  }

  // exponentiation
  if (n === 3n) {
    return a ** b;
  }

  // n >= 4, time for some handy base cases

  if (a === 0n) {
    // Fun fact:
    return b % 2n === 0n ? 1n : 0n;
  }

  if (a === 1n) {
    // 1^...^b = 1 for all finite b
    return 1n;
  }

  // a >= 2

  if (b === 0n) {
    // a^0 = 1 for all a >= 2
    return 1n;
  }

  if (b === 1n) {
    // a^...^1 = a for all a >= 2
    return a;
  }

  // b >= 2

  if (a === 2n && b === 2n) {
    // Another fun fact
    return 4n;
  }

  let result = a;
  for (let i = 1n; i < b; i++) {
    // This can cause a stack explosion... unavoidable because hyperoperation is not primitive recursive
    result = bigH(n - 1n, a, result);
  }

  return result;
};

/*
 * @description  Performs a hyperoperation on two numbers
 * @param {BigInt} n - The hyperoperation to perform
 * @param {BigInt} a - The first argument
 * @param {BigInt} b - The second argument
 * @returns {BigInt} - The result of the hyperoperation
 * @throws {RangeError} - If any argument is negative
 * @throws {RangeError} - If the result is too large to be represented as a BigInt
 * @throws {RangeError} - If the result causes a stack overflow
 * @throws {Error} - If any argument is negative
 * @throws {Error} - If any argument if all three areguments are not of the same type (BigInts or numbers)
 * @example
 * ```javascript
 * hyperoperation(0n)(1n, 2n); // 2n
 * ```
 *
 */

export const hyperoperation =
  (n) =>
  (a, b = 0n) => {
    if ([n, a, b].every((arg) => typeof arg === "bigint")) {
      return bigH(n, a, b);
    }

    if ([n, a, b].every((arg) => Number.isInteger(arg))) {
      // All plain doubles... convert inputs to `BigInt`s, then convert the result back to a double
      try {
        return Number(bigH(BigInt(n), BigInt(a), BigInt(b)));
      } catch (error) {
        // Not clear what other error could be thrown at this stage?
        /* istanbul ignore if */
        if (
          !(
            (
              error instanceof RangeError &&
              (error.message.includes("BigInt") || // BigInt overflow
                error.message.includes("stack"))
            ) // stack overflow
          )
        ) {
          throw error;
        }
      }

      return Infinity;
    }
    if ([a, b].every((arg) => typeof arg === "bigint")) {
      try {
        return bigH(BigInt(n), a, b);
      } catch (error) {
        // Not clear what other error could be thrown at this stage?
        /* istanbul ignore if */
        if (
          !(
            (
              error instanceof RangeError &&
              (error.message.includes("BigInt") || // BigInt overflow
                error.message.includes("stack"))
            ) // stack overflow
          )
        ) {
          throw error;
        }
      }

      return Infinity;
    }
    if ([a, b].every((arg) => typeof arg === "number")) {
      try {
        return Number(bigH(n, BigInt(a), BigInt(b)));
      } catch (error) {
        // Not clear what other error could be thrown at this stage?
        /* istanbul ignore if */
        if (
          !(
            (
              error instanceof RangeError &&
              (error.message.includes("BigInt") || // BigInt overflow
                error.message.includes("stack"))
            ) // stack overflow
          )
        ) {
          throw error;
        }
      }
      return Infinity;
    }

    throw Error("Can only hyperoperate on three numbers or three BigInts");
  };
export default hyperoperation;
