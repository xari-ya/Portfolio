# Local production release

The approved portfolio has been preserved and prepared for GitHub and Cloudflare Pages as a static custom HTML/CSS/JavaScript/WebGL 2 application. No framework migration, public deployment, remote repository creation, push or DNS change was performed.

| Item | Result |
|---|---|
| Canonical publication checkout | `site-publication`, sibling of the original `site` directory |
| Publication branch | `release/production` |
| Final commit identifier | The commit at tag `release/production-2026-11-07`; resolve with `git rev-parse release/production-2026-11-07^{commit}` |
| Original project directory | 3,413,966,371 bytes / 3,966 files, including Git and ignored material |
| Original tracked source/assets | 507,080,977 bytes / 1,198 files |
| Final source/assets/reports | Approximately 36.5 MB; generated deployment and dependencies excluded |
| Final publication directory | Approximately 137 MB including clean Git history, installed test dependencies and generated output; roughly 96% below the original development directory |
| Initial equivalent deployment | 39,598,574 bytes / 217 files, reconstructed conservative closure; no earlier production build existed |
| Final deployment | **34,138,240 bytes / 209 files**; approximately **13.8% smaller** than that conservative original closure |
| Cleanup | 3,421 original paths / 3,031,580,143 bytes removed from the working project into protected recovery/quarantine; no permanent destruction |
| Duplicate investigation | 192 original hash-duplicate groups; redundant active compact-phone texture entry consolidated |
| Geometry preservation | Original workshop/Kira, models, handset topology, CV, camera and animation behavior preserved |
| Functional validation | 67 controller/geometry tests; complete room/project regression; independent Edge desktop/mobile review; trusted touch and Kira lifecycle checks |
| Visual comparison | 195 original and production states; 30 fixed-time paired states with identical cameras, median absolute RGB difference 0/255; no material visual regression found |
| Performance | 20.0% lower combined lazy transfer in three handset studies at both viewports, pixel-verified textures and ~5.59 MB estimated duplicate texture allocation removed; no general FPS increase claimed |
| Recovery | External `../site-recovery/20261107-160423/`, all original file hashes verified and five restore checks passed |

The entire original worktree, including its uncommitted updates, was the source of truth. No code was merged or copied from another worktree. Original Git metadata remains in `../site/.git` so the pre-existing linked mobile worktree still resolves; the original `site` Git status intentionally differs from its legacy branch after cleanup. **Publish `site-publication`, not the legacy `site` repository.**

The source/runtime commit is `7ec96114b3b9211b7e5310b80f9a1a4f9e4987ae`; the final report commit is identified by the stable release tag above to avoid a self-referential commit hash inside its own content. The final handoff also states the resolved commit hash.

## Manual publication and verification

Create the intended GitHub repository, connect/push `release/production`, and import it into Cloudflare Pages using build `npm run build`, output `dist`, `NODE_VERSION=24`. Set `SITE_ORIGIN` only after the actual HTTPS origin is known. Follow [the exact publication procedure](DEPLOYMENT.md), including preview indexing, domain setup and rollback.

Physical mobile/thermal behavior, Safari/iOS, Firefox, native Linux browser execution, driver-level GPU telemetry and live Pages/DNS/HTTPS remain **NOT TESTED**, with reasons in [the audit](RELEASE_AUDIT.md). LinkedIn returned an anti-bot response during automated link verification; its published target was preserved. Email delivery was not attempted. These limits are not represented as passing tests.

Local release preparation is complete after the final production regression, source/history audit, clean commit and release-tag verification. All bulky measurements/screenshots stay outside the source and deployment. External publication remains an explicit manual action.
