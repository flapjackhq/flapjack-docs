import type { APIRoute, GetStaticPaths } from 'astro'
import { getCollection } from 'astro:content'

/**
 * Serves the raw markdown for every docs page at `<path>.md`.
 *
 * Typesense does the same thing — swap `.html` for `.md` on any docs URL and you
 * get parseable source instead of rendered HTML. Agents and LLM tooling can then
 * read a page without stripping Starlight's markup, and humans get a copyable
 * source view.
 *
 * The route pattern is `[...slug].md.ts`, which emits `/<slug>.md`. Starlight
 * owns `/<slug>/` (trailing slash, no extension), so the two do not collide.
 *
 * Indexed by `llms.txt.ts`, which advertises this convention to agents.
 */
export const getStaticPaths: GetStaticPaths = async () => {
  const docs = await getCollection('docs')

  return docs.map((entry) => ({
    // Starlight's index page has an empty id; emit it as `/index.md` so it has
    // a reachable path rather than colliding with the site root.
    params: { slug: entry.id === '' ? 'index' : entry.id },
    props: { entry }
  }))
}

export const GET: APIRoute = async ({ props }) => {
  const entry = props.entry as { body?: string; data: { title: string; description?: string } }

  // `body` is the raw markdown as authored, before Starlight renders it. If a
  // loader ever stops populating it, fail loudly rather than silently serving an
  // empty file that looks like a valid but blank page.
  if (typeof entry.body !== 'string' || entry.body.length === 0) {
    throw new Error(
      `Cannot serve raw markdown for "${entry.data.title}": content collection entry has no body. ` +
        `Check whether the docs loader still exposes raw content.`
    )
  }

  return new Response(entry.body, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8'
    }
  })
}
