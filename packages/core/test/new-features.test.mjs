import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  createJSON,
  createMap,
  createSet,
  readEnv
} from '../unsorted/index.mjs';
import { fibonacci } from '../sequences/index.mjs';

describe('JSON Operations', () => {
  test('should create JSON from key-value pairs', () => {
    const result = createJSON('name', 'jth', 'version', '0.2.0', 2);
    const parsed = JSON.parse(result[0]);
    assert.equal(parsed.name, 'jth');
    assert.equal(parsed.version, '0.2.0');
  });

  test('should handle single key-value pair', () => {
    const result = createJSON('key', 'value', 1);
    const parsed = JSON.parse(result[0]);
    assert.equal(parsed.key, 'value');
  });

  test('should handle numbers and booleans', () => {
    const result = createJSON('count', 42, 'active', true, 2);
    const parsed = JSON.parse(result[0]);
    assert.equal(parsed.count, 42);
    assert.equal(parsed.active, true);
  });

  test('should handle nested objects', () => {
    const nested = { inner: 'value' };
    const result = createJSON('outer', nested, 1);
    const parsed = JSON.parse(result[0]);
    assert.deepEqual(parsed.outer, { inner: 'value' });
  });

  test('should preserve other stack items', () => {
    const result = createJSON('extra', 'item', 'key', 'value', 1);
    assert.equal(result.length, 2);
    assert.equal(result[0], 'extra');
    const parsed = JSON.parse(result[1]);
    assert.equal(parsed.key, 'value');
  });
});

describe('Map Operations', () => {
  test('should create Map from key-value pairs', () => {
    const result = createMap('key1', 'value1', 'key2', 'value2', 2);
    assert.ok(result[0] instanceof Map);
    assert.equal(result[0].get('key1'), 'value1');
    assert.equal(result[0].get('key2'), 'value2');
  });

  test('should handle single entry', () => {
    const result = createMap('key', 'value', 1);
    assert.ok(result[0] instanceof Map);
    assert.equal(result[0].size, 1);
    assert.equal(result[0].get('key'), 'value');
  });

  test('should handle various data types as keys', () => {
    const obj = { id: 1 };
    const result = createMap(obj, 'object-key', 42, 'number-key', 2);
    assert.ok(result[0] instanceof Map);
    assert.equal(result[0].get(obj), 'object-key');
    assert.equal(result[0].get(42), 'number-key');
  });

  test('should preserve other stack items', () => {
    const result = createMap('extra', 'key', 'value', 1);
    assert.equal(result.length, 2);
    assert.equal(result[0], 'extra');
    assert.ok(result[1] instanceof Map);
  });
});

describe('Set Operations', () => {
  test('should create Set from items', () => {
    const result = createSet(1, 2, 3, 3);
    assert.ok(result[0] instanceof Set);
    assert.equal(result[0].size, 3);
    assert.ok(result[0].has(1));
    assert.ok(result[0].has(2));
    assert.ok(result[0].has(3));
  });

  test('should handle duplicates', () => {
    const result = createSet(1, 1, 2, 2, 3, 3);
    assert.ok(result[0] instanceof Set);
    assert.equal(result[0].size, 3);
  });

  test('should handle various data types', () => {
    const obj = { id: 1 };
    const result = createSet('string', 42, obj, true, null);
    assert.ok(result[0] instanceof Set);
    assert.equal(result[0].size, 5);
    assert.ok(result[0].has('string'));
    assert.ok(result[0].has(42));
    assert.ok(result[0].has(obj));
    assert.ok(result[0].has(true));
    assert.ok(result[0].has(null));
  });

  test('should handle empty set', () => {
    const result = createSet();
    assert.ok(result[0] instanceof Set);
    assert.equal(result[0].size, 0);
  });
});

describe('Environment Operations', () => {
  test('should read environment variable', () => {
    // Set a test env var
    process.env.JTH_TEST_VAR = 'test_value';
    
    const result = readEnv('JTH_TEST_VAR');
    assert.equal(result[0], 'test_value');
    
    // Clean up
    delete process.env.JTH_TEST_VAR;
  });

  test('should return undefined for missing env var', () => {
    const result = readEnv('NON_EXISTENT_VAR_12345');
    assert.equal(result[0], undefined);
  });

  test('should preserve other stack items', () => {
    process.env.JTH_TEST = 'value';
    
    const result = readEnv('other', 'items', 'JTH_TEST');
    assert.equal(result.length, 3);
    assert.equal(result[0], 'other');
    assert.equal(result[1], 'items');
    assert.equal(result[2], 'value');
    
    delete process.env.JTH_TEST;
  });
});

describe('Sequence Operations', () => {
  describe('fibonacci', () => {
    test('should generate next fibonacci number', () => {
      assert.deepEqual(fibonacci(0, 1), [0, 1, 1]);
      assert.deepEqual(fibonacci(1, 1), [1, 1, 2]);
      assert.deepEqual(fibonacci(1, 2), [1, 2, 3]);
      assert.deepEqual(fibonacci(2, 3), [2, 3, 5]);
      assert.deepEqual(fibonacci(3, 5), [3, 5, 8]);
    });

    test('should handle larger numbers', () => {
      assert.deepEqual(fibonacci(55, 89), [55, 89, 144]);
    });

    test('should work with negative numbers', () => {
      assert.deepEqual(fibonacci(-1, 1), [-1, 1, 0]);
    });
  });
});