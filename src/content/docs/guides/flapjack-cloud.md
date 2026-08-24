---
title: Flapjack Cloud
description: Connect safely to managed Flapjack Cloud with hosted tenant routes and scoped credentials.
---

Flapjack Cloud operates Flapjack on managed infrastructure. It exposes a
hosted control plane for tenant operations and a separate managed search
endpoint for browser clients. Self-hosted loopback examples elsewhere in these
docs do not describe Cloud networking or credentials.

## Current access, pricing, and limits

Use these product-owned pages for access, pricing, and limit facts that can
change:

- [Current access details](https://cloud.flapjack.foo/beta)
- [Current prices and limits](https://cloud.flapjack.foo/pricing)
- [Cloud console](https://cloud.flapjack.foo/console)

This guide deliberately does not copy plan prices, quotas, regions, or support
targets from those owners.

## Tenant operations

The public Cloud control-plane origin is:

```bash
export API_BASE_URL="https://api.flapjack.foo"
```

Sign in after following the current access instructions and keep the returned
tenant token on a trusted server:

```bash
curl -X POST "$API_BASE_URL/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"you@example.com","password":"replace-with-your-password"}'

export AUTH_TOKEN="<token-from-login-response>"
```

Create an index with a region currently offered by the console:

```bash
export INDEX_NAME="movies"

curl -X POST "$API_BASE_URL/indexes" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"name":"movies","region":"<region-from-console>"}'
```

Writes and trusted-server searches use tenant-scoped routes:

```bash
curl -X POST "$API_BASE_URL/indexes/$INDEX_NAME/batch" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"requests":[{"action":"addObject","body":{"objectID":"1","title":"The Matrix"}}]}'

curl -X POST "$API_BASE_URL/indexes/$INDEX_NAME/search" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"query":"matrix"}'
```

Do not ship the tenant token in a web or mobile application.

## Browser search credentials

After an index is ready, request a search-only credential with the tenant token
from a trusted server:

```bash
curl -X POST "$API_BASE_URL/onboarding/credentials" \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

The response provides `endpoint`, `api_key`, and `application_id`. The key is
restricted to search and browse for the tenant's indexes. Use the endpoint
exactly as returned only when it is a trusted HTTPS hostname with no explicit
port. Never replace it with an instance address. If Cloud returns any other
shape, stop and use the support link maintained on the
[Cloud beta page](https://cloud.flapjack.foo/beta).

```js
import { liteClient as algoliasearch } from 'algoliasearch/lite';

const endpoint = new URL('YOUR_HTTPS_ENDPOINT');
if (endpoint.protocol !== 'https:' || endpoint.port) {
  throw new Error('Flapjack Cloud search requires the managed HTTPS origin');
}

const applicationId = 'YOUR_APPLICATION_ID';
const searchClient = algoliasearch(applicationId, 'YOUR_SEARCH_ONLY_KEY', {
  hosts: [{ url: endpoint.host, protocol: 'https', accept: 'readWrite' }],
  baseHeaders: {
    Authorization: 'Bearer YOUR_SEARCH_ONLY_KEY',
  },
});
```

Treat this key as public but least-privilege: keep it search-only and scoped to
the required indexes. Use tenant routes from a trusted server for indexing,
settings, key management, billing, and account operations.

## Compatibility boundary

Flapjack implements a useful Algolia-compatible search surface, not every
Algolia product or workflow. Ranking, supported parameters, migration fidelity,
credential handling, and operational behavior can differ. Evaluate your exact
queries and widgets before cutover; the [migration guide](/migrate-from-algolia/)
lists the required checks.
