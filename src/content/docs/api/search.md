---
title: Search API
description: Search endpoints for querying single or multiple indices.
---

## Search an index

Search for records in a single index.

```
POST /1/indexes/{indexName}/query
```

### Request body

```json
{
  "query": "search term",
  "page": 0,
  "hitsPerPage": 20,
  "attributesToRetrieve": ["title", "year"],
  "attributesToHighlight": ["title"],
  "filters": "year > 2000",
  "facets": ["genre"]
}
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `query` | string | `""` | Search query text |
| `page` | integer | `0` | Page number (0-indexed) |
| `hitsPerPage` | integer | `20` | Number of results per page (max 1000) |
| `attributesToRetrieve` | string[] | `["*"]` | Attributes to include in results |
| `attributesToHighlight` | string[] | `["*"]` | Attributes to highlight matching text |
| `highlightPreTag` | string | `"<em>"` | HTML tag before highlighted text |
| `highlightPostTag` | string | `"</em>"` | HTML tag after highlighted text |
| `filters` | string | — | Filter expression (Algolia filter syntax) |
| `facets` | string[] | — | Facets to compute counts for |
| `facetFilters` | array | — | Facet-based filtering |
| `numericFilters` | array | — | Numeric filtering |

### Response

```json
{
  "hits": [
    {
      "objectID": "1",
      "title": "The Matrix",
      "year": 1999,
      "_highlightResult": {
        "title": {
          "value": "The <em>Matrix</em>",
          "matchLevel": "full",
          "matchedWords": ["matrix"],
          "fullyHighlighted": false
        }
      }
    }
  ],
  "nbHits": 1,
  "page": 0,
  "hitsPerPage": 20,
  "nbPages": 1,
  "processingTimeMS": 0,
  "query": "matrix",
  "params": "query=matrix",
  "facets": {
    "genre": {
      "sci-fi": 1
    }
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `hits` | array | Array of matching records |
| `hits[].objectID` | string | Unique record identifier |
| `hits[]._highlightResult` | object | Highlighted attributes |
| `nbHits` | integer | Total number of matching records |
| `page` | integer | Current page number |
| `hitsPerPage` | integer | Results per page |
| `nbPages` | integer | Total number of pages |
| `processingTimeMS` | integer | Server-side processing time in milliseconds |
| `query` | string | The query that was searched |
| `params` | string | URL-encoded search parameters |
| `facets` | object | Facet counts (if `facets` was requested) |

### Example

```bash
curl -X POST 'http://localhost:7700/1/indexes/movies/query' \
  -H 'X-Algolia-Application-Id: flapjack' \
  -H 'X-Algolia-API-Key: YOUR_ADMIN_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "query": "matrix",
    "hitsPerPage": 5,
    "attributesToHighlight": ["title"],
    "facets": ["genre"]
  }'
```

## Multi-index search

Search across multiple indices in a single request. This is the endpoint that InstantSearch.js uses internally.

```
POST /1/indexes/*/queries
```

### Request body

```json
{
  "requests": [
    {
      "indexName": "movies",
      "query": "matrix",
      "hitsPerPage": 5
    },
    {
      "indexName": "actors",
      "query": "keanu"
    }
  ],
  "strategy": "none"
}
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `requests` | array | Array of search requests |
| `requests[].indexName` | string | Index to search |
| `requests[].query` | string | Search query |
| `requests[].*` | — | All single-index search parameters are supported |
| `strategy` | string | `"none"` (run all) or `"stopIfEnoughMatches"` (stop early) |

### Response

```json
{
  "results": [
    {
      "hits": [...],
      "nbHits": 1,
      "page": 0,
      "hitsPerPage": 20,
      "processingTimeMS": 0,
      "query": "matrix",
      "index": "movies"
    },
    {
      "hits": [...],
      "nbHits": 3,
      "page": 0,
      "hitsPerPage": 20,
      "processingTimeMS": 0,
      "query": "keanu",
      "index": "actors"
    }
  ]
}
```

### Example

```bash
curl -X POST 'http://localhost:7700/1/indexes/*/queries' \
  -H 'X-Algolia-Application-Id: flapjack' \
  -H 'X-Algolia-API-Key: YOUR_ADMIN_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "requests": [
      {"indexName": "movies", "query": "matrix"},
      {"indexName": "actors", "query": "keanu"}
    ]
  }'
```
