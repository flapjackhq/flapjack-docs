# Flapjack docs site

**This directory is live.** It builds the site served at
<https://docs.flapjack.foo> — the public documentation a prospective customer
reads before signing up. Treat edits here as customer-facing changes.

Astro + Starlight. Content lives in `src/content/docs/`; the sidebar and site
config live in `astro.config.mjs`.

## How it deploys

**Merging to `main` deploys.** `.github/workflows/ci.yml` builds, runs the full
Playwright suite against the build, deploys to Cloudflare Pages, then re-runs the
suite against `https://docs.flapjack.foo` to prove what customers actually see.

The Cloudflare Pages project `flapjack-docs` is **direct upload** — it has no git
integration of its own, so the workflow's `wrangler pages deploy` step *is* the
deployment. `docs.flapjack.foo` is a proxied CNAME to `flapjack-docs.pages.dev`.

CI authenticates with `CLOUDFLARE_API_TOKEN`, a token scoped to **Pages Write
only** — not the account-wide global key. `CLOUDFLARE_ACCOUNT_ID` is the second
secret. Both are repository secrets.

A nightly job re-checks production against the committed claims, so drift
surfaces within a day instead of at the next person's audit.

To deploy by hand (rarely needed):

```bash
npm ci && npm run build
npx wrangler pages deploy dist --project-name=flapjack-docs --branch=main
```

## Why this warning exists

Between 2026-02-12 and 2026-07-26 this repo was archived while the site it
builds stayed live. Nobody could correct it, and nothing pointed out that the
repo was load-bearing. During that window the site advertised a `$19/mo` plan
tier that no longer existed, sent signups to `app.flapjack.foo` (a host that does
not resolve), and pointed every install and download URL at
`github.com/flapjack-search` and `ghcr.io/flapjack-search` — an organization
that does not exist, so all of them returned 404 for five months.

The e2e suite did not catch it. It asserted `$19/mo` was *present*, so it
actively enforced the wrong price, and every other check tested that a page
loaded rather than that its claims were true.

## Claim parity — do not delete this

`e2e/docs.spec.ts` has a `Published claims` block that pins the pricing, free
tier, install org, and signup host to their upstream sources of truth, and a
`RETIRED_CLAIMS` list that fails if a previously-wrong claim reappears.

These pages make factual claims about a product whose code lives in other repos,
so nothing in this repo's build can detect drift on its own. The block is the
only thing that can. When a claim legitimately changes, **update the upstream
source of truth first, then the snapshot in the spec** — never the spec alone.

Upstream owners:

| Claim | Source of truth |
| --- | --- |
| Pricing, free tier | `fjcloud_dev` → `web/src/lib/pricing.ts` (`MARKETING_PRICING`) |
| Plan names | `fjcloud_dev` → `infra/api/src/models/customer.rs` (`BillingPlan`) |
| Install org, image | `flapjack_dev` → `engine/install.sh` (`REPO`) |

## Tests

```bash
npm run build
npx playwright test                                       # against the local build
BASE_URL=https://docs.flapjack.foo npx playwright test    # against production
```

Run the production form after every deploy. It is the only check that proves
what customers actually see.
