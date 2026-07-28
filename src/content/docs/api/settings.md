---
title: Settings API
description: Endpoints for configuring index settings like searchable attributes, ranking, and faceting.
---

## Get settings

Retrieve the current settings for an index.

```
GET /1/indexes/{indexName}/settings
```

### Response

```json
{
  "searchableAttributes": ["title", "description"],
  "attributesForFaceting": ["genre", "year"],
  "ranking": [
    "typo",
    "geo",
    "words",
    "filters",
    "proximity",
    "attribute",
    "exact",
    "custom"
  ],
  "customRanking": ["desc(popularity)"],
  "hitsPerPage": 20,
  "highlightPreTag": "<em>",
  "highlightPostTag": "</em>"
}
```

### Example

```bash
curl 'http://localhost:7700/1/indexes/movies/settings' \
  -H 'X-Algolia-Application-Id: flapjack' \
  -H 'X-Algolia-API-Key: YOUR_ADMIN_KEY'
```

## Update settings

Change the settings for an index. Settings not specified in the request remain unchanged.

```
PUT /1/indexes/{indexName}/settings
```

### Request body

```json
{
  "searchableAttributes": ["title", "description", "tags"],
  "attributesForFaceting": ["genre", "year", "rating"],
  "customRanking": ["desc(popularity)", "asc(title)"],
  "hitsPerPage": 10
}
```

### Available settings

#### Search

| Setting | Type | Description |
|---------|------|-------------|
| `searchableAttributes` | string[] | Attributes used for text search, in order of priority |
| `attributesToRetrieve` | string[] | Default attributes to include in search results |
| `unretrievableAttributes` | string[] | Attributes that can be used for search but won't be returned |

#### Faceting

| Setting | Type | Description |
|---------|------|-------------|
| `attributesForFaceting` | string[] | Attributes available for faceted search |
| `maxFacetHits` | integer | Max number of facet values returned per facet |
| `sortFacetValuesBy` | string | `"count"` or `"alpha"` |

#### Ranking

| Setting | Type | Description |
|---------|------|-------------|
| `ranking` | string[] | Ordered list of ranking criteria |
| `customRanking` | string[] | Custom attributes for ranking (e.g., `"desc(popularity)"`) |

#### Highlighting

| Setting | Type | Description |
|---------|------|-------------|
| `attributesToHighlight` | string[] | Attributes to highlight by default |
| `attributesToSnippet` | string[] | Attributes to snippet (e.g., `"description:50"`) |
| `highlightPreTag` | string | Opening tag for highlights (default: `"<em>"`) |
| `highlightPostTag` | string | Closing tag for highlights (default: `"</em>"`) |

#### Pagination

| Setting | Type | Description |
|---------|------|-------------|
| `hitsPerPage` | integer | Default results per page (default: 20, max: 1000) |
| `paginationLimitedTo` | integer | Maximum number of retrievable hits (default: 1000) |

### Response

```json
{
  "taskID": 12345,
  "updatedAt": "2026-01-15T10:00:00Z"
}
```

### Example

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

:::tip
Set `searchableAttributes` to control which fields are searched and in what priority order. The first attribute in the list has the highest priority.
:::
