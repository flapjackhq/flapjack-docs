---
title: Python Client
description: Use the Algolia Python client or plain HTTP with Flapjack.
---

You can use Flapjack from Python with the official Algolia client or with plain HTTP requests.

## Using requests (recommended)

The simplest approach — no Algolia SDK needed:

```bash
pip install requests
```

```python
import requests

FLAPJACK_URL = "http://localhost:7700"
HEADERS = {
    "X-Algolia-Application-Id": "flapjack",
    "X-Algolia-API-Key": "YOUR_ADMIN_KEY",
    "Content-Type": "application/json",
}

# Index documents
requests.post(
    f"{FLAPJACK_URL}/1/indexes/movies/batch",
    headers=HEADERS,
    json={
        "requests": [
            {"action": "addObject", "body": {"objectID": "1", "title": "The Matrix", "year": 1999}},
            {"action": "addObject", "body": {"objectID": "2", "title": "Inception", "year": 2010}},
        ]
    },
)

# Search
response = requests.post(
    f"{FLAPJACK_URL}/1/indexes/movies/query",
    headers=HEADERS,
    json={"query": "matrix"},
)

results = response.json()
for hit in results["hits"]:
    print(f"{hit['title']} ({hit['year']})")
```

## Using the Algolia Python client

```bash
pip install algoliasearch
```

```python
from algoliasearch.search.client import SearchClientSync
from algoliasearch.search.config import SearchConfig

config = SearchConfig(app_id="flapjack", api_key="YOUR_ADMIN_KEY")
client = SearchClientSync.create_with_config(config)

# Override hosts to point at Flapjack
# (The exact API depends on the algoliasearch version)

# Search
results = client.search_single_index(
    index_name="movies",
    search_params={"query": "matrix"},
)

for hit in results.hits:
    print(hit["title"])
```

## Async with httpx

```bash
pip install httpx
```

```python
import httpx
import asyncio

FLAPJACK_URL = "http://localhost:7700"
HEADERS = {
    "X-Algolia-Application-Id": "flapjack",
    "X-Algolia-API-Key": "YOUR_ADMIN_KEY",
    "Content-Type": "application/json",
}

async def search(query: str):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{FLAPJACK_URL}/1/indexes/movies/query",
            headers=HEADERS,
            json={"query": query},
        )
        return response.json()

results = asyncio.run(search("matrix"))
print(results["hits"])
```

## Bulk import script

A practical script for importing data from a JSON file:

```python
import json
import requests

FLAPJACK_URL = "http://localhost:7700"
HEADERS = {
    "X-Algolia-Application-Id": "flapjack",
    "X-Algolia-API-Key": "YOUR_ADMIN_KEY",
    "Content-Type": "application/json",
}
BATCH_SIZE = 1000

def import_data(index_name: str, file_path: str):
    with open(file_path) as f:
        records = json.load(f)

    for i in range(0, len(records), BATCH_SIZE):
        batch = records[i : i + BATCH_SIZE]
        requests.post(
            f"{FLAPJACK_URL}/1/indexes/{index_name}/batch",
            headers=HEADERS,
            json={
                "requests": [
                    {"action": "addObject", "body": record}
                    for record in batch
                ]
            },
        )
        print(f"Imported {min(i + BATCH_SIZE, len(records))}/{len(records)}")

# Usage
import_data("movies", "movies.json")
```
