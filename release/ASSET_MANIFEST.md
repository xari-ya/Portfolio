# Production asset manifest

The authoritative copy allowlist is [`tools/runtime-assets.json`](../tools/runtime-assets.json). It is derived from observed network requests across 195 baseline states, static references, JSON material dependencies and explicit fallback/credit dependencies. `npm run audit:release` checks the output, static references, exact path case, material hashes and reachable Git objects. Runtime code constructs additional paths from project IDs, phone manifest filenames, skill/archive symbol names and the viewport variant; these closures are listed explicitly.

## Critical models and editable originals

| Runtime asset | Purpose and integrity |
|---|---|
| `engine.js` | Existing embedded TerraVita Rev 4 data and procedural Obsidian, JellyCast, SENTINEL and related project scenes; original geometry/animation data retained. Only responsive query caching and a license comment changed. |
| `workshop-hall.js`, room/exhibit scripts | Approved hall, Kira two-eye geometry, rooms, equipment, lighting, camera and animation logic. No renderer migration, blanket simplification or model substitution. |
| `engineer-assets/character/sarith-engineer-{desktop,mobile}.glb` | Original optimized skinned engineer exports, unchanged byte hashes. Both retain eight clips and the authored rig; desktop/mobile variants are intentional. |
| `engineer-assets/laptop/legion-model.js` | Supplied Legion model adapter and hinge/material geometry, preserved. |
| `assets/showcase/phones/{compact,iphone}.json/.bin` | Original handset topology: 7,610 / 64,229 triangles. Binary SHA-256 hashes unchanged. JSON explicitly maps materials and texture dependencies. |
| `communications-room/assets/cars/{porsche,alpine-a110}.car` | Existing quantized car geometry preserved unchanged. Owner confirmed public redistribution permission on 2026-11-07; see source-side `permission.json`. |
| `assets/licenses/jellycast-shoreline.js` | Editable copy of the existing geographic coordinates and triangulated caps, with GSHHG/Basemap attribution and LGPL notices. Does not change the rendered data. |

Original Blender, FBX/OBJ, GLB masters, supplied models, phone source archives, artwork and historical preparation tools remain recoverable from the external original snapshot and quarantine. See [local recovery](LOCAL_RECOVERY.md). Restore original editing paths in a separate worktree before running historical preparation tools. Building the static site requires only checked-in runtime exports and Node; Blender, Python and source-only masters are not deployment dependencies.

## Image and texture rules

Accepted phone maps were exported at exactly the dimensions already uploaded by the renderer and encoded as lossless WebP. GPU RGBA readback was compared against the original: 44 of 45 material entries matched; the unmatched entry stays original. Two other matching conversions were larger and rejected. Forty-two entries use the smaller verified outputs; one duplicate compact entry is consolidated to an existing canonical texture and remapped in the material table. The original `iphone-24.png`, `iphone-6.jpg` and `iphone-10.jpg` remain intentional.

Eleven project/room images use smaller lossless WebP with identical decoded RGBA pixels and unchanged dimensions. Logos, fonts, technical geometry, phone binaries and CV quality are preserved. `material-<content-hash>.webp` names prevent accidental duplicate exports; do not overwrite content under another file's hash. Keep original provenance, dimensions and source hashes when regenerating assets. Never remove files based only on a text search: exercise every room, project/chapter, viewport variant and fallback, then update the allowlist and re-run the release tests.

## Rights and notices

No general source/asset license is granted. Phone source credits (CC BY 4.0 / CC0), font OFL, meshopt MIT, Tabler MIT, institutional-mark ownership and GSHHG/Basemap LGPL/GPL notices are retained in the public [`credits.html`](../credits.html) and adjacent notices. Car permission is owner-confirmed rather than an invented upstream license. Institutional marks identify the actual education/experience records and retain their respective ownership.

## Runtime sizes

