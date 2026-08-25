---
title: Getting Started
description: Run your first search with managed Flapjack Cloud or a self-hosted Flapjack server.
---

Flapjack is an open-source search engine with an Algolia-compatible API. Choose
the deployment model you are using before copying an example: managed Cloud and
self-hosted Flapjack have different endpoints and credentials.

## Managed Cloud

Flapjack Cloud tenant operations use the hosted control plane at
`https://api.flapjack.foo`. Current access requirements are maintained on the
[Cloud beta page](https://cloud.flapjack.foo/beta); current prices and limits
are maintained on the [Cloud pricing page](https://cloud.flapjack.foo/pricing).

After following the current access instructions, sign in and keep the returned
tenant token on a trusted server:

```bash
export API_BASE_URL="https://api.flapjack.foo"
export INDEX_NAME="movies"

curl -X POST "$API_BASE_URL/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"you@example.com","password":"replace-with-your-password"}'

export AUTH_TOKEN="<token-from-login-response>"
```

Create an index using a region offered by your Cloud console:

```bash
curl -X POST "$API_BASE_URL/indexes" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"name":"movies","region":"<region-from-console>"}'
```

Index and search through the tenant-scoped routes:

```bash
curl -X POST "$API_BASE_URL/indexes/$INDEX_NAME/batch" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "requests": [
      {"action":"addObject","body":{"objectID":"1","title":"The Matrix","year":1999}}
    ]
  }'

curl -X POST "$API_BASE_URL/indexes/$INDEX_NAME/search" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"query":"matrix"}'
```

For browser search, generate a tenant-scoped, search-only credential and use the
managed HTTPS endpoint returned by Cloud. See the
[Flapjack Cloud guide](/guides/flapjack-cloud/) for that flow. Do not put the
tenant token in browser code.

## Self-hosted

For local development, run Flapjack on loopback with an administrator secret:

```bash
docker run -d -p 127.0.0.1:7700:7700 \
  -e FLAPJACK_ADMIN_KEY=your-secret-key \
  -v flapjack-data:/var/lib/flapjack \
  ghcr.io/flapjackhq/flapjack
```

Or install the binary with the official installer:

```bash
curl -fsSL https://install.flapjack.foo | sh
FLAPJACK_ADMIN_KEY=your-secret-key flapjack --data-dir ./data --bind-addr 127.0.0.1:7700
```

To pin a specific version, pass the version to the installer. Check the
[Flapjack releases](https://github.com/flapjackhq/flapjack/releases) for the
current version instead of copying a version number from this guide.

Verify the local server:

```bash
curl http://localhost:7700/health
```

Index and search locally:

```bash
curl -X POST 'http://localhost:7700/1/indexes/movies/batch' \
  -H 'X-Algolia-Application-Id: flapjack' \
  -H 'X-Algolia-API-Key: your-secret-key' \
  -H 'Content-Type: application/json' \
  -d '{"requests":[{"action":"addObject","body":{"objectID":"1","title":"The Matrix"}}]}'

curl -X POST 'http://localhost:7700/1/indexes/movies/query' \
  -H 'X-Algolia-Application-Id: flapjack' \
  -H 'X-Algolia-API-Key: your-secret-key' \
  -H 'Content-Type: application/json' \
  -d '{"query":"matrix"}'
```

Keep the administrator secret on trusted systems. Create a restricted,
search-only key before connecting a browser or other untrusted client.

## Next steps

- [Migrate from Algolia](/migrate-from-algolia/) — plan and verify a bounded migration
- [Use the JavaScript client](/clients/javascript/) — choose the correct managed or self-hosted setup
- [Self-hosting guide](/guides/self-hosting/) — configure a standalone deployment
- [Troubleshooting](/guides/troubleshooting/) — diagnose managed and self-hosted connections
