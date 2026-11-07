# Final presentation change record

## Unwanted content removed

- `index.html`, `engine.js`: removed the general dossier disclaimer, TerraVita geometry disclaimer, JellyCast map/forecast disclaimer, Obsidian reconstruction label, and JellyCast “NO LIVE FORECAST DATA” banner.
- `project-study.js`, `project-showcase.js`: removed the shared rendering paths for those disclaimers and the equivalent conceptual-visualization fallback note. Existing project descriptions and unrelated technical notes remain.
- `claim-exhibit.js`: removed the exact demo workflow button and demo state label, which were located in Click Claim rather than JellyCast. Removed their exclusive update handler; retained the model’s original initial workflow state, four workflow rows, role navigation, and other controls.
- `fsk-exhibit.js`: removed the unsolicited Source & Engineering Notes content and its third-chapter reading panel. Carrier controls, waveforms, circuit models, contribution text, and source link remain.
- `habitseed-exhibit.js`: removed the application-screen note, botanical stage tagline, and specified Firebase privacy paragraph. Private/local data behavior and all application/growth controls remain.

## Layout adjustments

Removed the disclaimer elements and their exclusive wrappers rather than leaving hidden boxes. The existing document flow and vertical alignment rebalance the reading columns without changing page grids, breakpoints, typography, models, cameras, lighting, or animations. The empty FSK notes panel is no longer mounted. `habitseed-showcase.css` adds 7 px between the remaining architecture heading and stack labels after deleting the intervening paragraph.

## Social metadata

`index.html` includes the requested document title, description, Open Graph, Twitter, and canonical metadata in initial HTML. `tools/build.mjs` defaults to the verified Pages origin and updates existing URLs instead of appending duplicate tags. `tools/runtime-assets.json` includes the approved social artwork. The existing origin override and preview indexing behavior remain available.

The 1200 × 630 JPEG is 168,089 bytes. Both approved images were copied unchanged; SHA-256 comparison against the supplied source files confirms identical bytes.

## README, screenshots, and repository presentation

`README.md` now presents the workshop, actual navigation, seven projects, verified stack, local commands, and deployment. `release/DEPLOYMENT.md` documents the existing connected production workflow. Approved branding and eight curated real screenshots are indexed in [docs/media](../docs/media/README.md).

Before and after capture sets cover Home, Project Discovery, the Lab, and all three chapters of all seven projects at both required viewports: **48 main captures per set**. Eight additional mobile reading-end captures per set verify notes originally below the first screen: **112 captures total**, kept outside tracked media under ignored `verification/test-results/presentation/`. The main baseline used the unmodified local production artifact; additional baseline captures used the still-unmodified live deployment. Normal motion, actual WebGL, fonts, models, and mobile touch contexts were used. Screenshot review includes the removed panels and surrounding layouts; no screenshot assets were reconstructed or enhanced.

GitHub description, homepage, and eight requested topics were updated through authenticated `gh` and read back successfully. The production branch remains `release/production`.

## Verification

- `npm run check`: JavaScript syntax validation.
- `npm test`: 67 existing controller tests passed.
- `npm run build`: production build passed; 211 deployment files.
- `npm run audit:release`: deployment paths, references, hashes, file limits, and repository history audit passed.
- `node verification/release/presentation.cjs after`: both viewports, every project chapter, no failed assets or runtime exceptions, no horizontal document overflow, and identified removed copy absent.
- `node verification/release/metadata.cjs`: initial source and built HTML have the exact metadata, unique tags, consistent URLs, and unchanged 1200 × 630 image.
- `npm run test:release`: passed all rooms, project chapters, About tabs, skill categories, and archives at 1440 × 900, 1920 × 1080, 768 × 1024, 390 × 844, and 360 × 800. The interaction suite passed 117 checks at desktop, mobile, and landscape sizes, including fallback/context loss, navigation, asset responses, delivery, orbit, growth, signals, sensors, and contact. Trusted touch drag and pinch checks passed with no WebGL, runtime, or network errors.
- README rendering was checked through GitHub’s Markdown API; responsive image attributes survive rendering. All 26 local documentation links and eight screenshot dimensions passed verification.

Final production deployment and live metadata results are provided in the release handoff. Physical iOS/Safari checks are outside this automated Windows/Chromium run.

## Manual GitHub social-preview upload

The available GitHub API/CLI and connector do not provide a repository social-preview upload operation. The approved JPEG already meets GitHub’s minimum dimensions and size limit, so no resize or artwork change is needed.

1. Open [repository settings](https://github.com/xari-ya/Portfolio/settings).
2. Under **Social preview**, choose **Edit → Upload an image**.
3. Upload [`assets/social/portfolio-preview-final.jpg`](../assets/social/portfolio-preview-final.jpg).

These are GitHub’s [documented upload steps](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/customizing-your-repositorys-social-media-preview). This upload is not claimed as completed.

## Scope observations

TerraVita’s separate MQ-135 / non-live-measurement note and other established simulation wording were retained because they are not equivalent to the specified unsolicited blocks. `sarith.me` remains planned; metadata, links, and deployment continue to use the verified Pages origin. No unrelated website issue was changed.
