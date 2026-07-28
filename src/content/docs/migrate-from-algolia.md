---
title: Migrate from Algolia
description: Switch from Algolia to Flapjack in under 5 minutes. Same API, same client libraries, same code.
---

Flapjack implements the Algolia REST API. Your existing code, client libraries, and InstantSearch.js setup work with Flapjack — you just change where requests are sent.

## What stays the same

- **API paths**: `/1/indexes/{indexName}/query`, `/1/indexes/{indexName}/batch`, etc.
- **Auth headers**: `X-Algolia-Application-Id` and `X-Algolia-API-Key`
- **Request format**: Same JSON bodies for search and indexing
- **Response format**: `hits`, `nbHits`, `processingTimeMS`, `query`, `params`
- **Client libraries**: The official `algoliasearch` JavaScript client works with Flapjack
- **InstantSearch.js**: Works out of the box with a custom host

## What's different

Flapjack is an Algolia-compatible search engine, not an Algolia clone. A few things work differently:

- **Application ID**: Always `flapjack`. Algolia uses a unique ID per project — Flapjack doesn't need one because each instance is dedicated to you.
- **Single admin key**: Flapjack uses one API key for all operations. Algolia has separate search-only and admin keys with configurable scopes. If you need read-only access, put Flapjack behind a proxy that strips write endpoints.
- **Ranking**: Flapjack uses [Tantivy](https://github.com/quickwit-oss/tantivy) (BM25-based) for relevance ranking. Results may differ from Algolia's tie-breaking algorithm, but `customRanking` and `searchableAttributes` work the same way.
- **No analytics**: Flapjack doesn't track search queries, click-through rates, or conversion events. If you need search analytics, log queries in your application layer.
- **No personalization or A/B testing**: These are Algolia SaaS-specific features that require a managed ML pipeline.

None of these differences affect your search code or InstantSearch widgets. They're operational details.

## Step 1: Start Flapjack

Self-hosted:

```bash
docker run -d -p 7700:7700 \
  -e FLAPJACK_ADMIN_KEY=your-secret-key \
  -v flapjack-data:/var/lib/flapjack \
  ghcr.io/flapjackhq/flapjack
```

Or use [Flapjack Cloud](/guides/flapjack-cloud/) for a managed instance.

## Step 2: Update your client configuration

### JavaScript (algoliasearch)

Before (Algolia):

```js
import algoliasearch from 'algoliasearch';

const client = algoliasearch('YOUR_APP_ID', 'YOUR_API_KEY');
const index = client.initIndex('movies');
```

After (Flapjack):

```js
import { liteClient as algoliasearch } from 'algoliasearch/lite';

const client = algoliasearch('flapjack', 'YOUR_FLAPJACK_ADMIN_KEY', {
  hosts: [{ url: 'localhost:7700', protocol: 'http' }],
});
```

That's it. One line changes: the host. All your `index.search()`, `index.saveObjects()`, and `index.getObject()` calls work the same way.

### InstantSearch.js

Before:

```js
const searchClient = algoliasearch('YOUR_APP_ID', 'YOUR_API_KEY');
```

After:

```js
const searchClient = algoliasearch('flapjack', 'YOUR_FLAPJACK_ADMIN_KEY', {
  hosts: [{ url: 'localhost:7700', protocol: 'http' }],
});
```

Everything else — `searchBox`, `hits`, `refinementList`, `pagination` — works unchanged. See the full [InstantSearch.js guide](/guides/instantsearch/).

### Python

```python
from algoliasearch.search.client import SearchClientSync

# Create client pointing at Flapjack instead of Algolia
client = SearchClientSync.create(
    app_id="flapjack",
    api_key="YOUR_FLAPJACK_ADMIN_KEY",
)
# Override the host
client._transporter._hosts = [Host("localhost", 7700, "http")]
```

### cURL

Just change the URL and credentials:

```bash
# Before (Algolia)
curl -X POST 'https://YOUR_APP_ID-dsn.algolia.net/1/indexes/movies/query' \
  -H 'X-Algolia-Application-Id: YOUR_APP_ID' \
  -H 'X-Algolia-API-Key: YOUR_API_KEY' \
  -d '{"query":"matrix"}'

# After (Flapjack)
curl -X POST 'http://localhost:7700/1/indexes/movies/query' \
  -H 'X-Algolia-Application-Id: flapjack' \
  -H 'X-Algolia-API-Key: YOUR_FLAPJACK_ADMIN_KEY' \
  -d '{"query":"matrix"}'
```

## Step 3: Export and import your data

### Export from Algolia

**Option A — Algolia Dashboard:**

1. Log into your [Algolia Dashboard](https://dashboard.algolia.com)
2. Go to **Search** → select your index
3. Click **Manage index** → **Export** → **Download JSON**
4. Save the file (e.g., `movies.json`)

**Option B — Algolia API (recommended for large datasets):**

```js
import algoliasearch from 'algoliasearch';

const client = algoliasearch('YOUR_ALGOLIA_APP_ID', 'YOUR_ALGOLIA_ADMIN_KEY');
const index = client.initIndex('movies');

// browseObjects fetches all records, handling pagination automatically
const records = [];
await index.browseObjects({
  batch: (batch) => records.push(...batch),
});

// Save to file
const fs = require('fs');
fs.writeFileSync('movies.json', JSON.stringify(records, null, 2));
console.log(`Exported ${records.length} records`);
```

### Import into Flapjack

Once you have your JSON export, send it to Flapjack using the batch API. Every record must have an `objectID` field (Algolia exports include this automatically).

```bash
# For small datasets (< 1,000 records) — send directly
curl -X POST 'http://localhost:7700/1/indexes/movies/batch' \
  -H 'X-Algolia-Application-Id: flapjack' \
  -H 'X-Algolia-API-Key: YOUR_FLAPJACK_ADMIN_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "requests": [
      {"action": "addObject", "body": {"objectID": "1", "title": "The Matrix", "year": 1999}},
      {"action": "addObject", "body": {"objectID": "2", "title": "Inception", "year": 2010}}
    ]
  }'
```

For larger datasets, use this script to batch the import:

```js
import { liteClient as algoliasearch } from 'algoliasearch/lite';
import fs from 'fs';

const client = algoliasearch('flapjack', 'YOUR_FLAPJACK_ADMIN_KEY', {
  hosts: [{ url: 'localhost:7700', protocol: 'http' }],
});

const records = JSON.parse(fs.readFileSync('movies.json', 'utf8'));
const BATCH_SIZE = 1000;

for (let i = 0; i < records.length; i += BATCH_SIZE) {
  const batch = records.slice(i, i + BATCH_SIZE);
  await client.batch('movies', {
    requests: batch.map((record) => ({
      action: 'addObject',
      body: record,
    })),
  });
  console.log(`Imported ${Math.min(i + BATCH_SIZE, records.length)} / ${records.length}`);
}
```

The batch API supports the same actions as Algolia: `addObject`, `updateObject`, `deleteObject`, `clear`.

:::tip
If you also use Algolia index settings (searchableAttributes, customRanking, etc.), export and import those too. See [Settings API](/api/settings/).
:::

## Step 4: Verify

Run a search to confirm your data imported correctly:

```bash
curl -X POST 'http://localhost:7700/1/indexes/movies/query' \
  -H 'X-Algolia-Application-Id: flapjack' \
  -H 'X-Algolia-API-Key: YOUR_FLAPJACK_ADMIN_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"query": "matrix"}'
```

You should see the same response format you're used to from Algolia:

```json
{
  "hits": [
    {
      "objectID": "1",
      "title": "The Matrix",
      "year": 1999,
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

**Verification checklist:**

- Record count matches: compare `nbHits` for an empty query (`""`) against your Algolia record count
- Highlighting works: check `_highlightResult` in responses
- Facets return: if you use faceted search, verify facet counts match
- InstantSearch renders: if you use InstantSearch.js, confirm widgets load and filter correctly

:::note
If you see zero results right after import, indexing may still be in progress. Batch imports are processed asynchronously — wait a few seconds and retry. See [Troubleshooting](/guides/troubleshooting/) for more help.
:::

## Compatibility reference

### Features

| Feature | Status |
|---------|--------|
| Search (`/1/indexes/{index}/query`) | Supported |
| Multi-index search (`/1/indexes/*/queries`) | Supported |
| Batch indexing (`/1/indexes/{index}/batch`) | Supported |
| Get/delete individual objects | Supported |
| Index settings (searchableAttributes, customRanking) | Supported |
| Highlighting and snippeting | Supported |
| Faceted search and facet counts | Supported |
| Filtering (numeric, string, boolean) | Supported |
| Pagination | Supported |
| Geo search | Planned |
| Synonyms | Planned |
| Query Rules | Planned |
| Analytics | Not planned |
| A/B Testing | Not planned |
| Personalization | Not planned |

### Search parameters

| Algolia Parameter | Flapjack | Notes |
|-------------------|----------|-------|
| `query` | Supported | Full-text search |
| `page` | Supported | 0-indexed pagination |
| `hitsPerPage` | Supported | Max 1000 |
| `attributesToRetrieve` | Supported | Filter returned fields |
| `attributesToHighlight` | Supported | Control highlighting |
| `highlightPreTag` / `highlightPostTag` | Supported | Custom highlight tags |
| `filters` | Supported | Algolia filter syntax |
| `facets` | Supported | Compute facet counts |
| `facetFilters` | Supported | Filter by facet value |
| `numericFilters` | Supported | Numeric range filters |
| `typoTolerance` | Implicit | Tantivy handles fuzzy matching automatically |
| `distinct` | Not yet | Deduplication planned |
| `getRankingInfo` | Not yet | Ranking debug info planned |
| `analytics` | No | Log queries in your app instead |
| `clickAnalytics` | No | No click tracking |
| `enablePersonalization` | No | No ML personalization |

Features marked "Not planned" are Algolia-specific SaaS features. Flapjack focuses on the core search functionality that the vast majority of Algolia customers actually use.

## Why migrate?

- **Cost**: Algolia bills per search operation and scales aggressively. Flapjack is free (self-hosted) or flat-fee (Cloud).
- **Data ownership**: Your data stays on your infrastructure. No vendor lock-in.
- **Simplicity**: Single binary, no cluster management, no configuration servers.
- **Open source**: MIT licensed. Audit, fork, modify, contribute.
