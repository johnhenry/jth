import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  abs,
  gcd,
  gcdAll,
  lcm,
  lcmAll
} from '../unsorted/index.mjs';

describe('Math Extensions', () => {
  describe('abs', () => {
    test('should return absolute value of positive number', () => {
      assert.deepEqual(abs(1, 2, 5), [1, 2, 5]);
    });

    test('should return absolute value of negative number', () => {
      assert.deepEqual(abs(1, 2, -5), [1, 2, 5]);
    });

    test('should handle zero', () => {
      assert.deepEqual(abs(0), [0]);
    });

    test('should handle multiple values', () => {
      assert.deepEqual(abs(-3, -2, -1, 0, 1, 2, 3), [-3, -2, -1, 0, 1, 2, 3]);
    });
  });

  describe('gcd', () => {
    test('should calculate GCD of two numbers', () => {
      assert.deepEqual(gcd(12, 8), [4]);
    });

    test('should calculate GCD with zero', () => {
      assert.deepEqual(gcd(5, 0), [5]);
      assert.deepEqual(gcd(0, 5), [5]);
    });

    test('should calculate GCD of coprime numbers', () => {
      assert.deepEqual(gcd(7, 13), [1]);
    });

    test('should calculate GCD of same numbers', () => {
      assert.deepEqual(gcd(10, 10), [10]);
    });

    test('should preserve other stack items', () => {
      assert.deepEqual(gcd(1, 2, 12, 8), [1, 2, 4]);
    });
  });

  describe('gcdAll', () => {
    test('should calculate GCD of all numbers', () => {
      assert.deepEqual(gcdAll(12, 18, 24), [6]);
    });

    test('should calculate GCD of many numbers', () => {
      assert.deepEqual(gcdAll(100, 50, 25, 75), [25]);
    });

    test('should handle single number', () => {
      assert.deepEqual(gcdAll(42), [42]);
    });
  });

  describe('lcm', () => {
    test('should calculate LCM of two numbers', () => {
      assert.deepEqual(lcm(4, 6), [12]);
    });

    test('should calculate LCM of coprime numbers', () => {
      assert.deepEqual(lcm(7, 13), [91]);
    });

    test('should calculate LCM of same numbers', () => {
      assert.deepEqual(lcm(10, 10), [10]);
    });

    test('should handle one as input', () => {
      assert.deepEqual(lcm(1, 5), [5]);
      assert.deepEqual(lcm(5, 1), [5]);
    });

    test('should preserve other stack items', () => {
      assert.deepEqual(lcm(1, 2, 4, 6), [12]);
    });
  });

  describe('lcmAll', () => {
    test('should calculate LCM of all numbers', () => {
      assert.deepEqual(lcmAll(4, 6, 8), [24]);
    });

    test('should calculate LCM of many numbers', () => {
      assert.deepEqual(lcmAll(2, 3, 4, 5), [60]);
    });

    test('should handle single number', () => {
      assert.deepEqual(lcmAll(42), [42]);
    });
  });
});