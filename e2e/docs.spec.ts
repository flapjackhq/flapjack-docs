import { test, expect } from '@playwright/test'

const UNSAFE_MANAGED_CLOUD_TEXT = String.raw`(?:admin(?:istrator)?(?:[ _-](?:key|secret))|FLAPJACK_ADMIN_KEY|YOUR_(?:[A-Z]+_)*IP|YOUR_VM|https?:\/\/(?:\d{1,3}\.){3}\d{1,3}|\b7700\b)`

function unsafeManagedCloudSection(startHeading: string, endHeading: string) {
  const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(
    `${escapeRegExp(startHeading)}(?:(?!${escapeRegExp(endHeading)})[\\s\\S])*${UNSAFE_MANAGED_CLOUD_TEXT}`,
    'i'
  )
}

test.describe('Docs site — Home', () => {
  test('home page loads with title', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('Flapjack Documentation')
  })

  test('home page has quick start links', async ({ page }) => {
    await page.goto('/')
    const main = page.locator('main')
    await expect(main.getByRole('link', { name: 'Getting Started' })).toBeVisible()
    await expect(main.getByRole('link', { name: 'Migrate from Algolia' })).toBeVisible()
    await expect(main.getByRole('link', { name: 'API Reference' })).toBeVisible()
    await expect(main.getByRole('link', { name: 'Client Libraries' })).toBeVisible()
  })

  test('home page describes what Flapjack is', async ({ page }) => {
    await page.goto('/')
    const main = page.locator('main')
    await expect(main).toContainText('Algolia-compatible API')
    await expect(main).toContainText('Self-host anywhere')
    // Pricing wording is asserted against the product SSOT in the
    // "Published claims" block below, not by a loose substring match here.
    // A previous revision asserted "$19/mo" — a plan tier that was removed
    // from the product in May 2026 — which made this suite actively enforce
    // a false price. Do not reintroduce a hardcoded price string here.
  })
})

