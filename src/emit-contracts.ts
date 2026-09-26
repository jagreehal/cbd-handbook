import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { docsFrontmatterSchema } from './docs-frontmatter.ts';

const contractsDir = fileURLToPath(new URL('../contracts', import.meta.url));

mkdirSync(contractsDir, { recursive: true });
writeFileSync(
  `${contractsDir}/docs-frontmatter.json`,
  JSON.stringify(z.toJSONSchema(docsFrontmatterSchema), null, 2) + '\n'
);

console.log('Wrote docs-frontmatter.json to contracts/');
