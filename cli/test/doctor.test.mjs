import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { doctorProject } from '../src/doctor.mjs';

const testRoot = dirname(fileURLToPath(import.meta.url));
const fixtures = join(testRoot, 'fixtures');
const cliPath = resolve(testRoot, '../src/cli.mjs');

function treeHash(root) {
  const hash = createHash('sha256');

  function visit(directory) {
    const entries = readdirSync(directory, { withFileTypes: true })
      .sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      const path = join(directory, entry.name);
      hash.update(entry.name);
      if (entry.isDirectory()) visit(path);
      else hash.update(readFileSync(path));
    }
  }

  visit(root);
  return hash.digest('hex');
}

test('current fixture passes without diagnostics', () => {
  const result = doctorProject(join(fixtures, 'current'));
  assert.equal(result.status, 'pass');
  assert.deepEqual(result.summary, { errors: 0, warnings: 0 });
});

test('legacy request ledger passes with a stable warning', () => {
  const result = doctorProject(join(fixtures, 'legacy'));
  assert.equal(result.status, 'pass');
  assert.deepEqual(result.diagnostics.map((item) => item.ruleId), ['SDDD002']);
});

test('broken fixture reports the expected rule families', () => {
  const result = doctorProject(join(fixtures, 'broken'));
  const ruleIds = new Set(result.diagnostics.map((item) => item.ruleId));
  assert.equal(result.status, 'fail');
  for (const ruleId of ['SDDD101', 'SDDD201', 'SDDD202', 'SDDD301']) {
    assert.equal(ruleIds.has(ruleId), true, `${ruleId} was not reported`);
  }
});

test('doctor is read-only', () => {
  const root = join(fixtures, 'current');
  const before = treeHash(root);
  doctorProject(root);
  const after = treeHash(root);
  assert.equal(after, before);
});

test('CLI emits JSON and stable exit codes', () => {
  const current = spawnSync(process.execPath, [cliPath, 'doctor', join(fixtures, 'current'), '--format', 'json'], { encoding: 'utf8' });
  assert.equal(current.status, 0, current.stderr);
  assert.equal(JSON.parse(current.stdout).status, 'pass');

  const broken = spawnSync(process.execPath, [cliPath, 'doctor', join(fixtures, 'broken'), '--format=json'], { encoding: 'utf8' });
  assert.equal(broken.status, 1, broken.stderr);
  assert.equal(JSON.parse(broken.stdout).status, 'fail');
});
