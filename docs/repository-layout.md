---
title: Repository layout
owner: platform
tags: [conventions, docs, contracts]
---

# Repository layout

Every repository that publishes something other teams consume puts it at the
same two paths.

```text
any-repo/
  contracts/          generated, committed, language-neutral
    openapi.json
    events/*.json
  docs/               authored, committed, frontmatter-validated
    *.md
```

A consumer reads one file, at a tag you published. It does not import your
source, match your language, or join your release cycle:

```text
https://raw.githubusercontent.com/jagreehal/cbd-payments-service/v1.0.0/contracts/openapi.json
```

## Enrolling a repository

Add the `cbd-publisher` topic to the repository on GitHub. That is the whole
step. `cbd-docs-site` and `cbd-catalog` list every repository with the topic on
each build and read its `docs/` and `contracts/`. No central file names you, and
no aggregator team has to approve you.

## Documentation frontmatter

Every file under `docs/` opens with frontmatter validated against
`cbd-handbook/contracts/docs-frontmatter.json`:

```yaml
---
title: Payments service runbook
owner: payments-platform
tags: [runbook, payments]
related: [cbd-dashboard/reading-the-contract]
---
```

| Field | Required | Notes |
|---|---|---|
| `title` | yes | What the aggregated index shows |
| `owner` | yes | The team to ask. Free-form |
| `tags` | no | Strings |
| `related` | no | Fully qualified doc ids |

Unknown fields fail the check. A convention that tolerates extra keys stops
being one.

## How a document is addressed

By its path, never by a declared id.

```text
cbd-payments-service/docs/runbook.md      ->  cbd-payments-service/runbook
cbd-payments-service/docs/ops/replay.md   ->  cbd-payments-service/ops/replay
```

Nothing to write and nothing to keep in sync. The cost is that renaming a file
breaks anyone linking to it, which is why the manifest below exists.

`related` is always fully qualified, including for a document in the same
repository. One form, one regular expression, no special cases at the
aggregator. Links to anything outside the convention stay ordinary markdown in
the body, where nothing pretends to validate them.

## Never write a path into another repository

This is the rule people break first.

```markdown
See [the payments runbook](../../cbd-payments-service/docs/runbook.md)   ✗
See [the runbook](runbook.md)                                        ✓ same repo
```

That relative path only resolves if someone happens to have both repositories
checked out as siblings. On GitHub it is a dead link. In a clone of one
repository it is a dead link. It quietly assumes a monorepo, which is the thing
we decided not to have.

Inside your own repository, link relatively. Across repositories, name the other
document in your prose and declare the edge in `related`. The aggregated site
turns those declarations into working links, and the check tells you when one
stops resolving.

That asymmetry is doing something useful. A cross-repository reference is a
dependency, so it costs a line of frontmatter and shows up in the manifest. A
link to your own file is free. The convention makes the expensive thing look
expensive.

## What is not a field

**Freshness.** `git log` knows when a document last changed, and the aggregator
reads it at build time. A hand-maintained `updated:` is the first thing to rot,
and a stale one is worse than none.

**Status.** Same reasoning. A document marked `current` by someone who left in
2023 is the failure this convention exists to prevent, not a feature.

## Validating your own documents

Each repository checks its own `docs/` in its own CI, beside whatever contract
check it already runs. A malformed document fails your pull request, not
somebody else's nightly build.

TypeScript repositories call the check this repository publishes:

```yaml
jobs:
  docs:
    uses: jagreehal/cbd-handbook/.github/workflows/check-docs.yml@v1.0.0
    with:
      handbook-ref: v1.0.0
```

It loads the artifact with `z.fromJSONSchema`. Python repositories load the same
file with `jsonschema`. Neither imports the Zod source in this repository,
because a shared package would exclude the Python consumer and couple our
releases. See `check_docs.py` in `cbd-reporter`, which enforces the same rules
without sharing a line of code.

## The manifest, and the two-step publish

`cbd-docs-site` publishes
[`contracts/docs-manifest.json`](https://jagreehal.github.io/cbd-docs-site/contracts/docs-manifest.json)
on every run: every document id, its owner, and the documents linking to it.

```json
{
  "cbd-payments-service/runbook": {
    "owner": "payments-platform",
    "linkedFrom": ["cbd-dashboard/reading-the-contract", "cbd-reporter/validating-events-in-python"]
  }
}
```

Your check reads it to answer two questions your repository cannot answer
alone: do my `related` links resolve, and is anyone linking to the file I am
about to rename?

The manifest lags by one aggregation run, so publishing a document and linking
to it from another repository takes two steps. Publish first, wait for the
manifest, then link. That is the same expand-then-contract discipline the
contracts half already asks for, and the failure direction is safe: a stale
manifest rejects a link that would have worked and never accepts one that is
broken.

## Aggregators do not publish

`cbd-catalog` and `cbd-docs-site` read the convention without honouring it. Neither
has a `docs/` directory. Publishing is for repositories that own something
another team needs, and a rule every repository must satisfy is a tax.

## The agent story, honestly

`cbd-docs-site` emits `llms.txt` because it costs a fifteen-line endpoint over data
the site already holds, and because it is generated rather than authored, so it
cannot disagree with the documents it lists.

Do not expect assistants to read it. In the largest published measurement we
know of, Evil Martians logged roughly 268,000 agent requests over two months and
saw 37 `llms.txt` fetches from named AI assistants. No vendor documents an agent
that reads one.

Raw markdown is the part with evidence behind it. In that same dataset Claude
Code asked for markdown on 76% of its 23,300 reads, using `Accept: text/markdown`
rather than a `.md` URL. A static site cannot negotiate content, so every page
is also published at `<url>.md` and that is the version an agent should fetch.

`llms-full.txt` is not part of the specification. Mintlify and
`starlight-llms-txt` popularised it separately. Do not cite it as one.
