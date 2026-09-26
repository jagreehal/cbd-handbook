import { z } from 'zod';

// A doc is addressed by its path, never by a declared id:
// cbd-payments-service/docs/runbook.md    -> cbd-payments-service/runbook
// cbd-payments-service/docs/ops/replay.md -> cbd-payments-service/ops/replay
export const docId = /^[a-z0-9-]+(\/[a-z0-9-]+)+$/;

export const docsFrontmatterSchema = z.strictObject({
  title: z.string().min(1),
  owner: z.string().min(1),
  tags: z.array(z.string()).optional(),
  // Always fully qualified, including for a doc in the same repo. One form,
  // one regex, nothing to special-case at the aggregator.
  related: z.array(z.string().regex(docId)).optional(),
});

export type DocsFrontmatter = z.infer<typeof docsFrontmatterSchema>;
