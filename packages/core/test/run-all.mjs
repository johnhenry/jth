#!/usr/bin/env node

import { run } from 'node:test';
import { spec } from 'node:test/reporters';
import process from 'node:process';

// Run all test files
run({
  files: [
    './packages/core/test/core.test.mjs',
    './packages/core/test/math.test.mjs',
    './packages/core/test/data-structures.test.mjs',
    './packages/core/test/statistics.test.mjs',
    './packages/core/test/new-features.test.mjs'
  ],
  concurrency: true
})
  .compose(spec)
  .pipe(process.stdout);