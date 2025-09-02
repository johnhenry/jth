import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { get, set } from '../dict/index.mjs';
import { next, drain, iter } from '../iterator/index.mjs';
import { to, fromTo, toInc, fromToInc } from '../range/index.mjs';

describe('Dictionary Operations', () => {
  describe('set', () => {
    test('should set single key-value pair', () => {
      const result = set('name', 'jth')();
      assert.equal(result[0].name, 'jth');
    });

    test('should set multiple key-value pairs', () => {
      const result = set('name', 'jth', 'version', '0.2.0')();
      assert.equal(result[0].name, 'jth');
      assert.equal(result[0].version, '0.2.0');
    });

    test('should work with existing object on stack', () => {
      const obj = { existing: 'value' };
      const result = set('name', 'jth')(obj);
      assert.equal(result[0].existing, 'value');
      assert.equal(result[0].name, 'jth');
    });
  });

  describe('get', () => {
    test('should get single value', () => {
      const obj = { name: 'jth', version: '0.2.0' };
      const result = get('name')(obj);
      assert.deepEqual(result, ['jth']);
    });

    test('should get multiple values', () => {
      const obj = { name: 'jth', version: '0.2.0', author: 'john' };
      const result = get(['name', 'version'])(obj);
      assert.deepEqual(result, [{ name: 'jth', version: '0.2.0' }]);
    });

    test('should get all values when no key specified', () => {
      const obj = { name: 'jth', version: '0.2.0' };
      const result = get()(obj);
      // get() with no key returns the object values wrapped in result
      assert.deepEqual(result, [obj]);
    });

    test('should return undefined for missing key', () => {
      const obj = { name: 'jth' };
      const result = get('missing')(obj);
      assert.deepEqual(result, [undefined]);
    });
  });
});

describe('Iterator Operations', () => {
  describe('iter', () => {
    test('should create iterator from array', () => {
      const result = iter([1, 2, 3]);
      assert.ok(result[0].next);
      assert.equal(typeof result[0].next, 'function');
    });

    test('should return non-iterable unchanged', () => {
      const result = iter(42);
      assert.deepEqual(result, [42]);
    });
  });

  describe('next', () => {
    test('should get next value from iterator', () => {
      const arr = [1, 2, 3];
      const iterator = arr[Symbol.iterator]();
      const result1 = next(iterator);
      assert.equal(result1[1], 1);
      
      const result2 = next(result1[0]);
      assert.equal(result2[1], 2);
      
      const result3 = next(result2[0]);
      assert.equal(result3[1], 3);
    });

    test('should handle exhausted iterator', () => {
      const arr = [1];
      const iterator = arr[Symbol.iterator]();
      iterator.next(); // exhaust it
      const result = next(iterator);
      assert.equal(result.length, 1); // Only iterator returned, no value
    });
  });

  describe('drain', () => {
    test('should drain n values from iterator', () => {
      const arr = [1, 2, 3, 4, 5];
      const drainFunc = drain(0, 3);
      const result = drainFunc(arr);
      assert.ok(result.includes(1));
      assert.ok(result.includes(2));
      assert.ok(result.includes(3));
    });

    test('should drain single value by default', () => {
      const arr = [1, 2, 3];
      const drainFunc = drain(0, 1);
      const result = drainFunc(arr);
      assert.ok(result.includes(1));
    });
  });
});

describe('Range Operations', () => {
  describe('to', () => {
    test('should create exclusive range', () => {
      assert.deepEqual(to(1, 5), [2, 3, 4]);
    });

    test('should handle descending range', () => {
      assert.deepEqual(to(5, 1), [4, 3, 2]);
    });

    test('should handle equal bounds', () => {
      assert.deepEqual(to(3, 3), []);
    });
  });

  describe('fromTo', () => {
    test('should include start, exclude end', () => {
      assert.deepEqual(fromTo(1, 5), [1, 2, 3, 4]);
    });

    test('should handle descending range', () => {
      assert.deepEqual(fromTo(5, 1), [5, 4, 3, 2]);
    });

    test('should handle equal bounds', () => {
      assert.deepEqual(fromTo(3, 3), []);
    });
  });

  describe('toInc', () => {
    test('should exclude start, include end', () => {
      assert.deepEqual(toInc(1, 5), [2, 3, 4, 5]);
    });

    test('should handle descending range', () => {
      assert.deepEqual(toInc(5, 1), [4, 3, 2, 1]);
    });

    test('should handle equal bounds', () => {
      assert.deepEqual(toInc(3, 3), []);
    });
  });

  describe('fromToInc', () => {
    test('should include both start and end', () => {
      assert.deepEqual(fromToInc(1, 5), [1, 2, 3, 4, 5]);
    });

    test('should handle descending range', () => {
      assert.deepEqual(fromToInc(5, 1), [5, 4, 3, 2, 1]);
    });

    test('should handle equal bounds', () => {
      assert.deepEqual(fromToInc(3, 3), [3]);
    });

    test('should handle negative ranges', () => {
      assert.deepEqual(fromToInc(-2, 2), [-2, -1, 0, 1, 2]);
    });
  });
});