---
title: Indexing API
description: Endpoints for adding, updating, and deleting records in your indices.
---

## Batch

Perform multiple indexing operations in a single request. This is the most efficient way to index data.

```
POST /1/indexes/{indexName}/batch
```

### Request body

```json
{
  "requests": [
    {
      "action": "addObject",
      "body": {
        "objectID": "1",
        "title": "The Matrix",
        "year": 1999
      }
    },
    {
      "action": "addObject",
      "body": {
        "objectID": "2",
        "title": "Inception",
        "year": 2010
      }
    }
  ]
}
```

### Actions

| Action | Description |
|--------|-------------|
| `addObject` | Add a record (or replace if `objectID` exists) |
| `updateObject` | Fully replace an existing record |
| `partialUpdateObject` | Update specific attributes of an existing record |
| `deleteObject` | Delete a record by `objectID` |
| `clear` | Remove all records from the index |

### Response

```json
{
  "taskID": 12345,
  "objectIDs": ["1", "2"]
}
```

### Example

```bash
curl -X POST 'http://localhost:7700/1/indexes/movies/batch' \
  -H 'X-Algolia-Application-Id: flapjack' \
  -H 'X-Algolia-API-Key: YOUR_ADMIN_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "requests": [
      {"action": "addObject", "body": {"objectID": "1", "title": "The Matrix", "year": 1999}},
      {"action": "addObject", "body": {"objectID": "2", "title": "Inception", "year": 2010}}
    ]
  }'
```

:::tip
For large imports, send documents in batches of 1,000 records. This balances throughput and memory usage.
:::

## Add object

Add a single record to an index. If you don't provide an `objectID`, one is generated automatically.

```
POST /1/indexes/{indexName}
```

### Request body

```json
{
  "title": "The Matrix",
  "year": 1999,
  "genre": "sci-fi"
}
```

### Response

```json
{
  "taskID": 12345,
  "objectID": "auto-generated-id"
}
```

## Update object

Fully replace an existing record.

```
PUT /1/indexes/{indexName}/{objectID}
```

### Request body

```json
{
  "title": "The Matrix Reloaded",
  "year": 2003,
  "genre": "sci-fi"
}
```

### Response

```json
{
  "taskID": 12345,
  "objectID": "1",
  "updatedAt": "2026-01-15T10:00:00Z"
}
```

## Get object

Retrieve a single record by its `objectID`.

```
GET /1/indexes/{indexName}/{objectID}
```

### Response

```json
{
  "objectID": "1",
  "title": "The Matrix",
  "year": 1999,
  "genre": "sci-fi"
}
```

### Example

```bash
curl 'http://localhost:7700/1/indexes/movies/1' \
  -H 'X-Algolia-Application-Id: flapjack' \
  -H 'X-Algolia-API-Key: YOUR_ADMIN_KEY'
```

## Delete object

Delete a single record by its `objectID`.

```
DELETE /1/indexes/{indexName}/{objectID}
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
curl -X DELETE 'http://localhost:7700/1/indexes/movies/1' \
  -H 'X-Algolia-Application-Id: flapjack' \
  -H 'X-Algolia-API-Key: YOUR_ADMIN_KEY'
```