test.describe('Docs site — Getting Started', () => {
  test('getting started page loads with content', async ({ page }) => {
    await page.goto('/getting-started/')
    await expect(page.locator('h1')).toContainText('Getting Started')
    await expect(page.getByRole('heading', { name: 'Managed Cloud' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Self-hosted', exact: true })).toBeVisible()
    const main = page.locator('main')
    await expect(main).toContainText('https://api.flapjack.foo')
    await expect(main).toContainText('tenant-scoped, search-only credential')
    await expect(main).toContainText('Do not put the tenant token in browser code')
    await expect(main).not.toContainText(unsafeManagedCloudSection('Managed Cloud', 'Self-hosted'))
  })

  test('sidebar navigation is present', async ({ page }) => {
    await page.goto('/getting-started/')
    const sidebar = page.locator('nav[aria-label="Main"]')
    await expect(sidebar.getByText('Getting Started')).toBeVisible()
    await expect(sidebar.getByText('Migrate from Algolia')).toBeVisible()
    await expect(sidebar.getByText('Guides')).toBeVisible()
    await expect(sidebar.getByText('API Reference')).toBeVisible()
    await expect(sidebar.getByText('Client Libraries')).toBeVisible()
  })
})

test.describe('Docs site — Migrate from Algolia', () => {
  test('migration page loads with compatibility info', async ({ page }) => {
    await page.goto('/migrate-from-algolia/')
    await expect(page.locator('h1')).toContainText('Migrate from Algolia')
    await expect(page.getByRole('heading', { name: /Compatibility/i })).toBeVisible()
    const main = page.locator('main')
    await expect(main).toContainText('migration is not only a hostname change')
    await expect(main).toContainText('not a promise that every Algolia endpoint')
    await expect(main).not.toContainText(/drop[- ]in|same code|works unchanged|out of the box/i)
    await expect(main).not.toContainText(
      unsafeManagedCloudSection('Managed Cloud migration', 'Self-hosted migration')
    )
  })

  test('migration page has code examples', async ({ page }) => {
    await page.goto('/migrate-from-algolia/')
    await expect(page.locator('pre code').first()).toBeVisible()
  })

  test('migration page has Export from Algolia section', async ({ page }) => {
    await page.goto('/migrate-from-algolia/')
    await expect(page.getByRole('heading', { name: /Export from Algolia/i })).toBeVisible()
    const content = page.locator('main')
    await expect(content).toContainText('algolia objects browse')
    await expect(content).toContainText('settings.json')
  })

  test('migration page has What\'s different section', async ({ page }) => {
    await page.goto('/migrate-from-algolia/')
    await expect(page.getByRole('heading', { name: /What.*different/i })).toBeVisible()
    const content = page.locator('main')
    await expect(content).toContainText('Deployment and credentials')
    await expect(content).toContainText('Ranking and settings')
    await expect(content).toContainText('Migration fidelity')
  })

  test('migration page has a compatibility checklist', async ({ page }) => {
    await page.goto('/migrate-from-algolia/')
    await expect(page.getByRole('heading', { name: /Compatibility checklist/i })).toBeVisible()
    const content = page.locator('main')
    await expect(content).toContainText('Ranking')
    await expect(content).toContainText('Filtering')
    await expect(content).toContainText('Faceting')
  })

  test('migration page has verification checklist', async ({ page }) => {
    await page.goto('/migrate-from-algolia/')
    const content = page.locator('main')
    await expect(content).toContainText('Verification checklist')
    await expect(content).toContainText('record counts')
    await expect(content).toContainText('highlighting')
  })
})

test.describe('Docs site — Guides', () => {
  test('self-hosting guide loads', async ({ page }) => {
    await page.goto('/guides/self-hosting/')
    await expect(page.locator('h1')).toContainText('Self-Hosting')
    await expect(page.getByRole('heading', { name: /Docker/i })).toBeVisible()
  })

  test('Flapjack Cloud guide loads', async ({ page }) => {
    await page.goto('/guides/flapjack-cloud/')
    await expect(page.locator('h1')).toContainText('Flapjack Cloud')
    const main = page.locator('main')
    await expect(main).toContainText('https://api.flapjack.foo')
    await expect(main).toContainText('/onboarding/credentials')
    await expect(main).toContainText('search-only credential')
    await expect(main).toContainText('trusted HTTPS hostname with no explicit port')
    await expect(main).not.toContainText(
      /admin key|admin_key|YOUR_ADMIN_KEY|FLAPJACK_ADMIN_KEY/i
    )
    await expect(main).not.toContainText(/YOUR_(?:INSTANCE_)?IP|https?:\/\/(?:\d{1,3}\.){3}\d{1,3}/i)
    await expect(main).not.toContainText(':7700')
  })

  test('InstantSearch guide loads', async ({ page }) => {
    await page.goto('/guides/instantsearch/')
    await expect(page.locator('h1')).toContainText('InstantSearch')
    // Page has code examples with instantsearch
    await expect(page.locator('pre code').first()).toBeVisible()
  })

  test('troubleshooting guide loads', async ({ page }) => {
    await page.goto('/guides/troubleshooting/')
    await expect(page.locator('h1')).toContainText('Troubleshooting')
    await expect(page.getByRole('heading', { name: 'Managed Cloud connections' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Self-hosted connections' })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Connection refused/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Invalid API key/i })).toBeVisible()
    const main = page.locator('main')
    await expect(main).toContainText('copy the endpoint from Cloud')
    await expect(main).toContainText('search-only key returned by Cloud')
    await expect(main).not.toContainText(
      unsafeManagedCloudSection('Managed Cloud connections', 'Self-hosted connections')
    )
  })

  test('troubleshooting guide covers common migration issues', async ({ page }) => {
    await page.goto('/guides/troubleshooting/')
    const content = page.locator('main')
    await expect(content).toContainText('TLS')
    await expect(content).toContainText('InstantSearch')
    await expect(content).toContainText('Batch import')
    await expect(content).toContainText('Python')
    await expect(content).toContainText('Health check')
  })
})

test.describe('Docs site — API Reference', () => {
  test('API overview loads', async ({ page }) => {
    await page.goto('/api/overview/')
    await expect(page.locator('h1')).toContainText('API Overview')
  })

  test('search API page loads', async ({ page }) => {
    await page.goto('/api/search/')
    await expect(page.locator('h1')).toContainText('Search API')
    // Has HTTP method references in code blocks
    await expect(page.locator('pre code').first()).toBeVisible()
  })

  test('indexing API page loads', async ({ page }) => {
    await page.goto('/api/indexing/')
    await expect(page.locator('h1')).toContainText('Indexing API')
  })

  test('index management API page loads', async ({ page }) => {
    await page.goto('/api/index-management/')
    await expect(page.locator('h1')).toContainText('Index Management API')
  })

  test('settings API page loads', async ({ page }) => {
    await page.goto('/api/settings/')
    await expect(page.locator('h1')).toContainText('Settings API')
  })
})

test.describe('Docs site — Client Libraries', () => {
  test('JavaScript client page loads with code examples', async ({ page }) => {
    await page.goto('/clients/javascript/')
    await expect(page.locator('h1')).toContainText('JavaScript Client')
    await expect(page.locator('pre code').first()).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Managed Cloud' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Self-hosted', exact: true })).toBeVisible()
    const main = page.locator('main')
    await expect(main).toContainText('tenant-scoped, search-only key')
    await expect(main).toContainText('https://api.flapjack.foo')
    await expect(main).toContainText('Do not ship the tenant token')
    await expect(main).not.toContainText(unsafeManagedCloudSection('Managed Cloud', 'Self-hosted'))
  })

  test('Python client page loads', async ({ page }) => {
    await page.goto('/clients/python/')
    await expect(page.locator('h1')).toContainText('Python Client')
  })

  test('cURL examples page loads with code examples', async ({ page }) => {
    await page.goto('/clients/curl/')
    await expect(page.locator('h1')).toContainText('cURL Examples')
    await expect(page.locator('pre code').first()).toBeVisible()
  })
})

test.describe('Docs site — Navigation', () => {
  test('sidebar link points to correct page', async ({ page }) => {
    await page.goto('/getting-started/')
    const sidebar = page.getByRole('navigation', { name: 'Main' })
    const link = sidebar.getByRole('link', { name: 'Flapjack Cloud', exact: true })
    await expect(link).toBeVisible()
    await expect(link).toHaveAttribute('href', '/guides/flapjack-cloud/')
    await link.click()

    await expect(page).toHaveURL(/\/guides\/flapjack-cloud\/$/)
    const main = page.getByRole('main')
    await expect(
      main.getByRole('heading', { name: 'Flapjack Cloud', exact: true, level: 1 }),
    ).toBeVisible()
    await expect(
      main.getByRole('heading', { name: 'Current access, pricing, and limits', exact: true }),
    ).toBeVisible()
    await expect(main).toContainText('https://api.flapjack.foo')
    await expect(main).toContainText('/onboarding/credentials')
  })

  test('all pages are accessible (no 404)', async ({ page }) => {
    const pages = [
      '/',
      '/getting-started/',
      '/migrate-from-algolia/',
      '/guides/self-hosting/',
      '/guides/flapjack-cloud/',
      '/guides/instantsearch/',
      '/guides/troubleshooting/',
      '/api/overview/',
      '/api/search/',
      '/api/indexing/',
      '/api/index-management/',
      '/api/settings/',
      '/clients/javascript/',
      '/clients/python/',
      '/clients/curl/',
    ]

    for (const path of pages) {
      const response = await page.goto(path)
      expect(response?.status(), `${path} should return 200`).toBe(200)
    }
  })
})

test.describe('Docs site — Search & Theme', () => {
  test('search button is present', async ({ page }) => {
    await page.goto('/getting-started/')
    await expect(page.locator('button[aria-label="Search"]')).toBeVisible()
  })

  test('page renders with dark theme by default', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto('/')
    const html = page.locator('html')
    await expect(html).toHaveAttribute('data-theme', 'dark')
  })
})

/**
 * Published-claim parity.
 *
 * These pages make factual claims about a product that lives in another repo,
 * so nothing in this repo's build can catch it when the product moves and the
 * docs do not. Between Feb and Jul 2026 that gap let the site advertise a
 * deleted pricing tier and two install URLs pointing at a GitHub org that does
 * not exist — every install path 404'd for five months.
 *
 * The values below are a committed snapshot of upstream sources of truth. When
 * a claim legitimately changes, update the SSOT first, then this snapshot.
 *
 * Upstream owners (fjcloud_dev):
 *   - pricing:  web/src/lib/pricing.ts :: MARKETING_PRICING
 *   - plans:    infra/api/src/models/customer.rs :: BillingPlan
 *   - install:  flapjack_dev engine/install.sh :: REPO
 */
const PRODUCT_CLAIMS = {
  // MARKETING_PRICING.storage_rate_per_mb_month
  storageRatePerMbMonth: '$0.05',
  // Product-owned mutable Cloud surfaces.
  cloudPricingUrl: 'https://cloud.flapjack.foo/pricing',
  cloudAccessUrl: 'https://cloud.flapjack.foo/beta',
  // engine/install.sh REPO — the canonical public OSS repo and GHCR namespace
  githubOrg: 'flapjackhq',
} as const

/**
 * Strings that must never reappear. Each is a claim that was live, wrong, and
 * customer-visible; a regression here means the docs drifted back.
 */
const RETIRED_CLAIMS = [
  'flapjack-search', // dead GitHub org — broke every install and download URL
  'app.flapjack.foo', // dead signup host — DNS does not resolve
  '$19/mo', // removed plan tier; product is metered
  'dedicated EC2 instance', // placement is shared, not dedicated
  'Stripe Checkout', // checkout-session endpoint was deleted from the API
] as const

const ALL_DOC_PAGES = [
  '/',
  '/getting-started/',
  '/migrate-from-algolia/',
  '/guides/self-hosting/',
  '/guides/flapjack-cloud/',
  '/guides/instantsearch/',
  '/guides/troubleshooting/',
  '/api/overview/',
  '/api/search/',
  '/api/indexing/',
  '/api/index-management/',
  '/api/settings/',
  '/clients/javascript/',
  '/clients/python/',
  '/clients/curl/',
] as const

test.describe('Docs site — Agent and contributor affordances', () => {
  test('llms.txt indexes every documented page', async ({ request }) => {
    const res = await request.get('/llms.txt')
    expect(res.status()).toBe(200)
    expect(res.headers()['content-type']).toContain('text/plain')

    const body = await res.text()
    // Assert real content, not merely that the file exists: every page in the
    // nav must be indexed, or agents silently miss whole sections.
    for (const path of ALL_DOC_PAGES) {
      if (path === '/') continue
      expect(body, `llms.txt must index ${path}`).toContain(path)
    }
    // Advertise the raw-markdown convention, which is the other half of the contract.
    expect(body).toContain('.md')
  })

  test('every page is available as raw markdown', async ({ request }) => {
    const missing: string[] = []

    for (const path of ALL_DOC_PAGES) {
      const mdPath = path === '/' ? '/index.md' : `${path.replace(/\/$/, '')}.md`
      const res = await request.get(mdPath)
      if (res.status() !== 200) {
        missing.push(`${mdPath} returned ${res.status()}`)
        continue
      }
      const body = await res.text()
      // A 200 that serves an empty file is the failure this catches — the
      // endpoint throws on empty bodies, but assert it here too so a future
      // loader change surfaces as a test failure rather than a blank page.
      if (body.trim().length === 0) missing.push(`${mdPath} was empty`)
      // Assert raw markdown via the Content-Type header, NOT by sniffing the
      // body for HTML markers. Docs pages legitimately contain HTML inside code
      // fences — the InstantSearch guide embeds a full `<!DOCTYPE html>` example
      // — so body-sniffing produces false positives on correct output.
      const contentType = res.headers()['content-type'] ?? ''
      if (!contentType.includes('text/markdown')) {
        missing.push(`${mdPath} served Content-Type "${contentType}", expected text/markdown`)
      }
    }

    expect(missing, missing.join('\n')).toEqual([])
  })

  test('pages offer an edit link pointing at the docs repo', async ({ page }) => {
    await page.goto('/getting-started/')
    const editLink = page.getByRole('link', { name: /edit page/i })
    await expect(editLink).toBeVisible()
    await expect(editLink).toHaveAttribute(
      'href',
      /github\.com\/flapjackhq\/flapjack-docs\/edit\/main\//
    )
  })
})

test.describe('Docs site — Published claims', () => {
  test('no page repeats a retired claim', async ({ page }) => {
    const offences: string[] = []

    for (const path of ALL_DOC_PAGES) {
      await page.goto(path)
      // Read the whole document, not just <main>: the sidebar, footer, and
      // header carry links (e.g. the GitHub social icon) that are claims too.
      const body = await page.locator('body').innerText()
      const html = await page.content()

      for (const retired of RETIRED_CLAIMS) {
        if (body.includes(retired) || html.includes(retired)) {
          offences.push(`${path} still publishes "${retired}"`)
        }
      }
    }

    expect(offences, offences.join('\n')).toEqual([])
  })

  test('install and repository links point at the real GitHub org', async ({ page }) => {
    await page.goto('/getting-started/')
    const html = await page.content()
    // Any github.com or ghcr.io reference to flapjack must carry the real org.
    const refs = html.match(/(?:github\.com|ghcr\.io)\/[\w-]+\/flapjack/g) ?? []
    expect(refs.length, 'getting-started must reference the repo or image').toBeGreaterThan(0)
    for (const ref of refs) {
      expect(ref, `"${ref}" must use the ${PRODUCT_CLAIMS.githubOrg} org`).toContain(
        `/${PRODUCT_CLAIMS.githubOrg}/`
      )
    }
  })

  test('home page states the metered storage rate, not a plan price', async ({ page }) => {
    await page.goto('/')
    const main = page.locator('main')
    await expect(main).toContainText(PRODUCT_CLAIMS.storageRatePerMbMonth)
  })

  test('cloud guide links to the pricing SSOT instead of copying volatile values', async ({ page }) => {
    await page.goto('/guides/flapjack-cloud/')
    const main = page.locator('main')
    const pricingLink = page.getByRole('link', { name: 'Current prices and limits', exact: true })
    await expect(pricingLink).toBeVisible()
    await expect(pricingLink).toHaveAttribute('href', PRODUCT_CLAIMS.cloudPricingUrl)
    await expect(main).not.toContainText('$0.05')
    await expect(main).not.toContainText('100,000')
    await expect(main).not.toContainText('250 MB')
  })

  test('cloud guide sends users to the current access owner', async ({ page }) => {
    await page.goto('/guides/flapjack-cloud/')
    const accessLink = page.getByRole('link', { name: 'Current access details', exact: true })
    await expect(accessLink).toBeVisible()
    await expect(accessLink).toHaveAttribute('href', PRODUCT_CLAIMS.cloudAccessUrl)
  })
})
