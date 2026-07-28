---
title: API Overview
description: Flapjack REST API reference. Algolia-compatible endpoints for search, indexing, and management.
---

Flapjack exposes an Algolia-compatible REST API. If you've used Algolia's API, you already know Flapjack's API.

## Base URL

- **Self-hosted**: `http://localhost:7700` (or your configured address)
- **Flapjack Cloud**: `https://<your-ip>:7700` (shown in dashboard)

## Authentication

All write and search endpoints require two headers:

```
X-Algolia-Application-Id: flapjack
X-Algolia-API-Key: YOUR_ADMIN_KEY
```

The application ID is always `flapjack`. The API key is the admin key you configured (self-hosted) or the one shown in your dashboard (Cloud).

**Unauthenticated endpoints**: `/health` and `/stats` do not require auth headers.

## Endpoints

### Health & Stats

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/health` | No | Health check |
| `GET` | `/stats` | No | Database size stats |

### Search

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/1/indexes/{indexName}/query` | Yes | [Search an index](/api/search/) |
| `POST` | `/1/indexes/*/queries` | Yes | [Search multiple indices](/api/search/#multi-index-search) |

### Indexing

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/1/indexes/{indexName}/batch` | Yes | [Batch operations](/api/indexing/#batch) |
| `POST` | `/1/indexes/{indexName}` | Yes | [Add object](/api/indexing/#add-object) |
| `PUT` | `/1/indexes/{indexName}/{objectID}` | Yes | [Update object](/api/indexing/#update-object) |
| `DELETE` | `/1/indexes/{indexName}/{objectID}` | Yes | [Delete object](/api/indexing/#delete-object) |
| `GET` | `/1/indexes/{indexName}/{objectID}` | Yes | [Get object](/api/indexing/#get-object) |

### Index Management

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/1/indexes` | Yes | [List indices](/api/index-management/#list-indices) |
| `DELETE` | `/1/indexes/{indexName}` | Yes | [Delete index](/api/index-management/#delete-index) |
| `POST` | `/1/indexes/{indexName}/clear` | Yes | [Clear objects](/api/index-management/#clear-objects) |

### Settings

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/1/indexes/{indexName}/settings` | Yes | [Get settings](/api/settings/#get-settings) |
| `PUT` | `/1/indexes/{indexName}/settings` | Yes | [Update settings](/api/settings/#update-settings) |

## Response format

All endpoints return JSON. Search responses follow the Algolia format:

```json
{
  "hits": [...],
  "nbHits": 100,
  "page": 0,
  "hitsPerPage": 20,
  "nbPages": 5,
  "processingTimeMS": 1,
  "query": "search term"
}
```

Write operations return:

```json
{
  "taskID": 12345,
  "objectIDs": ["id1", "id2"]
}
```

## Error responses

Errors return appropriate HTTP status codes with a JSON body:

```json
{
  "message": "Description of the error",
  "status": 400
}
```

| Status | Meaning |
|--------|---------|
| 400 | Bad request (invalid JSON, missing fields) |
| 401 | Unauthorized (missing or invalid API key) |
| 404 | Index or object not found |
| 500 | Internal server error |
