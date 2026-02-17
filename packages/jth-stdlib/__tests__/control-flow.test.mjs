import { describe, it, expect } from "vitest";
import { Stack } from "jth-runtime";
import {
  ifOp,
  elseifOp,
  elseOp,
  when,
  dropWhen,
  keepIf,
  dropIf,
  timesOp,
  loop,
  whileOp,
  untilOp,
  breakOp,
  BreakSignal,
} from "../src/control-flow.mjs";
import { apply, exec } from "../src/stack-ops.mjs";

describe("control-flow", () => {
  describe("ifOp (3-arg legacy)", () => {
    it("executes trueBlock when condition is truthy", () => {
      const s = new Stack();
      const falseBlock = (stack) => stack.push("no");
      const trueBlock = (stack) => stack.push("yes");
      s.push(falseBlock, trueBlock, 1);
      ifOp(s);
      expect(s.toArray()).toEqual(["yes"]);
    });

    it("executes falseBlock when condition is falsy", () => {
      const s = new Stack();
      const falseBlock = (stack) => stack.push("no");
      const trueBlock = (stack) => stack.push("yes");
      s.push(falseBlock, trueBlock, 0);
      ifOp(s);
      expect(s.toArray()).toEqual(["no"]);
    });

    it("does nothing if block is not a function (3-arg)", () => {
      const s = new Stack();
      const trueBlock = "also-not-a-fn";
      const dummyFn = () => {};
      s.push(dummyFn, trueBlock, 1);
      ifOp(s);
      expect(s.toArray()).toEqual([]);
    });
  });

  describe("ifOp (2-arg mode)", () => {
    it("executes block when condition is truthy", () => {
      const s = new Stack();
      const block = (stack) => stack.push("matched");
      s.push(block, true);
      ifOp(s);
      expect(s.toArray()).toEqual(["matched"]);
    });

    it("does not execute block when condition is falsy", () => {
      const s = new Stack();
      s.push(42);
      const block = (stack) => stack.push("matched");
      s.push(block, false);
      ifOp(s);
      expect(s.toArray()).toEqual([42]);
    });

    it("sets _condStack on the stack", () => {
      const s = new Stack();
      s.push(42);
      const block = (stack) => stack.push("matched");
      s.push(block, true);
      ifOp(s);
      expect(s._condStack).toEqual([true]);
    });
  });

  describe("elseifOp", () => {
    it("skips when already matched", () => {
      const s = new Stack();
      s._condStack = [true];
      const block = (stack) => stack.push("should not run");
      s.push(block, true);
      elseifOp(s);
      expect(s.toArray()).toEqual([]);
    });

    it("executes when not yet matched and condition is truthy", () => {
      const s = new Stack();
      s._condStack = [false];
      const block = (stack) => stack.push("elseif matched");
      s.push(block, true);
      elseifOp(s);
      expect(s.toArray()).toEqual(["elseif matched"]);
      expect(s._condStack).toEqual([true]);
    });

    it("skips when not matched and condition is falsy", () => {
      const s = new Stack();
      s._condStack = [false];
      const block = (stack) => stack.push("should not run");
      s.push(block, false);
      elseifOp(s);
      expect(s.toArray()).toEqual([]);
      expect(s._condStack).toEqual([false]);
    });
  });

  describe("elseOp", () => {
    it("executes when not matched, pops condStack", () => {
      const s = new Stack();
      s._condStack = [false];
      const block = (stack) => stack.push("else ran");
      s.push(block);
      elseOp(s);
      expect(s.toArray()).toEqual(["else ran"]);
      expect(s._condStack).toEqual([]);
    });

    it("skips when already matched, pops condStack", () => {
      const s = new Stack();
      s._condStack = [true];
      const block = (stack) => stack.push("should not run");
      s.push(block);
      elseOp(s);
      expect(s.toArray()).toEqual([]);
      expect(s._condStack).toEqual([]);
    });
  });

  describe("if/elseif/else chain", () => {
    it("matches first branch", () => {
      const s = new Stack();
      s.push(15);
      const b1 = (stack) => stack.push("fizzbuzz");
      s.push(b1, true);
      ifOp(s);
      const b2 = (stack) => stack.push("fizz");
      s.push(b2, false);
      elseifOp(s);
      const b3 = (stack) => stack.push("buzz");
      s.push(b3, false);
      elseifOp(s);
      const b4 = (stack) => {};
      s.push(b4);
      elseOp(s);
      expect(s.toArray()).toEqual([15, "fizzbuzz"]);
    });

    it("matches second branch (elseif)", () => {
      const s = new Stack();
      s.push(9);
      const b1 = (stack) => stack.push("fizzbuzz");
      s.push(b1, false);
      ifOp(s);
      const b2 = (stack) => stack.push("fizz");
      s.push(b2, true);
      elseifOp(s);
      const b3 = (stack) => stack.push("buzz");
      s.push(b3, false);
      elseifOp(s);
      const b4 = (stack) => {};
      s.push(b4);
      elseOp(s);
      expect(s.toArray()).toEqual([9, "fizz"]);
    });

    it("falls through to else", () => {
      const s = new Stack();
      s.push(7);
      const b1 = (stack) => stack.push("fizzbuzz");
      s.push(b1, false);
      ifOp(s);
      const b2 = (stack) => stack.push("fizz");
      s.push(b2, false);
      elseifOp(s);
      const b3 = (stack) => stack.push("buzz");
      s.push(b3, false);
      elseifOp(s);
      const b4 = (stack) => stack.push("default");
      s.push(b4);
      elseOp(s);
      expect(s.toArray()).toEqual([7, "default"]);
    });

    it("handles nested if/elseif/else chains", () => {
      const s = new Stack();
      s.push(42);
      const outerBlock = (stack) => stack.push("outer-if");
      s.push(outerBlock, false);
      ifOp(s);
      const outerElse = (stack) => {
        stack.push("inner-value");
        const innerB1 = (st) => st.push("inner-if");
        stack.push(innerB1, false);
        ifOp(stack);
        const innerB2 = (st) => st.push("inner-elseif");
        stack.push(innerB2, true);
        elseifOp(stack);
        const innerB3 = (st) => st.push("inner-else");
        stack.push(innerB3);
        elseOp(stack);
      };
      s.push(outerElse);
      elseOp(s);
      expect(s.toArray()).toEqual([42, "inner-value", "inner-elseif"]);
    });
  });

  describe("when", () => {
    it("keeps value when condition is truthy", () => {
      const s = new Stack();
      s.push(42, 1);
      when(s);
      expect(s.toArray()).toEqual([42]);
    });

    it("drops value when condition is falsy", () => {
      const s = new Stack();
      s.push(42, 0);
      when(s);
      expect(s.toArray()).toEqual([]);
    });

    it("keeps other stack items when condition is truthy", () => {
      const s = new Stack();
      s.push(10, 42, 1);
      when(s);
      expect(s.toArray()).toEqual([10, 42]);
    });
  });

  describe("dropWhen (bug fix)", () => {
    it("drops value when condition is truthy", () => {
      const s = new Stack();
      s.push(42, 1);
      dropWhen(s);
      expect(s.toArray()).toEqual([]);
    });

    it("keeps value when condition is falsy", () => {
      const s = new Stack();
      s.push(42, 0);
      dropWhen(s);
      expect(s.toArray()).toEqual([42]);
    });

    it("BUG FIX: only drops in true branch, not both", () => {
      const s = new Stack();
      s.push(10, 42, false);
      dropWhen(s);
      expect(s.toArray()).toEqual([10, 42]);
    });

    it("drops value and preserves rest when condition is truthy", () => {
      const s = new Stack();
      s.push(10, 42, true);
      dropWhen(s);
      expect(s.toArray()).toEqual([10]);
    });
  });

  describe("keepIf", () => {
    it("keeps value when condition is truthy", () => {
      const s = new Stack();
      s.push(42, 1);
      keepIf(s);
      expect(s.toArray()).toEqual([42]);
    });

    it("drops value when condition is falsy", () => {
      const s = new Stack();
      s.push(42, 0);
      keepIf(s);
      expect(s.toArray()).toEqual([]);
    });
  });

  describe("dropIf", () => {
    it("drops value when condition is truthy", () => {
      const s = new Stack();
      s.push(42, 1);
      dropIf(s);
      expect(s.toArray()).toEqual([]);
    });

    it("keeps value when condition is falsy", () => {
      const s = new Stack();
      s.push(42, 0);
      dropIf(s);
      expect(s.toArray()).toEqual([42]);
    });
  });

  describe("timesOp", () => {
    it("executes block N times", () => {
      const s = new Stack();
      s.push(0);
      const block = (stack) => {
        const val = stack.pop();
        stack.push(val + 1);
      };
      s.push(block, 3);
      timesOp(s);
      expect(s.toArray()).toEqual([3]);
    });

    it("executes block 0 times does nothing", () => {
      const s = new Stack();
      s.push(42);
      const block = (stack) => stack.push(99);
      s.push(block, 0);
      timesOp(s);
      expect(s.toArray()).toEqual([42]);
    });
  });

  describe("loop", () => {
    it("executes block configured number of times", () => {
      const s = new Stack();
      s.push(0);
      const block = (stack) => {
        const val = stack.pop();
        stack.push(val + 10);
      };
      s.push(block);
      loop(5)(s);
      expect(s.toArray()).toEqual([50]);
    });
  });

  describe("apply (from stack-ops)", () => {
    it("executes a block from the stack", async () => {
      const s = new Stack();
      s.push(2, 3);
      s.push((stack) => {
        const b = stack.pop();
        const a = stack.pop();
        stack.push(a + b);
      });
      await apply(s);
      expect(s.toArray()).toEqual([5]);
    });
  });

  describe("exec (from stack-ops)", () => {
    it("is an alias for apply", () => {
      expect(exec).toBe(apply);
    });
  });

  describe("while loop", () => {
    it("repeats body while condition is truthy", () => {
      const s = new Stack();
      s.push(0);
      const condBlock = (stack) => {
        stack.dup();
        const val = stack.pop();
        stack.push(val < 5);
      };
      const bodyBlock = (stack) => {
        const val = stack.pop();
        stack.push(val + 1);
      };
      s.push(condBlock, bodyBlock);
      whileOp(s);
      expect(s.toArray()).toEqual([5]);
    });

    it("does not execute body if condition is initially false", () => {
      const s = new Stack();
      s.push(10);
      const condBlock = (stack) => {
        stack.dup();
        const val = stack.pop();
        stack.push(val < 5);
      };
      const bodyBlock = (stack) => {
        const val = stack.pop();
        stack.push(val + 1);
      };
      s.push(condBlock, bodyBlock);
      whileOp(s);
      expect(s.toArray()).toEqual([10]);
    });

    it("handles multiple iterations accumulating values", () => {
      const s = new Stack();
      s.push(1);
      const condBlock = (stack) => {
        stack.dup();
        const val = stack.pop();
        stack.push(val <= 3);
      };
      const bodyBlock = (stack) => {
        stack.dup();
        const top = stack.pop();
        stack.push(top + 1);
      };
      s.push(condBlock, bodyBlock);
      whileOp(s);
      expect(s.toArray()).toEqual([1, 2, 3, 4]);
    });

    it("works with zero iterations when condition is immediately false", () => {
      const s = new Stack();
      s.push(false);
      const condBlock = (stack) => {
        // condition just checks top of stack (which is false)
      };
      const bodyBlock = (stack) => {
        stack.push("should not appear");
      };
      s.push(condBlock, bodyBlock);
      whileOp(s);
      expect(s.toArray()).toEqual([]);
    });
  });

  describe("until loop", () => {
    it("repeats body until condition becomes truthy", () => {
      const s = new Stack();
      s.push(0);
      const condBlock = (stack) => {
        stack.dup();
        const val = stack.pop();
        stack.push(val === 5);
      };
      const bodyBlock = (stack) => {
        const val = stack.pop();
        stack.push(val + 1);
      };
      s.push(condBlock, bodyBlock);
      untilOp(s);
      expect(s.toArray()).toEqual([5]);
    });

    it("does not execute body if condition is immediately truthy", () => {
      const s = new Stack();
      s.push(5);
      const condBlock = (stack) => {
        stack.dup();
        const val = stack.pop();
        stack.push(val === 5);
      };
      const bodyBlock = (stack) => {
        const val = stack.pop();
        stack.push(val + 1);
      };
      s.push(condBlock, bodyBlock);
      untilOp(s);
      expect(s.toArray()).toEqual([5]);
    });

    it("executes body when condition is initially falsy", () => {
      const s = new Stack();
      s.push(0);
      const condBlock = (stack) => {
        stack.dup();
        const val = stack.pop();
        stack.push(val > 0);
      };
      const bodyBlock = (stack) => {
        stack.push(42);
      };
      s.push(condBlock, bodyBlock);
      untilOp(s);
      expect(s.toArray()).toEqual([0, 42]);
    });
  });

  describe("break", () => {
    it("exits while loop early", () => {
      const s = new Stack();
      s.push(0);
      const condBlock = (stack) => {
        stack.push(true);
      };
      const bodyBlock = (stack) => {
        const val = stack.pop();
        stack.push(val + 1);
        stack.dup();
        const top = stack.pop();
        if (top >= 3) {
          throw new BreakSignal();
        }
      };
      s.push(condBlock, bodyBlock);
      whileOp(s);
      expect(s.toArray()).toEqual([3]);
    });

    it("exits until loop early", () => {
      const s = new Stack();
      s.push(0);
      const condBlock = (stack) => {
        stack.push(false);
      };
      const bodyBlock = (stack) => {
        const val = stack.pop();
        stack.push(val + 1);
        stack.dup();
        const top = stack.pop();
        if (top >= 3) {
          throw new BreakSignal();
        }
      };
      s.push(condBlock, bodyBlock);
      untilOp(s);
      expect(s.toArray()).toEqual([3]);
    });

    it("BreakSignal propagates when thrown outside a loop", () => {
      expect(() => {
        throw new BreakSignal();
      }).toThrow(BreakSignal);
    });

    it("breakOp throws BreakSignal when called as stack operator", () => {
      const s = new Stack();
      expect(() => breakOp(s)).toThrow(BreakSignal);
    });
  });
});
