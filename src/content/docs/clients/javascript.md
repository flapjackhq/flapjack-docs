---
title: JavaScript Client
description: Use the official Algolia JavaScript client with Flapjack.
---

Flapjack works with the official `algoliasearch` JavaScript client. You just change the host configuration.

## Install

```bash
npm install algoliasearch
```

## Setup

```js
import { liteClient as algoliasearch } from 'algoliasearch/lite';

const client = algoliasearch('flapjack', 'YOUR_ADMIN_KEY', {
  hosts: [{ url: 'localhost:7700', protocol: 'http' }],
});
```

For Flapjack Cloud:

```js
const client = algoliasearch('flapjack', 'YOUR_ADMIN_KEY', {
  hosts: [{ url: 'YOUR_IP:7700', protocol: 'https' }],
});
```

## Search

```js
const results = await client.search({
  requests: [
    {
      indexName: 'movies',
      query: 'matrix',
      hitsPerPage: 10,
    },
  ],
});

console.log(results.results[0].hits);
```

## Index documents

```js
import algoliasearch from 'algoliasearch';

const client = algoliasearch('flapjack', 'YOUR_ADMIN_KEY', {
  hosts: [{ url: 'localhost:7700', protocol: 'http' }],
});

// Add objects
await client.saveObjects({
  indexName: 'movies',
  objects: [
    { objectID: '1', title: 'The Matrix', year: 1999 },
    { objectID: '2', title: 'Inception', year: 2010 },
  ],
});
```

## Batch operations

```js
await client.batch({
  indexName: 'movies',
  batchWriteParams: {
    requests: [
      { action: 'addObject', body: { objectID: '1', title: 'The Matrix' } },
      { action: 'deleteObject', body: { objectID: '99' } },
    ],
  },
});
```

## Search with filters

```js
const results = await client.search({
  requests: [
    {
      indexName: 'movies',
      query: 'action',
      filters: 'year > 2000',
      facets: ['genre'],
    },
  ],
});
```

## Get an object

```js
const movie = await client.getObject({
  indexName: 'movies',
  objectID: '1',
});
```

## Delete an object

```js
await client.deleteObject({
  indexName: 'movies',
  objectID: '1',
});
```

## TypeScript

The `algoliasearch` package includes full TypeScript types. No additional `@types` package needed.

```ts
import { liteClient as algoliasearch } from 'algoliasearch/lite';
import type { SearchResponse } from 'algoliasearch';

interface Movie {
  objectID: string;
  title: string;
  year: number;
  genre: string;
}

const client = algoliasearch('flapjack', 'YOUR_ADMIN_KEY', {
  hosts: [{ url: 'localhost:7700', protocol: 'http' }],
});

const results = await client.search<Movie>({
  requests: [{ indexName: 'movies', query: 'matrix' }],
});
```

## Node.js

The same client works in Node.js:

```js
import algoliasearch from 'algoliasearch';

const client = algoliasearch('flapjack', 'YOUR_ADMIN_KEY', {
  hosts: [{ url: 'localhost:7700', protocol: 'http' }],
});

// Full client (search + indexing)
await client.saveObjects({
  indexName: 'movies',
  objects: [
    { objectID: '1', title: 'The Matrix', year: 1999 },
  ],
});

const results = await client.search({
  requests: [{ indexName: 'movies', query: 'matrix' }],
});
```

:::note
Use `algoliasearch/lite` for browser bundles (search only, smaller size). Use `algoliasearch` for Node.js or when you need indexing operations.
:::
