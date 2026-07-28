---
title: cURL Examples
description: Interact with the Flapjack API using cURL.
---

Quick reference for all Flapjack API operations using cURL.

## Health check

```bash
curl http://localhost:7700/health
```

## Stats

```bash
curl http://localhost:7700/stats
```

## Index documents

```bash
curl -X POST 'http://localhost:7700/1/indexes/movies/batch' \
  -H 'X-Algolia-Application-Id: flapjack' \
  -H 'X-Algolia-API-Key: YOUR_ADMIN_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "requests": [
      {"action": "addObject", "body": {"objectID": "1", "title": "The Matrix", "year": 1999, "genre": "sci-fi"}},
      {"action": "addObject", "body": {"objectID": "2", "title": "Inception", "year": 2010, "genre": "sci-fi"}},
      {"action": "addObject", "body": {"objectID": "3", "title": "The Godfather", "year": 1972, "genre": "crime"}}
    ]
  }'
```

## Search

```bash
curl -X POST 'http://localhost:7700/1/indexes/movies/query' \
  -H 'X-Algolia-Application-Id: flapjack' \
  -H 'X-Algolia-API-Key: YOUR_ADMIN_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"query": "matrix"}'
```

## Search with options

```bash
curl -X POST 'http://localhost:7700/1/indexes/movies/query' \
  -H 'X-Algolia-Application-Id: flapjack' \
  -H 'X-Algolia-API-Key: YOUR_ADMIN_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "query": "sci-fi",
    "hitsPerPage": 5,
    "page": 0,
    "attributesToHighlight": ["title", "genre"],
    "facets": ["genre", "year"]
  }'
```

## Multi-index search

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

## Get a single object

```bash
curl 'http://localhost:7700/1/indexes/movies/1' \
  -H 'X-Algolia-Application-Id: flapjack' \
  -H 'X-Algolia-API-Key: YOUR_ADMIN_KEY'
```

## Update an object

```bash
curl -X PUT 'http://localhost:7700/1/indexes/movies/1' \
  -H 'X-Algolia-Application-Id: flapjack' \
  -H 'X-Algolia-API-Key: YOUR_ADMIN_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"title": "The Matrix", "year": 1999, "genre": "sci-fi", "rating": 8.7}'
```

## Delete an object

```bash
curl -X DELETE 'http://localhost:7700/1/indexes/movies/1' \
  -H 'X-Algolia-Application-Id: flapjack' \
  -H 'X-Algolia-API-Key: YOUR_ADMIN_KEY'
```

## List indices

```bash
curl 'http://localhost:7700/1/indexes' \
  -H 'X-Algolia-Application-Id: flapjack' \
  -H 'X-Algolia-API-Key: YOUR_ADMIN_KEY'
```

## Delete an index

```bash
curl -X DELETE 'http://localhost:7700/1/indexes/movies' \
  -H 'X-Algolia-Application-Id: flapjack' \
  -H 'X-Algolia-API-Key: YOUR_ADMIN_KEY'
```

## Clear all objects from an index

```bash
curl -X POST 'http://localhost:7700/1/indexes/movies/clear' \
  -H 'X-Algolia-Application-Id: flapjack' \
  -H 'X-Algolia-API-Key: YOUR_ADMIN_KEY'
```

## Get index settings

```bash
curl 'http://localhost:7700/1/indexes/movies/settings' \
  -H 'X-Algolia-Application-Id: flapjack' \
  -H 'X-Algolia-API-Key: YOUR_ADMIN_KEY'
```

## Update index settings

```bash
curl -X PUT 'http://localhost:7700/1/indexes/movies/settings' \
  -H 'X-Algolia-Application-Id: flapjack' \
  -H 'X-Algolia-API-Key: YOUR_ADMIN_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "searchableAttributes": ["title", "description"],
    "attributesForFaceting": ["genre", "year"],
    "customRanking": ["desc(popularity)"]
  }'
```

## Import from a JSON file

```bash
# Assuming movies.json contains an array of objects with objectID fields
cat movies.json | jq -c '{requests: [.[] | {action: "addObject", body: .}]}' | \
  curl -X POST 'http://localhost:7700/1/indexes/movies/batch' \
    -H 'X-Algolia-Application-Id: flapjack' \
    -H 'X-Algolia-API-Key: YOUR_ADMIN_KEY' \
    -H 'Content-Type: application/json' \
    -d @-
```
