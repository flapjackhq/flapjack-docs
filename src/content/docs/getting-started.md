---
title: Getting Started
description: Get Flapjack running and index your first documents in under a minute.
---

Flapjack is an open-source search engine with an Algolia-compatible API. This guide gets you from zero to searching in under a minute.

## Quick start with Docker

```bash
docker run -d -p 7700:7700 \
  -e FLAPJACK_ADMIN_KEY=your-secret-key \
  -v flapjack-data:/var/lib/flapjack \
  ghcr.io/flapjackhq/flapjack
```

Or install the binary with the official installer, which detects your platform
and downloads the matching release archive:

```bash
curl -fsSL https://install.flapjack.foo | sh
FLAPJACK_ADMIN_KEY=your-secret-key flapjack --data-dir ./data --bind-addr 0.0.0.0:7700
```

To pin a specific version, pass it to the installer:
`curl -fsSL https://install.flapjack.foo | sh -s -- v1.0.10`.

## Verify it's running

```bash
curl http://localhost:7700/health
```

You should see a `200 OK` response.

## Index some documents

```bash
curl -X POST 'http://localhost:7700/1/indexes/movies/batch' \
  -H 'X-Algolia-Application-Id: flapjack' \
  -H 'X-Algolia-API-Key: your-secret-key' \
  -H 'Content-Type: application/json' \
  -d '{
    "requests": [
      {"action": "addObject", "body": {"objectID": "1", "title": "The Matrix", "year": 1999, "genre": "sci-fi"}},
      {"action": "addObject", "body": {"objectID": "2", "title": "Inception", "year": 2010, "genre": "sci-fi"}},
      {"action": "addObject", "body": {"objectID": "3", "title": "The Godfather", "year": 1972, "genre": "crime"}}
    ]
  }'
```

## Search

```bash
curl -X POST 'http://localhost:7700/1/indexes/movies/query' \
  -H 'X-Algolia-Application-Id: flapjack' \
  -H 'X-Algolia-API-Key: your-secret-key' \
  -H 'Content-Type: application/json' \
  -d '{"query": "matrix"}'
```

Response:

```json
{
  "hits": [
    {
      "objectID": "1",
      "title": "The Matrix",
      "year": 1999,
      "genre": "sci-fi",
      "_highlightResult": {
        "title": {
          "value": "The <em>Matrix</em>",
          "matchLevel": "full"
        }
      }
    }
  ],
  "nbHits": 1,
  "page": 0,
  "hitsPerPage": 20,
  "processingTimeMS": 0,
  "query": "matrix"
}
```

## Next steps

- [Migrate from Algolia](/migrate-from-algolia/) — Switch from Algolia in under 5 minutes
- [Use with InstantSearch.js](/guides/instantsearch/) — Build a search UI with Algolia's frontend library
- [API Reference](/api/overview/) — Full documentation of all endpoints
- [Flapjack Cloud](/guides/flapjack-cloud/) — Managed hosting, no ops required
