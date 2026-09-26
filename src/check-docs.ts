// The docs check every publishing repository runs on its own docs/ in its own
// CI, so a bad doc fails the pull request that introduced it. TypeScript repos
// call it through .github/workflows/check-docs.yml. cbd-reporter enforces the
// same rules in Python without importing this file: the contract is the JSON
// Schema, not a shared library.
//
// Usage: node src/check-docs.ts <repo-dir> [repo-name]
import { globSync, readFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { parse } from 'yaml';
import { z } from 'zod';

const [dir = '.', repo = basename(resolve(dir))] = process.argv.slice(2);

const frontmatter = z.fromJSONSchema(
  JSON.parse(readFileSync(new URL('../contracts/docs-frontmatter.json', import.meta.url), 'utf8'))
);

// Published by cbd-docs-site on its last run. It is the only thing that can see
// other repositories. Before the first run there is nothing to check against.
const manifestUrl =
  process.env.DOCS_MANIFEST_URL ?? 'https://jagreehal.github.io/cbd-docs-site/contracts/docs-manifest.json';
const response = await fetch(manifestUrl);
const manifest: Record<string, { linkedFrom: string[] }> | null = response.ok ? await response.json() : null;

const docs = globSync('docs/**/*.md', { cwd: dir })
  .sort()
  .map((file) => ({
    file,
    id: `${repo}/${file.replace(/^docs\//, '').replace(/\.md$/, '')}`,
    text: readFileSync(join(dir, file), 'utf8'),
  }));
const present = new Set(docs.map((doc) => doc.id));
const failures: string[] = [];

for (const doc of docs) {
  // Frontmatter is YAML, so it is parsed by a YAML parser.
  const match = /^---\n(.*?)\n---\n/s.exec(doc.text);
  if (!match) {
    failures.push(`${doc.file}: no frontmatter`);
    continue;
  }
  const result = frontmatter.safeParse(parse(match[1]) ?? {});
  if (!result.success) {
    for (const issue of result.error.issues) {
      failures.push(`${doc.file}: ${issue.path.join('.') || '(root)'}: ${issue.message}`);
    }
    continue;
  }

  // A relative path that escapes the repo only resolves for someone with every
  // repo checked out as siblings. It is a dead link on GitHub and in any single
  // clone. Fenced blocks are excluded: docs teach this rule by showing it.
  const prose = doc.text.replace(/^```[\s\S]*?^```/gm, '');
  for (const [, link] of prose.matchAll(/]\((\.\.\/\.\.\/[^)]+)\)/g)) {
    failures.push(`${doc.file}: links into another repo by path (${link}) — use related: instead`);
  }

  // A stale manifest rejects a link that would have worked and never accepts
  // one that is broken, so publish the target first, then link to it.
  for (const target of (result.data as { related?: string[] }).related ?? []) {
    const dangling = target.startsWith(`${repo}/`)
      ? !present.has(target)
      : manifest !== null && !(target in manifest);
    if (dangling) failures.push(`${doc.file}: related '${target}' does not resolve`);
  }
}

// Renaming or deleting a doc breaks whoever links to it, and only the manifest
// records who that is.
for (const [id, entry] of Object.entries(manifest ?? {})) {
  if (id.startsWith(`${repo}/`) && !present.has(id) && entry.linkedFrom.length) {
    failures.push(`${id} no longer exists but is linked from ${entry.linkedFrom.join(', ')}`);
  }
}

for (const failure of failures) console.error(`✗ ${failure}`);
if (failures.length) process.exit(1);

const scope = manifest ? 'schema + links' : 'schema only, no manifest published yet';
console.log(`docs check passed: ${docs.length} doc(s) in ${repo} (${scope})`);
