---
title: Index Management API
description: Endpoints for listing, deleting, and clearing indices.
---

## List indices

Get a list of all indices with their sizes and record counts.

```
GET /1/indexes
```

### Response

```json
{
  "items": [
    {
      "name": "movies",
      "entries": 1500,
      "dataSize": 2048000,
      "updatedAt": "2026-01-15T10:00:00Z"
    },
    {
      "name": "actors",
      "entries": 500,
      "dataSize": 512000,
      "updatedAt": "2026-01-14T08:30:00Z"
    }
  ]
}
```

### Example

```bash
curl 'http://localhost:7700/1/indexes' \
  -H 'X-Algolia-Application-Id: flapjack' \
  -H 'X-Algolia-API-Key: YOUR_ADMIN_KEY'
```

## Delete index

Permanently delete an index and all its records.

```
DELETE /1/indexes/{indexName}
```

### Response

```json
{
  "taskID": 12345,
  "deletedAt": "2026-01-15T10:00:00Z"
}
```

### Example

```bash
curl -X DELETE 'http://localhost:7700/1/indexes/movies' \
  -H 'X-Algolia-Application-Id: flapjack' \
  -H 'X-Algolia-API-Key: YOUR_ADMIN_KEY'
```

:::caution
This permanently deletes the index and all its records. This action cannot be undone.
:::

## Clear objects

Remove all records from an index while keeping the index configuration (settings) intact.

```
POST /1/indexes/{indexName}/clear
```

### Response

```json
{
  "taskID": 12345,
  "updatedAt": "2026-01-15T10:00:00Z"
}
```

### Example

```bash
curl -X POST 'http://localhost:7700/1/indexes/movies/clear' \
  -H 'X-Algolia-Application-Id: flapjack' \
  -H 'X-Algolia-API-Key: YOUR_ADMIN_KEY'
```
