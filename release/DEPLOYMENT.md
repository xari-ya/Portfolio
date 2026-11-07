# Publication procedure

This is a static HTML/CSS/JavaScript/WebGL 2 application. No backend, Functions, runtime npm dependencies, framework migration or Git LFS is required. Nothing has been published or connected externally during this release.

## Verify locally

Use Node.js 24 (minimum 22). From the repository root:

```sh
npm ci
npm run check
npm test
npm run build
npm run audit:release
npm run preview
```

Open `http://127.0.0.1:4174/`. In another terminal run `npm run test:release`. These release tests default to the **built output on port 4174**, not the source server. `npm start` serves source on port 4173. Servers bind to loopback and enforce exact filename case, even on Windows. The preview supports compressed responses and revalidation; it is a local verification tool, not a server to deploy.

Playwright is a locked development dependency. The browser helper finds an installed Chromium/Chrome/Edge, or accepts `WORKSHOP_BROWSER_EXECUTABLE`. On this Windows host, `WORKSHOP_BROWSER_ANGLE=d3d11` enables the tested hardware backend. On a system without an installed browser, install Playwright Chromium with `npx playwright install chromium`. Browser captures default to ignored `verification/test-results/`; `WORKSHOP_OUTPUT` can select an external evidence directory. Physical phone and Safari checks remain separate manual verification.

`npm run test:performance` records three runs across desktop and touch viewports. Set `WORKSHOP_BASELINE_URL` to an HTTP-served protected original to obtain alternating before/after runs, and `WORKSHOP_BASE_URL` to the production preview. It reports rendered frames, not raw animation-frame callback frequency.

## Create and connect GitHub

1. Create an **empty** GitHub repository using the intended account and visibility. Do not add an initial README/license/gitignore there. Visibility does not license the source or assets.
2. Inspect `git status --short`, `git log --oneline`, `git remote -v`, and `npm run audit:release`. The publication branch is `release/production`; the legacy repository and protected original baseline are external recovery artifacts and must not be pushed.
3. Substitute your actual account/repository, then run these commands only when ready to publish:

```sh
git remote add origin https://github.com/<ACCOUNT>/<REPOSITORY>.git
git push -u origin release/production
```

No force push, history rewrite or `git add .` is needed. Review and stage explicit paths for future changes.

## Cloudflare Pages Git integration

1. In Cloudflare **Workers & Pages**, create a Pages project and connect the intended GitHub repository. Grant access only to that repository if appropriate.
2. Use these build settings:

| Setting | Value |
|---|---|
| Production branch | `release/production` |
| Framework preset | None |
| Root directory | Repository root |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node version environment variable | `NODE_VERSION=24` |
| Backend/Functions | None |

The build uses only Node built-ins. The output allowlist is `tools/runtime-assets.json`; tests, original source artwork, reports, dependencies and recovery files never enter `dist`. Do not point Pages at the repository root.

3. Initially leave `SITE_ORIGIN` unset. The build omits canonical/absolute sharing URLs and sitemap until an actual deployment origin is known. After the first deployment, optionally set `SITE_ORIGIN` to its exact HTTPS origin **without a trailing slash**, then rebuild. Once a custom domain is active, replace it with that canonical origin. No domain has been invented in the source.
4. Test the assigned `pages.dev` URL: loader, all rooms, all eight project studies, phone navigation, contact, CV, credits, a missing route, and asset requests. Check browser console and network errors. Confirm HTTPS, content types, `_headers` policies, compression and cache revalidation. These live Cloudflare checks have not been run locally.

Pages Free currently permits 20,000 files and a maximum 25 MiB per static asset. The build enforces these limits. [Cloudflare limits](https://developers.cloudflare.com/pages/platform/limits/), [Git integration](https://developers.cloudflare.com/pages/get-started/git-integration/).

## Routing, cache and previews

Navigation uses in-page journey state and existing hash behavior. No blanket SPA rewrite is required. Top-level `404.html` supplies a real missing-page response; existing hash refresh/startup behavior is deliberately preserved.

Files retain stable names, so `_headers` requests cache revalidation instead of a year-long immutable cache that could mix releases. Pages supplies its platform compression/ETag handling; verify this on the first live deployment. No service worker or tracker was introduced. [Header rules](https://developers.cloudflare.com/pages/configuration/headers/).

Commits to the production branch automatically build production; other configured branches produce previews. The build uses Cloudflare's `CF_PAGES` and `CF_PAGES_BRANCH` variables to add `noindex,nofollow` and a disallowing robots file outside `release/production`. Keep that production branch name synchronized with the build if you change it. Previews should be tested before merging. [Preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/).

## Custom domain and HTTPS later

Add the chosen hostname in the Pages project's **Custom domains** workflow first. For an apex domain, follow Cloudflare's zone/nameserver requirements; for a subdomain, add the CNAME requested by the workflow at the DNS provider. Do not create a guessed DNS record before attaching the domain. Wait for domain and certificate activation, then test HTTPS, certificate hostname, HTTP redirect behavior and all resources. Set `SITE_ORIGIN` to the chosen primary HTTPS origin and redeploy. If both `www` and apex are used, choose one canonical hostname and configure the intended redirect explicitly. [Custom domain instructions](https://developers.cloudflare.com/pages/configuration/custom-domains/).

## Rollback

In Pages deployments, select a previously successful **production** deployment and use its rollback action. Then create a corrective Git commit or `git revert <bad-commit>` on the production branch so the next automatic build does not reintroduce the defect. Preview deployments are not production rollback targets. Never force-push or remove the local recovery archive. [Cloudflare rollbacks](https://developers.cloudflare.com/pages/configuration/rollbacks/).

For local disaster recovery, restore the external snapshot into a **new empty directory**, not over newer work. Its `RESTORE.md`, full hashed manifest, original `.git`, working-tree diffs and protected baseline repository document recovery.