| Category | Files | Bytes |
|---|---:|---:|
| Room art, institutional marks, credits and publication metadata | 48 | 2,557,461 |
| CV | 1 | 5,036,103 |
| Local typography | 3 | 224,100 |
| Application code, embedded geometry, shaders and styles | 88 | 4,487,612 |
| Project previews and fallbacks | 22 | 1,676,858 |
| Project artwork | 11 | 2,049,450 |
| Handset geometry and PBR materials | 49 | 12,572,458 |
| Engineer models | 2 | 6,969,520 |
| **Total** | **224** | **35,573,562** |

No runtime npm dependencies or external trackers/CDNs are loaded. Fonts and shader sources are local. The meshopt decoder is loaded only for compatible compressed engineer models. Production output excludes reports, tests, caches, editing masters and recovery data.

## Exact production files

Sizes describe the domain-unset artifact; setting an origin adds a sitemap and a few metadata bytes. Build-state SHA-256 details remain generated/ignored, not extra deployed inventory files.

| File | Bytes |
|---|---:|
| `404.html` | 820 |
| `Sarith_Dodangodage_CV.pdf` | 5,036,103 |
| `_headers` | 227 |
| `assets/fonts/BarlowCondensed-ExtraBold.ttf` | 110,296 |
| `assets/fonts/BarlowCondensed-SemiBold.ttf` | 109,428 |
| `assets/fonts/OFL-BarlowCondensed.txt` | 4,376 |
| `assets/licenses/GSHHG-COPYING.LESSER.txt` | 7,651 |
| `assets/licenses/GSHHG-COPYING.txt` | 35,150 |
| `assets/licenses/jellycast-shoreline.js` | 27,848 |
| `assets/projects/analog-fsk-first.jpg` | 80,549 |
| `assets/projects/analog-fsk-model.jpg` | 22,827 |
| `assets/projects/analog-fsk.png` | 48,523 |
| `assets/projects/click-claim-first.jpg` | 80,812 |
| `assets/projects/click-claim-model.jpg` | 33,296 |
| `assets/projects/click-claim.png` | 52,167 |
| `assets/projects/habitseed-first.jpg` | 61,704 |
| `assets/projects/habitseed-model.jpg` | 51,807 |
| `assets/projects/habitseed.png` | 17,259 |
| `assets/projects/jellycast-model.jpg` | 35,782 |
| `assets/projects/jellycast.png` | 370,896 |
| `assets/projects/kira.png` | 260,406 |
| `assets/projects/obsidian-first.jpg` | 81,370 |
| `assets/projects/obsidian-model.jpg` | 35,969 |
| `assets/projects/obsidian.png` | 62,260 |
| `assets/projects/prajaa-first.jpg` | 92,130 |
| `assets/projects/prajaa-model.jpg` | 39,023 |
| `assets/projects/prajaa.png` | 51,629 |
| `assets/projects/sentinel-model.jpg` | 28,288 |
| `assets/projects/sentinel.png` | 55,162 |
| `assets/projects/terravita-model.jpg` | 22,977 |
| `assets/projects/terravita.png` | 92,022 |
| `assets/showcase/habitseed/04-home.webp` | 395,310 |
| `assets/showcase/habitseed/06-habit-detail.webp` | 375,742 |
| `assets/showcase/habitseed/07-stats.webp` | 146,328 |
| `assets/showcase/habitseed/08-store.webp` | 450,006 |
| `assets/showcase/phones/CREDITS.html` | 1,693 |
| `assets/showcase/phones/compact.bin` | 300,440 |
| `assets/showcase/phones/compact.json` | 15,879 |
| `assets/showcase/phones/iphone-10.jpg` | 60,481 |
| `assets/showcase/phones/iphone-24.png` | 35,841 |
| `assets/showcase/phones/iphone-6.jpg` | 91,261 |
| `assets/showcase/phones/iphone.bin` | 2,293,020 |
| `assets/showcase/phones/iphone.json` | 35,051 |
| `assets/showcase/phones/material-0795bd4a25aa84df.webp` | 10,968 |
| `assets/showcase/phones/material-10102821633e5f30.webp` | 32 |
| `assets/showcase/phones/material-1b9a43582050d368.webp` | 60,404 |
| `assets/showcase/phones/material-1ccdc00d4c995354.webp` | 32 |
| `assets/showcase/phones/material-21e6334b21aee7a5.webp` | 394,564 |
| `assets/showcase/phones/material-2423c2ba917ed692.webp` | 681,660 |
| `assets/showcase/phones/material-363d7eb50260f961.webp` | 9,616 |
| `assets/showcase/phones/material-384335edeb395695.webp` | 2,160,120 |
| `assets/showcase/phones/material-4aee7c3f9d7e77f0.webp` | 32 |
| `assets/showcase/phones/material-4af11bd971799702.webp` | 32 |
| `assets/showcase/phones/material-4bdc3a147e0d43a4.webp` | 267,568 |
| `assets/showcase/phones/material-4e6357563b7c2907.webp` | 455,794 |
| `assets/showcase/phones/material-5223e8c13dd3020b.webp` | 32 |
| `assets/showcase/phones/material-5335f9532eb506f5.webp` | 32 |
| `assets/showcase/phones/material-5f0b9588ff4b67c7.webp` | 44,404 |
| `assets/showcase/phones/material-67b4addffa22486c.webp` | 32 |
| `assets/showcase/phones/material-6fa35202e94f0462.webp` | 247,464 |
| `assets/showcase/phones/material-76a41452065f4920.webp` | 7,790 |
| `assets/showcase/phones/material-77de9e73a265f20e.webp` | 30 |
| `assets/showcase/phones/material-78d2eb78e5264a02.webp` | 12,824 |
| `assets/showcase/phones/material-79a88961e6aa5e4c.webp` | 839,346 |
| `assets/showcase/phones/material-81363cde0a760439.webp` | 32 |
| `assets/showcase/phones/material-819205792d531910.webp` | 74,106 |
| `assets/showcase/phones/material-8e3020c93ae8a6fa.webp` | 159,134 |
| `assets/showcase/phones/material-8e5f6ee6ccbbff42.webp` | 5,190 |
| `assets/showcase/phones/material-9bf621aca8d1086a.webp` | 573,302 |
| `assets/showcase/phones/material-a0b12e6d1b53c141.webp` | 32 |
| `assets/showcase/phones/material-a748274dacde1a6c.webp` | 26,422 |
| `assets/showcase/phones/material-a9b7101cc6c19266.webp` | 1,075,594 |
| `assets/showcase/phones/material-abf4919928fb751b.webp` | 162,212 |
| `assets/showcase/phones/material-adeda480b02b7246.webp` | 32 |
| `assets/showcase/phones/material-b8792ead593398b8.webp` | 56,788 |
| `assets/showcase/phones/material-bfb72112da29e422.webp` | 10,566 |
| `assets/showcase/phones/material-c57ec9a1ed6fdeb6.webp` | 49,550 |
| `assets/showcase/phones/material-c8c3f5eb67ec5347.webp` | 29,234 |
| `assets/showcase/phones/material-df88d59f705031e5.webp` | 324,344 |
| `assets/showcase/phones/material-f41369ae3fde3bcf.webp` | 1,946,494 |
| `assets/showcase/phones/material-f9e8e6805a801cdc.webp` | 8,486 |
| `assets/showcase/phones/material-fe861fe1b1d0c59d.webp` | 36,776 |
| `assets/showcase/phones/material-ff43914a521a4fbf.webp` | 7,624 |
| `assets/showcase/phones/material-ffaf7fac4f0c6fdd.webp` | 98 |
| `assets/showcase/prajaa/community.webp` | 168,996 |
| `assets/showcase/prajaa/complaints.webp` | 105,858 |
| `assets/showcase/prajaa/home.webp` | 102,558 |
| `assets/showcase/prajaa/performance.webp` | 200,140 |
| `assets/showcase/prajaa/prajaa-logo.svg` | 5,326 |
| `assets/showcase/prajaa/report.webp` | 88,894 |
| `assets/showcase/prajaa/welcome.webp` | 10,292 |
| `character-assets/generated/vendor/MESHOPT_LICENSE.md` | 1,079 |
| `character-assets/generated/vendor/meshopt_decoder.mjs` | 29,059 |
| `character-assets/university-of-colombo.png` | 419,440 |
| `character-assets/university-of-moratuwa.png` | 11,146 |
| `claim-exhibit.js` | 5,845 |
| `claim-showcase.css` | 2,534 |
| `claim-showcase.js` | 8,710 |
| `communications-room/assets/campus-mobile-v2.webp` | 63,798 |
| `communications-room/assets/campus-v2.webp` | 234,982 |
| `communications-room/assets/cars/alpine-a110.car` | 188,042 |
| `communications-room/assets/cars/porsche.car` | 180,016 |
| `communications-room/assets/homepage-preview.jpg` | 159,755 |
| `communications-room/assets/network-connections.webp` | 623,618 |
| `communications-room/behaviour.js` | 5,389 |
| `communications-room/camera.js` | 7,153 |
| `communications-room/cars.js` | 1,456 |
| `communications-room/daylight.js` | 5,436 |
| `communications-room/exterior.js` | 2,179 |
| `communications-room/graphics.js` | 8,521 |
| `communications-room/interface.js` | 12,321 |
| `communications-room/materials.js` | 2,902 |
| `communications-room/pendulum.js` | 2,598 |
| `communications-room/phone.js` | 8,713 |
| `communications-room/room.css` | 11,745 |
| `communications-room/room.js` | 26,360 |
| `communications-room/screens.js` | 2,175 |
| `credits.html` | 2,685 |
| `engine.js` | 3,480,035 |
| `engineer-about.css` | 15,579 |
| `engineer-about.js` | 7,085 |
| `engineer-assets/character/sarith-engineer-desktop.glb` | 4,714,976 |
| `engineer-assets/character/sarith-engineer-mobile.glb` | 2,254,544 |
| `engineer-assets/laptop/legion-model.js` | 27,378 |
| `engineer-avatar.js` | 10,399 |
| `engineer-renderer.js` | 12,719 |
| `engineer-station.js` | 10,065 |
| `engineering-career-lab/archive-display.css` | 15,952 |
| `engineering-career-lab/archive-display.js` | 13,289 |
| `engineering-career-lab/assets/archive/CREDITS.html` | 2,514 |
| `engineering-career-lab/assets/archive/LICENSE-tabler.txt` | 1,073 |
| `engineering-career-lab/assets/archive/aiesec.png` | 12,432 |
| `engineering-career-lab/assets/archive/ananda-college.png` | 75,510 |
| `engineering-career-lab/assets/archive/arrows-maximize.svg` | 584 |
| `engineering-career-lab/assets/archive/award.svg` | 509 |
| `engineering-career-lab/assets/archive/book-2.svg` | 482 |
| `engineering-career-lab/assets/archive/briefcase.svg` | 571 |
| `engineering-career-lab/assets/archive/broadcast.svg` | 519 |
| `engineering-career-lab/assets/archive/calendar-month.svg` | 635 |
| `engineering-career-lab/assets/archive/checkbox.svg` | 468 |
| `engineering-career-lab/assets/archive/chevron-down.svg` | 377 |
| `engineering-career-lab/assets/archive/chevron-right.svg` | 381 |
| `engineering-career-lab/assets/archive/coins.svg` | 765 |
| `engineering-career-lab/assets/archive/hemas.png` | 108,874 |
| `engineering-career-lab/assets/archive/laurel-wreath.svg` | 1,412 |
| `engineering-career-lab/assets/archive/mahara-youth.png` | 14,586 |
| `engineering-career-lab/assets/archive/microphone.svg` | 534 |
| `engineering-career-lab/assets/archive/organization-sources.json` | 2,236 |
| `engineering-career-lab/assets/archive/paffrel.png` | 10,302 |
| `engineering-career-lab/assets/archive/rupavahini.png` | 34,014 |
| `engineering-career-lab/assets/archive/school.svg` | 462 |
| `engineering-career-lab/assets/archive/settings.svg` | 944 |
| `engineering-career-lab/assets/archive/shield-star.svg` | 767 |
| `engineering-career-lab/assets/archive/sources.json` | 7,535 |
| `engineering-career-lab/assets/archive/trophy.svg` | 525 |
| `engineering-career-lab/assets/archive/users.svg` | 550 |
| `engineering-career-lab/assets/archive/welfare.png` | 101,445 |
| `engineering-career-lab/assets/archive/world-scout-emblem.png` | 56,363 |
| `engineering-career-lab/assets/archive/world-scout-emblem.svg` | 3,175 |
| `engineering-career-lab/interface/skills-interface.css` | 18,868 |
| `engineering-career-lab/interface/skills-interface.js` | 16,776 |
| `engineering-career-lab/kira-behaviour.js` | 3,968 |
| `engineering-career-lab/lab-controller.js` | 2,089 |
| `engineering-career-lab/lab-kira-route.js` | 6,729 |
| `engineering-career-lab/mobile-lab.css` | 12,606 |
| `engineering-career-lab/mobile-lab.js` | 13,572 |
| `engineering-career-lab/refinement.css` | 9,335 |
| `engineering-career-lab/refinement.js` | 6,934 |
| `engineering-career-lab/room/geometry-kit.js` | 3,887 |
| `engineering-career-lab/room/lab-dressing.js` | 8,190 |
| `engineering-career-lab/room/lab-room.js` | 18,638 |
| `engineering-career-lab/room/reception-door.js` | 4,581 |
| `engineering-career-lab/skills/craftsmanship.js` | 8,105 |
| `engineering-career-lab/skills/equipment.js` | 10,803 |
| `engineering-career-lab/skills/finishing.css` | 9,408 |
| `engineering-career-lab/skills/furniture.js` | 18,319 |
| `engineering-career-lab/skills/skills-data.js` | 4,170 |
| `engineering-career-lab/skills/technical-art.js` | 8,665 |
| `favicon.svg` | 267 |
| `fsk-exhibit.js` | 10,614 |
| `fsk-showcase.css` | 4,192 |
| `fsk-showcase.js` | 7,459 |
| `fsk-source-geometry.js` | 16,199 |
| `habitseed-exhibit.js` | 7,207 |
| `habitseed-showcase.css` | 2,860 |
| `habitseed-showcase.js` | 10,927 |
| `homepage-appearance.css` | 7,228 |
| `imported-phone.js` | 9,427 |
| `index.html` | 61,704 |
| `kira-loader.js` | 5,264 |
| `mobile-behavior.css` | 4,806 |
| `mobile-behavior.js` | 2,435 |
| `mobile-landing.css` | 4,212 |
| `mobile-ui.css` | 8,873 |
| `obsidian-autopilot.js` | 1,362 |
| `obsidian-batches.js` | 3,473 |
| `obsidian-route.js` | 1,685 |
| `obsidian_preview.png` | 126,514 |
| `prajaa-exhibit.js` | 4,084 |
| `prajaa-showcase.css` | 2,467 |
| `prajaa-showcase.js` | 15,824 |
| `production-station.js` | 12,742 |
| `project-delivery.js` | 9,249 |
| `project-discovery.css` | 12,420 |
| `project-discovery.js` | 20,629 |
| `project-registry.js` | 7,425 |
| `project-showcase.css` | 2,270 |
| `project-showcase.js` | 4,747 |
| `project-study-timeline.js` | 2,743 |
| `project-study.css` | 17,146 |
| `project-study.js` | 21,955 |
| `project-view-controls.js` | 1,002 |
| `robots.txt` | 23 |
| `showcase-batches.js` | 2,992 |
| `showcase-material.js` | 1,695 |
| `showcase-shadows.js` | 2,039 |
| `study-renderer.js` | 3,947 |
| `style.css` | 73,829 |
| `workshop-appearance.js` | 14,259 |
| `workshop-glass.css` | 10,449 |
| `workshop-hall.js` | 159,463 |
| `workshop-monitor.js` | 11,858 |
| `workshop-shadows.js` | 5,111 |
| `workshop-system.js` | 9,956 |
