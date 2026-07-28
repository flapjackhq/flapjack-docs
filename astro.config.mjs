// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
	site: 'https://docs.flapjack.foo',
	integrations: [
		starlight({
			title: 'Flapjack',
			logo: { light: './src/assets/logo-light.svg', dark: './src/assets/logo-dark.svg', replacesTitle: true },
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/flapjackhq/flapjack' }],
			// Puts an "Edit page" link on every page pointing at this repo. Docs
			// errors should be a one-click PR, not an email to support — see the
			// support routing table in README.md.
			editLink: {
				baseUrl: 'https://github.com/flapjackhq/flapjack-docs/edit/main/'
			},
			customCss: ['./src/styles/custom.css'],
			sidebar: [
				{ label: 'Getting Started', slug: 'getting-started' },
				{ label: 'Migrate from Algolia', slug: 'migrate-from-algolia' },
				{
					label: 'Guides',
					items: [
						{ label: 'Self-Hosting', slug: 'guides/self-hosting' },
						{ label: 'Flapjack Cloud', slug: 'guides/flapjack-cloud' },
						{ label: 'InstantSearch.js', slug: 'guides/instantsearch' },
						{ label: 'Troubleshooting', slug: 'guides/troubleshooting' },
					],
				},
				{
					label: 'API Reference',
					items: [
						{ label: 'Overview', slug: 'api/overview' },
						{ label: 'Search', slug: 'api/search' },
						{ label: 'Indexing', slug: 'api/indexing' },
						{ label: 'Index Management', slug: 'api/index-management' },
						{ label: 'Settings', slug: 'api/settings' },
					],
				},
				{
					label: 'Client Libraries',
					items: [
						{ label: 'JavaScript', slug: 'clients/javascript' },
						{ label: 'Python', slug: 'clients/python' },
						{ label: 'cURL', slug: 'clients/curl' },
					],
				},
			],
		}),
	],
});
