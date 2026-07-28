---
title: InstantSearch.js
description: Build a search UI with Algolia's InstantSearch.js library, powered by Flapjack.
---

[InstantSearch.js](https://www.algolia.com/doc/guides/building-search-ui/what-is-instantsearch/js/) is Algolia's open-source UI library for building search experiences. It works with Flapjack out of the box — just point the client at your Flapjack instance.

## Install

```bash
npm install algoliasearch instantsearch.js
```

## Basic setup

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/instantsearch.css@8/themes/satellite-min.css" />
</head>
<body>
  <div id="searchbox"></div>
  <div id="hits"></div>

  <script type="module">
    import { liteClient as algoliasearch } from 'algoliasearch/lite';
    import instantsearch from 'instantsearch.js';
    import { searchBox, hits } from 'instantsearch.js/es/widgets';

    // Point the Algolia client at your Flapjack instance
    const searchClient = algoliasearch('flapjack', 'YOUR_ADMIN_KEY', {
      hosts: [{ url: 'localhost:7700', protocol: 'http' }],
    });

    const search = instantsearch({
      indexName: 'movies',
      searchClient,
    });

    search.addWidgets([
      searchBox({ container: '#searchbox' }),
      hits({
        container: '#hits',
        templates: {
          item: (hit, { html, components }) => html`
            <article>
              <h3>${components.Highlight({ hit, attribute: 'title' })}</h3>
              <p>${hit.year}</p>
            </article>
          `,
        },
      }),
    ]);

    search.start();
  </script>
</body>
</html>
```

## For Flapjack Cloud

If you're using Flapjack Cloud, use your instance endpoint:

```js
const searchClient = algoliasearch('flapjack', 'YOUR_ADMIN_KEY', {
  hosts: [{ url: 'YOUR_INSTANCE_IP:7700', protocol: 'https' }],
});
```

Your instance IP and admin key are shown in the Flapjack Cloud dashboard after provisioning.

## Supported widgets

All standard InstantSearch.js widgets work with Flapjack:

| Widget | Description |
|--------|-------------|
| `searchBox` | Text input for queries |
| `hits` | Display search results |
| `highlight` | Highlighted matching text |
| `snippet` | Truncated highlighted text |
| `pagination` | Page navigation |
| `hitsPerPage` | Results per page selector |
| `stats` | Result count and timing |
| `refinementList` | Faceted filtering |
| `menu` | Single-select facet filter |
| `currentRefinements` | Active filter display |
| `clearRefinements` | Clear all filters |
| `sortBy` | Sort order selector |
| `rangeSlider` | Numeric range filter |

## React InstantSearch

The React version works the same way:

```bash
npm install algoliasearch react-instantsearch
```

```jsx
import { liteClient as algoliasearch } from 'algoliasearch/lite';
import { InstantSearch, SearchBox, Hits } from 'react-instantsearch';

const searchClient = algoliasearch('flapjack', 'YOUR_ADMIN_KEY', {
  hosts: [{ url: 'localhost:7700', protocol: 'http' }],
});

function App() {
  return (
    <InstantSearch indexName="movies" searchClient={searchClient}>
      <SearchBox />
      <Hits hitComponent={Hit} />
    </InstantSearch>
  );
}

function Hit({ hit }) {
  return (
    <article>
      <h3>{hit.title}</h3>
      <p>{hit.year}</p>
    </article>
  );
}
```

## Vue InstantSearch

```bash
npm install algoliasearch vue-instantsearch
```

```vue
<template>
  <ais-instant-search :search-client="searchClient" index-name="movies">
    <ais-search-box />
    <ais-hits>
      <template v-slot:item="{ item }">
        <h3>{{ item.title }}</h3>
        <p>{{ item.year }}</p>
      </template>
    </ais-hits>
  </ais-instant-search>
</template>

<script setup>
import { liteClient as algoliasearch } from 'algoliasearch/lite';

const searchClient = algoliasearch('flapjack', 'YOUR_ADMIN_KEY', {
  hosts: [{ url: 'localhost:7700', protocol: 'http' }],
});
</script>
```

## Migrating an existing InstantSearch setup

If you already have InstantSearch.js working with Algolia, migration is one line:

```diff
- const searchClient = algoliasearch('YOUR_APP_ID', 'YOUR_SEARCH_KEY');
+ const searchClient = algoliasearch('flapjack', 'YOUR_ADMIN_KEY', {
+   hosts: [{ url: 'your-flapjack-host:7700', protocol: 'https' }],
+ });
```

Everything else stays the same. Your widgets, templates, and styling all work unchanged.
