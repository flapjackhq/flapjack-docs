import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'

/**
 * Serves /llms.txt — a token-efficient index of every docs page for AI agents.
 *
 * Both comparable products ship this (Meilisearch at /docs/llms.txt, Typesense
 * at /docs/llms.txt), and agents increasingly look for it by convention before
 * crawling HTML.
 *
 * Hand-rolled rather than using `starlight-llms-txt`: that plugin requires
 * Starlight >=0.41 and Astro ^7, while this site is on Starlight 0.37 / Astro 5.
 * Upgrading two majors for an index file is a worse trade than ~30 lines we
 * control. If this site ever moves to Astro 7, reconsider adopting the plugin
 * and delete this file.
 *
 * Pairs with `[...slug].md.ts`, which serves each page's raw markdown.
 */
export const GET: APIRoute = async () => {
  const docs = await getCollection('docs')

  // Sort by route so the index is stable across builds — an unstable index
  // produces noisy diffs and defeats caching for agents that fetch it often.
  const entries = [...docs].sort((a, b) => a.id.localeCompare(b.id))

  const lines: string[] = [
    '# Flapjack',
    '',
    'Open-source search engine with an Algolia-compatible API, plus Flapjack Cloud,',
    'the managed version. Self-host the same engine that runs the hosted service.',
    '',
    'Each page below is also available as raw markdown by appending `.md` to its',
    'path — for example `/getting-started.md`.',
    '',
    '## Docs',
    ''
  ]

  for (const entry of entries) {
    // Starlight's index page has an empty id; expose it as the site root.
    const path = entry.id === '' || entry.id === 'index' ? '/' : `/${entry.id}/`
    const title = entry.data.title
    const description = entry.data.description
    lines.push(description ? `- [${title}](${path}): ${description}` : `- [${title}](${path})`)
  }

  lines.push('')

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8'
    }
  })
}
