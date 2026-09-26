# cbd-handbook

The team that owns the publishing convention. It publishes:

- `contracts/docs-frontmatter.json`: the JSON Schema every `docs/*.md` file in
  every repository must satisfy, generated from Zod in `src/`.
- `.github/workflows/check-docs.yml`: the reusable docs check TypeScript repos
  call from their CI. Python repos enforce the same schema with `jsonschema`.
- `docs/`: company policy, including [repository layout](docs/repository-layout.md).

```sh
pnpm install
pnpm run check        # Zod source and committed artifact agree
pnpm run check-docs   # this repo passes its own docs check
```

`zod` is pinned exactly because its output is the published artifact; a minor
bump can change the generated JSON Schema.

## The six repositories

| Repo | Role |
|---|---|
| [cbd-handbook](https://github.com/jagreehal/cbd-handbook) | Owns the convention: docs frontmatter schema, docs checker, company policy |
| [cbd-payments-service](https://github.com/jagreehal/cbd-payments-service) | TypeScript producer: OpenAPI + event JSON Schemas + runbook |
| [cbd-dashboard](https://github.com/jagreehal/cbd-dashboard) | TypeScript consumer: typed client generated from the pinned OpenAPI |
| [cbd-reporter](https://github.com/jagreehal/cbd-reporter) | Python consumer: validates events against the pinned JSON Schemas |
| [cbd-docs-site](https://github.com/jagreehal/cbd-docs-site) | Aggregator: [one docs index](https://jagreehal.github.io/cbd-docs-site/) over every enrolled repo |
| [cbd-catalog](https://github.com/jagreehal/cbd-catalog) | Aggregator: [EventCatalog](https://jagreehal.github.io/cbd-catalog/) over every enrolled repo |

No repository imports another's source. Consumers read committed artifacts
at pinned tags over HTTPS; aggregators discover publishers by the
`cbd-publisher` GitHub topic.
