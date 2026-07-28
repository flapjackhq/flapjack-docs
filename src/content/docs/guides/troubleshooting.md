---
title: Troubleshooting
description: Common issues and solutions when using Flapjack, especially when migrating from Algolia.
---

## Connection refused

**Symptom:** `ECONNREFUSED` or `Connection refused` when trying to reach Flapjack.

**Causes:**

1. **Flapjack isn't running.** Check with `docker ps` or `systemctl status flapjack`.
2. **Wrong port.** Flapjack defaults to port 7700. Make sure your client config matches.
3. **Wrong host.** If using Flapjack Cloud, use your instance's HTTPS endpoint (e.g., `https://1.2.3.4`), not `localhost`.
4. **Firewall blocking the port.** On cloud VMs, check that port 7700 is open in your security group or firewall rules.

```js
// Common mistake — missing protocol
const client = algoliasearch('flapjack', 'key', {
  hosts: [{ url: 'localhost:7700' }], // Missing protocol!
});

// Fix — always include protocol
const client = algoliasearch('flapjack', 'key', {
  hosts: [{ url: 'localhost:7700', protocol: 'http' }],
});
```

## Invalid API key

**Symptom:** `403 Forbidden` or `Invalid API key` error.

**Causes:**

1. **Wrong Application-Id.** Flapjack always uses `flapjack` as the Application-Id, not your Algolia App ID.
2. **Wrong key.** Use your Flapjack admin key, not your Algolia API key.
3. **Missing headers.** Both `X-Algolia-Application-Id` and `X-Algolia-API-Key` are required.

```bash
# Wrong — using Algolia credentials
curl -H 'X-Algolia-Application-Id: ABC123' ...

# Right — Application-Id is always "flapjack"
curl -H 'X-Algolia-Application-Id: flapjack' \
     -H 'X-Algolia-API-Key: YOUR_FLAPJACK_ADMIN_KEY' ...
```

## Empty search results after import

**Symptom:** Batch import returns `200 OK`, but search returns zero hits.

**Solution:** Batch operations are processed asynchronously. The API responds immediately with a `taskID`, but indexing happens in the background.

Wait a few seconds after import, then search again:

```bash
# Check if your index has records
curl -X POST 'http://localhost:7700/1/indexes/movies/query' \
  -H 'X-Algolia-Application-Id: flapjack' \
  -H 'X-Algolia-API-Key: YOUR_ADMIN_KEY' \
  -d '{"query": ""}'
```

An empty query (`""`) returns all records. If `nbHits` shows 0 and you just imported, wait 5-10 seconds and retry.

## SSL certificate errors

**Symptom:** `CERT_HAS_EXPIRED`, `UNABLE_TO_VERIFY_LEAF_SIGNATURE`, or SSL handshake failures.

**For Flapjack Cloud:** SSL certificates are provisioned automatically via Let's Encrypt. If you see certificate errors:

1. **Wait a minute.** Certificate provisioning happens during instance startup and takes 30-60 seconds.
2. **Check your endpoint URL.** Use the HTTPS URL shown in your dashboard, including the IP address.
3. **Don't use `http://`.** Flapjack Cloud endpoints require HTTPS.

**For self-hosted:** If you're running behind a reverse proxy (nginx, Caddy), make sure the proxy's certificate is valid. If connecting directly, either set `FLAPJACK_PUBLIC_IP` and `FLAPJACK_SSL_EMAIL` for automatic Let's Encrypt, or use `protocol: 'http'` for local development.

## InstantSearch widgets not rendering

**Symptom:** InstantSearch.js initializes but no search results appear, or widgets show loading forever.

**Common causes:**

1. **Host configuration.** The most common issue — the `hosts` array must include `protocol`:

```js
// This won't work
const client = algoliasearch('flapjack', 'key');

// This works
const client = algoliasearch('flapjack', 'key', {
  hosts: [{ url: 'your-host:7700', protocol: 'http' }],
});
```

2. **CORS errors.** If your frontend is on a different domain than Flapjack, check your browser console for CORS errors. For self-hosted Flapjack, configure your reverse proxy to add CORS headers. Flapjack Cloud handles CORS automatically.

3. **Wrong index name.** The `indexName` in your InstantSearch config must match exactly (case-sensitive) with the index you created in Flapjack.

## Batch import errors

**Symptom:** Batch API returns errors or partial failures.

**Common causes:**

1. **Missing `objectID`.** Every record must have an `objectID` field. Algolia exports include this automatically, but if you're importing from another source, add it:

```json
{"action": "addObject", "body": {"objectID": "1", "title": "My Record"}}
```

2. **Batch too large.** Keep batches under 1,000 records. Larger batches may time out or consume too much memory.

3. **Invalid JSON.** Check that your JSON is well-formed. A single invalid record can fail the entire batch.

## Python client host override

**Symptom:** The Algolia Python client ignores your custom host.

The official Algolia Python client doesn't have a clean public API for custom hosts. Use this pattern:

```python
from algoliasearch.search.client import SearchClientSync
from algoliasearch.search.config import SearchConfig
from algoliasearch.http.hosts import Host

client = SearchClientSync.create(
    app_id="flapjack",
    api_key="YOUR_ADMIN_KEY",
)
client._transporter._hosts = [Host("localhost", 7700, "http")]
```

Alternatively, use Python `requests` directly:

```python
import requests

FLAPJACK_URL = "http://localhost:7700"
HEADERS = {
    "X-Algolia-Application-Id": "flapjack",
    "X-Algolia-API-Key": "YOUR_ADMIN_KEY",
}

# Search
response = requests.post(
    f"{FLAPJACK_URL}/1/indexes/movies/query",
    json={"query": "matrix"},
    headers=HEADERS,
)
print(response.json()["hits"])
```

## Health check

To verify Flapjack is running and responsive:

```bash
curl http://localhost:7700/health
```

Returns `200 OK` when Flapjack is ready. Use this for monitoring, load balancer health checks, or debugging startup issues.
