# Deployment and verification

The existing public deployment is [portfolio-bu2.pages.dev](https://portfolio-bu2.pages.dev/), connected to [xari-ya/Portfolio](https://github.com/xari-ya/Portfolio). GitHub’s default branch and the documented Cloudflare production branch are `release/production`; the baseline commit has a successful Cloudflare Pages check.

## Local verification

Use Node.js 24 (minimum 22), from the publication repository root:

```sh
npm ci
npm run check
npm test
npm run build
npm run audit:release
npm run preview
```

The production preview is http://127.0.0.1:4174/; `npm start` serves source at http://127.0.0.1:4173/. The servers bind to loopback and enforce exact filename case. In another terminal, run:

```sh
npm run test:release
```

Playwright is the existing locked development dependency. The helper discovers installed Chromium, Chrome, or Edge. `WORKSHOP_BROWSER_EXECUTABLE` selects an executable; `npx playwright install chromium` installs Chromium if needed. On Windows, use `$env:WORKSHOP_BROWSER_ANGLE='d3d11'` for the validated hardware backend.

`WORKSHOP_BASE_URL` selects a test origin, and `WORKSHOP_OUTPUT` selects an evidence directory. Normal browser captures are ignored under `verification/test-results/`. The scoped presentation capture is `node verification/release/presentation.cjs after`; it visits every project chapter at 1440 × 900 and 390 × 844. Physical phone and Safari verification remain separate manual checks.

## Existing Cloudflare Pages configuration

| Setting | Value |
| --- | --- |
| Repository | `xari-ya/Portfolio` |
| Production branch | `release/production` |
| Framework preset | None |
| Root directory | Repository root |
| Build command | `npm run build` |
| Build output | `dist` |
| Node.js | 24 |
| Backend / Functions | None |

The build uses Node built-ins and the explicit allowlist in `tools/runtime-assets.json`. Do not deploy the repository root. The approved social image is included as `assets/social/portfolio-preview-final.jpg`; README artwork and curated screenshots under `docs/media/` are not deployed.

The default canonical origin is `https://portfolio-bu2.pages.dev`. `SITE_ORIGIN`, when set, must be an HTTPS origin without a trailing slash. The build updates canonical, Open Graph, and Twitter image URLs consistently and generates the sitemap. Initial source HTML also contains complete sharing metadata. Nonproduction Cloudflare branch builds retain the existing `noindex,nofollow` behavior.

## Publish a validated change

1. Inspect the complete diff, run the checks, and review desktop/mobile screenshots.
2. Stage only authorized paths and commit on `release/production`.
3. Confirm the remote branch has not advanced, then push normally:

```sh
git push origin release/production
```

4. Verify the Cloudflare Pages check for that commit, then fetch production HTML and the public sharing image. Check the canonical URL, metadata uniqueness, image content type and dimensions, and representative navigation and models.

Do not force-push, rewrite history, or add an alternate deployment configuration. Existing hash navigation and the real `404.html` remain in use. `_headers` retains revalidation policies; Pages handles compression and ETags.

## Custom domain later

`sarith.me` is a planned custom domain. Keep the working Pages origin until the domain has been attached in the existing Pages project, DNS and certificate activation are complete, and HTTPS is verified. Only then set `SITE_ORIGIN` to the chosen domain and rebuild. No custom-domain redirect is added by this release.

## Rollback and recovery

In Pages, select a previously successful production deployment and roll it back. Follow with a corrective Git commit or `git revert` so the next build preserves the correction. Never force-push. Keep external recovery archives intact; restore them into a new empty directory if needed. See [local recovery](LOCAL_RECOVERY.md).
