---
title: Flapjack Cloud
description: Managed Flapjack hosting. Metered usage-based pricing with a free tier.
---

Flapjack Cloud runs Flapjack for you on AWS with no infrastructure to manage.
Sign up, create an index, and start searching — the same Algolia-compatible API
you get when self-hosting.

## Getting started

1. **Sign up** at [cloud.flapjack.foo](https://cloud.flapjack.foo) — no credit card required
2. **Verify your email** via the link we send you
3. **Create an index** from the console
4. **Copy your endpoint and admin key** from the console's Getting Started panel
5. **Start indexing** with the code snippets shown there

## Plans

Flapjack Cloud is metered — you are billed for what you store, not for a fixed
instance size.

| Plan | What you get | Cost |
|------|--------------|------|
| **Free** | Up to 3 indices, 100,000 records, 250 MB storage, and 50,000 searches/month | $0 — no credit card required |
| **Shared** | Everything above the free tier | Metered, $5/month minimum |

Beyond the free tier:

- **Storage** — $0.05 per MB per month
- **Cold storage** — $0.02 per GB per month

Prices are quoted in USD and exclusive of any applicable tax in your
jurisdiction.

## Regions

Storage rates are multiplied by a per-region factor:

| Region | Location | Multiplier |
|--------|----------|------------|
| `us-east-1` | US East (Virginia) | 1.00x |
| `eu-west-1` | EU West (Ireland) | 1.00x |
| `us-east-2` | US East (Ashburn) | 0.80x |
| `us-west-1` | US West (Oregon) | 0.80x |
| `eu-north-1` | EU North (Helsinki) | 0.75x |
| `eu-central-1` | EU Central (Germany) | 0.70x |

## Connecting to your instance

Your console shows the two values you need:

- **Endpoint** — the base URL for your instance
- **Admin key** — the API key for all operations

Use them exactly as shown in the console. Do not hardcode a host or scheme from
this page — your endpoint is specific to your instance.

### cURL

```bash
# Index a document
curl -X POST 'YOUR_ENDPOINT/1/indexes/movies/batch' \
  -H 'X-Algolia-Application-Id: flapjack' \
  -H 'X-Algolia-API-Key: YOUR_ADMIN_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"requests":[{"action":"addObject","body":{"objectID":"1","title":"The Matrix"}}]}'

# Search
curl -X POST 'YOUR_ENDPOINT/1/indexes/movies/query' \
  -H 'X-Algolia-Application-Id: flapjack' \
  -H 'X-Algolia-API-Key: YOUR_ADMIN_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"query":"matrix"}'
```

### JavaScript

```js
import { liteClient as algoliasearch } from 'algoliasearch/lite';

// Read the endpoint host and admin key from your console, then supply them as
// configuration rather than committing them to source.
const client = algoliasearch('flapjack', process.env.FLAPJACK_ADMIN_KEY, {
  hosts: [{ url: process.env.FLAPJACK_HOST }],
});
```

### InstantSearch.js

```js
import { liteClient as algoliasearch } from 'algoliasearch/lite';
import instantsearch from 'instantsearch.js';
import { searchBox, hits } from 'instantsearch.js/es/widgets';

const searchClient = algoliasearch('flapjack', process.env.FLAPJACK_ADMIN_KEY, {
  hosts: [{ url: process.env.FLAPJACK_HOST }],
});

const search = instantsearch({
  indexName: 'movies',
  searchClient,
});

search.addWidgets([
  searchBox({ container: '#searchbox' }),
  hits({ container: '#hits' }),
]);

search.start();
```

## Console features

The Flapjack Cloud console shows:

- **Indices** — create, browse, configure, and delete indices
- **Usage** — daily and monthly search requests, write operations, and storage
- **API keys** — your admin key and any preview keys you create
- **Billing** — current usage, estimated bill, invoices, and payment method
- **Logs** — recent API activity

## Billing

- Billed monthly against metered usage
- The free tier requires no payment method
- Add or update a card under **Billing → Payment method** in the console
- Invoices are listed under **Billing → Invoices**
- Manage your saved payment method through the Stripe customer portal, linked
  from the console
