---
title: JavaScript Client
description: Configure the Algolia JavaScript v5 client safely for managed Cloud or self-hosted Flapjack.
---

Flapjack supports the current Algolia JavaScript v5 client for a tested subset
of search and indexing operations. Select the setup for your deployment model;
managed Cloud and self-hosted credentials are not interchangeable.

## Install

```bash
npm install algoliasearch
```

## Managed Cloud

Browser code must use the lite client with the tenant-scoped, search-only key
and managed HTTPS endpoint returned by Cloud. Generate those values from a trusted
server through the [Cloud credential flow](/guides/flapjack-cloud/#browser-search-credentials).

```js
import { liteClient as algoliasearch } from 'algoliasearch/lite';

const endpoint = new URL('YOUR_HTTPS_ENDPOINT');
if (endpoint.protocol !== 'https:' || endpoint.port) {
  throw new Error('Expected the managed Flapjack Cloud HTTPS origin');
}

const applicationId = 'YOUR_APPLICATION_ID';
const searchClient = algoliasearch(applicationId, 'YOUR_SEARCH_ONLY_KEY', {
  hosts: [{ url: endpoint.host, protocol: 'https', accept: 'readWrite' }],
  baseHeaders: {
    Authorization: 'Bearer YOUR_SEARCH_ONLY_KEY',
  },
});
```

Use the hosted tenant routes at `https://api.flapjack.foo` from a trusted server
for writes and other tenant operations. Do not ship the tenant token in a
browser bundle, and do not construct a host from a machine address.

## Self-hosted

For local browser search, create a restricted search-only key and point the lite
client at your loopback server:

```js
import { liteClient as algoliasearch } from 'algoliasearch/lite';

const searchClient = algoliasearch('flapjack', 'YOUR_SEARCH_ONLY_KEY', {
  hosts: [{ url: 'localhost:7700', protocol: 'http', accept: 'read' }],
});
```

Trusted server-side code can use the full client with the self-hosted
administrator key:

```js
import { algoliasearch } from 'algoliasearch';

const writeClient = algoliasearch('flapjack', process.env.FLAPJACK_ADMIN_KEY, {
  hosts: [{ url: 'localhost:7700', protocol: 'http', accept: 'readWrite' }],
});
```

Never include the administrator key in browser code, client-side environment
variables, source control, logs, or error reports.

## Search

The v5 lite client accepts multi-index requests:

```js
const results = await searchClient.search({
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

Use the exact search index name returned by managed Cloud. A customer-facing
name and an internal tenant-scoped search name are not necessarily identical.

## Index documents on a self-hosted server

This example is for the trusted `writeClient` created in the self-hosted section:

```js
await writeClient.saveObjects({
  indexName: 'movies',
  objects: [
    { objectID: '1', title: 'The Matrix', year: 1999 },
    { objectID: '2', title: 'Inception', year: 2010 },
  ],
});
```

Managed Cloud indexing uses the tenant-scoped batch route shown in the
[Cloud guide](/guides/flapjack-cloud/#tenant-operations).

## Batch operations on a self-hosted server

```js
await writeClient.batch({
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
const results = await searchClient.search({
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

## TypeScript

The package includes TypeScript types:

```ts
import { liteClient as algoliasearch } from 'algoliasearch/lite';

interface Movie {
  objectID: string;
  title: string;
  year: number;
}

const searchClient = algoliasearch('flapjack', 'YOUR_SEARCH_ONLY_KEY', {
  hosts: [{ url: 'localhost:7700', protocol: 'http', accept: 'read' }],
});

const results = await searchClient.search<Movie>({
  requests: [{ indexName: 'movies', query: 'matrix' }],
});
```

The host in this TypeScript sample is self-hosted loopback. Managed browser code
must use the managed setup above.

## Compatibility boundary

Client construction and familiar method names do not prove full Algolia
behavior. Verify the exact client version, methods, query parameters, widgets,
ranking, and response fields your application uses. See the
[migration compatibility checklist](/migrate-from-algolia/#compatibility-checklist).
