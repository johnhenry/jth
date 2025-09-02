import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  mean,
  median,
  mode,
  modes,
  populationVariance,
  sampleVariance,
  populationStandardDeviation,
  sampleStandardDeviation,
  percentile,
  fiveNumberSummary,
  fiveNumberSummaryB
} from '../stat/index.mjs';

describe('Statistics Functions', () => {
  describe('mean', () => {
    test('should calculate mean of numbers', () => {
      assert.deepEqual(mean(1, 2, 3, 4, 5), [3]);
    });

    test('should handle single number', () => {
      assert.deepEqual(mean(42), [42]);
    });

    test('should handle negative numbers', () => {
      assert.deepEqual(mean(-2, -1, 0, 1, 2), [0]);
    });
  });

  describe('median', () => {
    test('should find median of odd count', () => {
      assert.deepEqual(median(1, 2, 3, 4, 5), [3]);
    });

    test('should find median of even count', () => {
      assert.deepEqual(median(1, 2, 3, 4), [2.5]);
    });

    test('should handle single number', () => {
      assert.deepEqual(median(42), [42]);
    });

    test('should handle unsorted numbers', () => {
      assert.deepEqual(median(5, 1, 3, 2, 4), [3]);
    });
  });

  describe('mode', () => {
    test('should find single mode', () => {
      assert.deepEqual(mode(1, 1, 2, 3, 4), [1]);
    });

    test('should find mode when multiple exist (returns first)', () => {
      const result = mode(1, 1, 2, 2, 3);
      assert.ok(result[0] === 1 || result[0] === 2);
    });

    test('should handle all unique values', () => {
      const result = mode(1, 2, 3, 4, 5);
      assert.ok([1, 2, 3, 4, 5].includes(result[0]));
    });
  });

  describe('modes', () => {
    test('should find all modes', () => {
      const result = modes(1, 1, 2, 2, 3);
      assert.equal(result[result.length - 1], 2); // Count of modes
      assert.ok(result.includes(1));
      assert.ok(result.includes(2));
    });

    test('should return all values when all unique', () => {
      const result = modes(1, 2, 3);
      assert.equal(result[result.length - 1], 3); // Count of modes
      assert.ok(result.includes(1));
      assert.ok(result.includes(2));
      assert.ok(result.includes(3));
    });
  });

  describe('populationVariance', () => {
    test('should calculate population variance', () => {
      const result = populationVariance(2, 4, 6, 8, 10);
      assert.equal(result[0], 8);
    });

    test('should return 0 for identical values', () => {
      assert.deepEqual(populationVariance(5, 5, 5, 5), [0]);
    });

    test('should throw for empty stack', () => {
      assert.throws(() => populationVariance(), /stack length must be greater than 0/);
    });
  });

  describe('sampleVariance', () => {
    test('should calculate sample variance', () => {
      const result = sampleVariance(2, 4, 6, 8, 10);
      assert.equal(result[0], 10);
    });

    test('should return 0 for identical values', () => {
      assert.deepEqual(sampleVariance(5, 5, 5, 5), [0]);
    });

    test('should throw for single value', () => {
      assert.throws(() => sampleVariance(5), /stack length must be greater than 1/);
    });
  });

  describe('populationStandardDeviation', () => {
    test('should calculate population standard deviation', () => {
      const result = populationStandardDeviation(2, 4, 6, 8, 10);
      assert.ok(Math.abs(result[0] - 2.8284271247461903) < 0.0001);
    });

    test('should return 0 for identical values', () => {
      assert.deepEqual(populationStandardDeviation(5, 5, 5, 5), [0]);
    });
  });

  describe('sampleStandardDeviation', () => {
    test('should calculate sample standard deviation', () => {
      const result = sampleStandardDeviation(2, 4, 6, 8, 10);
      assert.ok(Math.abs(result[0] - 3.1622776601683795) < 0.0001);
    });

    test('should return 0 for identical values', () => {
      assert.deepEqual(sampleStandardDeviation(5, 5, 5, 5), [0]);
    });
  });

  describe('percentile', () => {
    test('should calculate 50th percentile (median)', () => {
      const percentile50 = percentile(0.5);
      assert.deepEqual(percentile50(1, 2, 3, 4, 5), [3]);
    });

    test('should calculate 25th percentile', () => {
      const percentile25 = percentile(0.25);
      assert.deepEqual(percentile25(1, 2, 3, 4, 5), [2]);
    });

    test('should calculate 75th percentile', () => {
      const percentile75 = percentile(0.75);
      assert.deepEqual(percentile75(1, 2, 3, 4, 5), [4]);
    });

    test('should handle interpolation', () => {
      const percentile30 = percentile(0.3);
      const result = percentile30(1, 2, 3, 4, 5);
      assert.ok(result[0] >= 2 && result[0] <= 3);
    });
  });

  describe('fiveNumberSummary', () => {
    test('should calculate five number summary', () => {
      const result = fiveNumberSummary(1, 2, 3, 4, 5, 6, 7, 8, 9);
      assert.equal(result[0], 1); // min
      assert.equal(result[1], 3); // Q1
      assert.equal(result[2], 5); // mean
      assert.equal(result[3], 7); // Q3
      assert.equal(result[4], 9); // max
    });
  });

  describe('fiveNumberSummaryB', () => {
    test('should calculate five number summary with outlier bounds', () => {
      const result = fiveNumberSummaryB(1, 2, 3, 4, 5, 6, 7, 8, 9);
      assert.equal(result.length, 14); // original 9 + 5 summary values
      // Check that last 5 values are the summary
      const summary = result.slice(-5);
      assert.ok(summary[0] < summary[1]); // min < Q1
      assert.ok(summary[1] < summary[2]); // Q1 < mean
      assert.ok(summary[2] < summary[3]); // mean < Q3
      assert.ok(summary[3] < summary[4]); // Q3 < max
    });
  });
});