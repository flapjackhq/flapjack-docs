---
title: Troubleshooting
description: Diagnose managed Flapjack Cloud and self-hosted Flapjack without mixing their endpoints or credentials.
---

Start by identifying your deployment model. Managed Cloud and self-hosted
Flapjack have different endpoint, authentication, and network owners.

## Managed Cloud connections

Tenant operations use `https://api.flapjack.foo` with the token returned by the
Cloud login flow. Browser search uses the separate managed HTTPS endpoint and
search-only key returned by Cloud after an index is ready.

### Connection or TLS failure

1. Confirm tenant calls use the exact hosted API origin with HTTPS.
2. For direct browser search, copy the endpoint from Cloud instead of deriving
   it. It must be a trusted HTTPS hostname with no explicit port.
3. Do not substitute a machine address, open a firewall rule, or downgrade the
   connection to plaintext.
4. If the managed endpoint has a different shape, stop and use the support path
   in the authenticated [Cloud console](https://cloud.flapjack.foo/console).

```js
const endpoint = new URL('YOUR_HTTPS_ENDPOINT');
if (endpoint.protocol !== 'https:' || endpoint.port) {
  throw new Error('Expected the managed Flapjack Cloud HTTPS origin');
}
```

### Invalid credential

- A tenant token belongs in `Authorization: Bearer ...` on hosted control-plane
  routes and must stay on a trusted server.
- A direct browser client needs a tenant-scoped, search-only key. Generate it
  through the [Cloud credential flow](/guides/flapjack-cloud/#browser-search-credentials).
- Do not reuse an Algolia source credential or a Cloud management credential in
  browser code.
- Copy the returned application ID and search index name; do not reconstruct
  tenant-scoped identifiers.

### InstantSearch does not render

Check the browser network panel and console:

- Requests must target the managed HTTPS origin returned by Cloud.
- The client must use the returned search-only key and application ID.
- The configured index name must match the search index name from Cloud.
- A `401` or `403` usually means the key is malformed, expired, revoked,
  under-scoped, or scoped to a different index.
- A network or certificate failure is not an authentication failure; do not
  work around it by weakening transport security.

## Self-hosted connections

The following checks apply only to a server you operate.

### Connection refused

**Symptom:** `ECONNREFUSED` or `Connection refused`.

1. Confirm Flapjack is running with `docker ps` or `systemctl status flapjack`.
2. Confirm the configured host and port match the server bind address.
3. For local development, keep the service on loopback unless you have
   deliberately configured a trusted reverse proxy and firewall.

```js
import { liteClient as algoliasearch } from 'algoliasearch/lite';

const client = algoliasearch('flapjack', 'YOUR_SEARCH_ONLY_KEY', {
  hosts: [{ url: 'localhost:7700', protocol: 'http', accept: 'read' }],
});
```

### Invalid API key

**Symptom:** `403 Forbidden` or `Invalid API key`.

- Confirm both `X-Algolia-Application-Id` and `X-Algolia-API-Key` are present.
- Use the administrator key only for trusted write operations.
- Use a restricted search-only key for browsers and other untrusted clients.

```bash
export SEARCH_KEY="<restricted-search-key>"

curl -X POST 'http://localhost:7700/1/indexes/movies/query' \
  -H 'X-Algolia-Application-Id: flapjack' \
  -H "X-Algolia-API-Key: $SEARCH_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"query":"matrix"}'
```

### TLS certificate errors

If you put self-hosted Flapjack behind nginx, Caddy, or another reverse proxy,
verify the certificate, hostname, and proxy target there. Direct loopback
development can use HTTP; an internet-facing deployment should use a trusted
HTTPS reverse proxy. Do not disable certificate validation in application code.

## Empty search results after import

An accepted batch can finish indexing asynchronously. Preserve the task
identifier when the response includes one and follow the route's task-completion
semantics before searching.

Also verify:

- every record has a stable `objectID`
- the query targets the destination index name, not the source name by accident
- settings required by filters and facets were applied successfully
- the credential is scoped to the destination index

Avoid fixed sleeps as a correctness mechanism. Poll a documented task or retry
a known query with a bounded backoff in your own migration tooling.

## Batch import errors

- **Missing `objectID`:** every record needs a stable identifier.
- **Oversized request:** reduce the batch size and retry from a recorded
  checkpoint instead of resubmitting the complete export.
- **Invalid JSON:** validate the full `requests[]` envelope before sending it.
- **Unsupported action or setting:** stop and compare the exact request with the
  [migration compatibility checklist](/migrate-from-algolia/#compatibility-checklist).

## Python client host override

Published client transports can change across major versions. Prefer direct
HTTP requests when your installed Python client does not expose a documented
custom-host API:

```python
import requests

flapjack_url = "http://localhost:7700"  # self-hosted loopback only
headers = {
    "X-Algolia-Application-Id": "flapjack",
    "X-Algolia-API-Key": "YOUR_SEARCH_ONLY_KEY",
}

response = requests.post(
    f"{flapjack_url}/1/indexes/movies/query",
    json={"query": "matrix"},
    headers=headers,
    timeout=10,
)
response.raise_for_status()
print(response.json()["hits"])
```

Managed Cloud Python code should use the hosted tenant routes described in the
[Cloud guide](/guides/flapjack-cloud/), not this self-hosted loopback example.

## Health check

For a self-hosted local server:

```bash
curl http://localhost:7700/health
```

A `200 OK` means the process is responding. It does not prove that a particular
index, credential, or search path works.

For managed Cloud, troubleshoot through the hosted tenant or search route you
actually use; do not probe an underlying machine.

## Public help

- Ask public usage questions in [Flapjack Q&A](https://github.com/flapjackhq/flapjack/discussions/categories/q-a).
- Report reproducible engine bugs in the [Flapjack issue tracker](https://github.com/flapjackhq/flapjack/issues).
- Propose corrections through the [public docs repository](https://github.com/flapjackhq/flapjack-docs/tree/main/src/content/docs).
- Report vulnerabilities only through the [security policy](https://github.com/flapjackhq/flapjack/security/policy), not a public issue or discussion.

Do not post credentials, customer data, private endpoints, or account details in
public channels. Use the support link maintained on the
[Cloud beta page](https://cloud.flapjack.foo/beta) for account or billing help.
