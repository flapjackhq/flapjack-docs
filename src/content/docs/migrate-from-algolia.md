---
title: Migrate from Algolia
description: Plan, execute, and verify a bounded migration from Algolia to managed or self-hosted Flapjack.
---

Flapjack implements a substantial Algolia-compatible search surface, but a
migration is not only a hostname change. Export your source data and
configuration, test the features your application actually uses, and keep a
rollback path until production verification is complete.

## What stays familiar

- Core search and batch-indexing request shapes use Algolia-style `/1/` paths
  on a self-hosted Flapjack server.
- Algolia authentication header names are accepted by the direct Flapjack data
  plane.
- Search responses use familiar fields such as `hits`, `nbHits`, `page`, and
  `hitsPerPage`.
- The current JavaScript v5 lite client and tested InstantSearch widgets can use
  a custom Flapjack host with a restricted search key.

Compatibility is scoped to the routes and behaviors you verify; it is not a
promise that every Algolia endpoint, option, SDK transport, or dashboard
workflow is present.

## What's different

- **Deployment and credentials:** managed Cloud uses tenant-scoped control-plane
  routes for trusted operations and a separate tenant-scoped, search-only key for
  browsers. Self-hosted Flapjack uses credentials created by the engine owner.
- **Index identity:** managed Cloud can use an internal tenant-scoped index name
  at the direct search endpoint. Copy the endpoint, application ID, and index
  name from the Cloud flow instead of constructing them.
- **Ranking and settings:** Flapjack and Algolia do not have identical ranking
  implementations. Settings may be accepted, translated, approximated, or
  unsupported, so compare result order as well as response shape.
- **Migration fidelity:** records alone do not cover settings, synonyms, rules,
  replicas, analytics history, personalization, or operational workflows.
  Inventory each dependency and treat unverified behavior as a cutover blocker.
- **Asynchronous work:** indexing and migration operations can complete after
  the initial response. Poll or retry only according to the route's documented
  task semantics; do not assume a successful submission means data is searchable.

## Managed Cloud migration

Use the hosted tenant API at `https://api.flapjack.foo`. Keep the tenant token
and the Algolia source credential on a trusted server.

1. Review [current Cloud access](https://cloud.flapjack.foo/beta) and create the
   destination index using a region offered by the console.
2. Export records and configuration from Algolia using its current supported
   tools.
3. Import records through `POST /indexes/{name}/batch` with the tenant token.
4. Apply only destination settings you have confirmed Flapjack supports.
5. Generate a search-only credential and take the managed HTTPS endpoint and
   search index name from Cloud.
6. Run the verification checklist below before changing production traffic.

```bash
export API_BASE_URL="https://api.flapjack.foo"
export INDEX_NAME="products"
export AUTH_TOKEN="<tenant-token-from-login>"

curl -X POST "$API_BASE_URL/indexes/$INDEX_NAME/batch" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "requests": [
      {"action":"addObject","body":{"objectID":"1","name":"Espresso"}}
    ]
  }'

curl -X POST "$API_BASE_URL/indexes/$INDEX_NAME/search" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"query":"espresso"}'
```

Do not put the tenant token or the Algolia source credential in a browser. The
[Cloud guide](/guides/flapjack-cloud/) owns the least-privilege browser search
flow.

## Self-hosted migration

Run the standalone server locally or behind infrastructure you operate:

```bash
docker run -d -p 127.0.0.1:7700:7700 \
  -e FLAPJACK_ADMIN_KEY=your-secret-key \
  -v flapjack-data:/var/lib/flapjack \
  ghcr.io/flapjackhq/flapjack
```

Use the local administrator key only from a trusted system. Create a restricted
search-only key before connecting browser clients.

```bash
curl -X POST 'http://localhost:7700/1/indexes/products/batch' \
  -H 'X-Algolia-Application-Id: flapjack' \
  -H 'X-Algolia-API-Key: your-secret-key' \
  -H 'Content-Type: application/json' \
  -d '{
    "requests": [
      {"action":"addObject","body":{"objectID":"1","name":"Espresso"}}
    ]
  }'
```

## Export from Algolia

Use [Algolia's current export guidance](https://www.algolia.com/doc/guides/sending-and-managing-data/manage-indices-and-apps/manage-indices/how-to/export-import-indices)
rather than relying on an old dashboard path or client version. Export these as
separate, versioned artifacts:

- records, including every `objectID`
- settings
- synonyms
- rules
- an inventory of replicas and application-side dependencies

Algolia's current CLI can browse records to newline-delimited JSON:

```bash
algolia objects browse YOUR_INDEX > records.ndjson
algolia settings get YOUR_INDEX > settings.json
algolia rules browse YOUR_INDEX > rules.ndjson
algolia synonyms browse YOUR_INDEX > synonyms.ndjson
```

Keep source credentials out of shell history, logs, retained migration output,
and client-side code.

## Import records in bounded batches

Convert exported records to the `requests[]` batch envelope and keep each
request small enough to retry safely. Every record must have a stable
`objectID`.

```json
{
  "requests": [
    {"action":"addObject","body":{"objectID":"1","name":"Espresso"}},
    {"action":"addObject","body":{"objectID":"2","name":"Filter coffee"}}
  ]
}
```

Do not infer that an accepted Algolia setting has identical semantics. Apply
settings in a test index first, record warnings or rejected fields, and compare
known-answer queries before continuing.

## Compatibility checklist

Build a representative test set from production traffic and verify at least:

| Area | What to compare |
| --- | --- |
| Querying | exact matches, typo tolerance, empty queries, pagination |
| Ranking | ordered object IDs for known queries and tie cases |
| Filtering | numeric, string, boolean, facet, and compound filters you use |
| Faceting | facet values, counts, searchable facets, refinements |
| Rendering | highlighting, snippets, missing attributes, escaping |
| Indexing | add, update, delete, idempotent retries, task completion |
| Configuration | searchable attributes, custom ranking, synonyms, rules |
| Clients | exact JavaScript/InstantSearch versions and widgets in production |

Features outside your tested set remain unverified even if their request shape
looks familiar.

## Verification checklist

- Compare record counts and a stable sample of object IDs.
- Compare settings, synonyms, rules, and replica dispositions field by field.
- Run known-answer queries and compare ordered results, not only `nbHits`.
- Exercise every production filter, facet, pagination, and highlighting path.
- Verify restricted browser credentials cannot write or access another index.
- Rehearse the cutover and rollback with writes frozen or otherwise reconciled.
- Keep Algolia available until Flapjack has passed your observation window.

If a check differs, decide whether the difference is acceptable before
cutover. Do not hide it behind a generic compatibility claim.
