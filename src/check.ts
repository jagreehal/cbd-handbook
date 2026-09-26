// Fails when the Zod source drifts from the committed artifact. Same shape as
// cbd-payments-service/src/check.ts, because this repo is a producer
// like any other.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { docsFrontmatterSchema } from './docs-frontmatter.ts';

const contractsDir = fileURLToPath(new URL('../contracts', import.meta.url));
const committed = JSON.parse(readFileSync(`${contractsDir}/docs-frontmatter.json`, 'utf8'));

assert.deepEqual(
  committed,
  z.toJSONSchema(docsFrontmatterSchema),
  'docs-frontmatter.json is stale — run `pnpm run contracts` and commit'
);

// The artifact is what other repos read, so assert on the artifact, not the Zod
// source. z.fromJSONSchema is how every TypeScript consumer loads it.
const fromArtifact = z.fromJSONSchema(committed);
const valid = { title: 'Payments service runbook', owner: 'payments-platform', tags: ['runbook'] };

assert.equal(fromArtifact.safeParse(valid).success, true);
assert.equal(fromArtifact.safeParse({ owner: 'x' }).success, false, 'title must be required');
assert.equal(fromArtifact.safeParse({ title: 'x' }).success, false, 'owner must be required');
assert.equal(
  fromArtifact.safeParse({ ...valid, related: ['cbd-payments-service/runbook'] }).success,
  true
);
assert.equal(
  fromArtifact.safeParse({ ...valid, related: ['runbook'] }).success,
  false,
  'related must be fully qualified'
);
assert.equal(
  fromArtifact.safeParse({ ...valid, updated: '2026-07-31' }).success,
  false,
  'unknown fields must be rejected, or the convention drifts silently'
);

console.log('docs frontmatter contract in sync, artifact enforcing');
