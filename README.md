# cbd-handbook

The platform team owns the publishing convention here and publishes:

- `contracts/docs-frontmatter.json`, the JSON Schema for `docs/*.md` in any
  enrolled repository. Zod in `src/` generates it.
- `.github/workflows/check-docs.yml`, the docs check TypeScript repos call from
  their CI. Python repos enforce the same schema with `jsonschema`.
- `docs/`, company policy such as [repository layout](docs/repository-layout.md).

```sh
pnpm install
pnpm run check        # Zod source and committed artifact agree
pnpm run check-docs   # this repo passes its own docs check
```

We pin `zod` to one version. Its output is the published artifact, and zod 4.6
generates a different date-time pattern from 4.4.

## The six repositories

| Repo | Role |
|---|---|
| [cbd-handbook](https://github.com/jagreehal/cbd-handbook) | Owns the convention: docs frontmatter schema, docs check, company policy |
| [cbd-payments-service](https://github.com/jagreehal/cbd-payments-service) | TypeScript producer: OpenAPI, event JSON Schemas, runbook |
| [cbd-dashboard](https://github.com/jagreehal/cbd-dashboard) | TypeScript consumer: generates a typed client from the pinned OpenAPI |
| [cbd-reporter](https://github.com/jagreehal/cbd-reporter) | Python consumer: validates events against the pinned JSON Schemas |
| [cbd-docs-site](https://github.com/jagreehal/cbd-docs-site) | Aggregator: [docs index](https://jagreehal.github.io/cbd-docs-site/) over the enrolled repos |
| [cbd-catalog](https://github.com/jagreehal/cbd-catalog) | Aggregator: [EventCatalog](https://jagreehal.github.io/cbd-catalog/) over the enrolled repos |

Consumers fetch committed artifacts over HTTPS at a pinned tag. The
aggregators find publishers by the `cbd-publisher` GitHub topic.
