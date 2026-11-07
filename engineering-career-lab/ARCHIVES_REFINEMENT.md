# Experience Archives refinement — 2026-11-06

The three supplied images are the visual targets for Leadership, Experience and Achievements. This pass develops those three existing sections; it does not add Education or invent roles, dates, achievements or certificate claims. The later requested changes remove Leadership & Service Recognition from Achievements and reorder the four remaining tiles.

## Changes

- Replaced the primitive hand-written record SVG paths with locally sourced Tabler outline symbols and an existing World Scout Emblem. Original upstream asset files and license notices are retained. No new symbol artwork was drawn.
- Uses the original maroon-and-gold Ananda College crest from its official website for School Colours, as requested.
- Rebuilt the Archives presentation around an outlined timeline, restrained red selection treatment, chronology nodes, role/date columns, a leadership summary using the existing University of Colombo crest, and four awards in a two-by-two layout: Prajaa and Hemas AITHON above the President?s Scout Award and School Colours.
- Made the complete record lists available on mobile instead of reverting to a single generic summary. The existing reading panel, room viewport and navigation remain in place. Added keyboard arrow/Home/End selection for the timeline controls.
- Changed content resolution from 1200×570 to 1200×714 to match the existing physical display’s aspect. The physical screen has not been enlarged. This removes the previous horizontal compression and gives the records appropriate space.
- Fixed a real render-path bug: the physical screen callback ignored the selected journey and always painted Achievements. It now forwards the current section to the painter. HTML and the WebGL texture use the same original records and sourced symbols.
- Uses the downloaded SVG geometry directly in the HTML overlay, avoiding a separate CSS mask layer for each symbol.
- Refreshes the screen once fonts and image assets load. Outline tints are cached; nothing is fetched or regenerated per frame. No new animation loop or framework was introduced.
- Refined only the Archives’ existing physical installation: a narrower red canopy accent, darker shelf surfaces and drawer fronts, and a darker counter. The scene’s camera, physical screen dimensions, Skills installation, KIRA and other rooms retain their existing implementation.

## Actual code path

`index.html` loads `refinement.js`, then the new `archive-display.js`. `LabRefinement.records` remains the factual source. `LabRefinement.refresh` delegates Archives rendering to `LabArchiveDisplay.render`, while its existing Skills presentation remains in place.

`skills-interface.js` keeps its click/controller/navigation integration and physical screen projection. Its old phone-only single-summary replacement was removed. The new `archive-display.css` scopes its presentation to `.lab-experience-screen`.

`lab-room.js` passes the selected journey into `paintExperienceJourney`. The existing furniture painter delegates to `LabRefinement.paintArchive`, which now calls `LabArchiveDisplay.paint`. The existing renderer uploads that canvas to the Archives screen. The canvas is 1200×714 and is not uploaded continuously.

## Sourcing

The icon search found suitable existing artwork, so the permitted custom-SVG fallback was not used. See [asset provenance and licenses](assets/archive/README.md) and [public credits](assets/archive/CREDITS.html).

## Verification

Evidence is served at `http://127.0.0.1:4175/verification/lab/archives/`. It includes unaltered browser before/after captures of all three sections, phone views, original texture images, camera equality checks and source-response hashes.

The same port 4175 static source pipeline proven in the room reconstruction was reused. Browser caching is disabled and service workers are blocked in the capture context. Assets and scripts are local and revisioned.

The first captured iteration exposed a CSS custom-property URL resolution error: masks were resolving relative to the stylesheet. Absolute same-origin asset URLs corrected it. A later performance pass replaced CSS masking with the upstream SVG geometry directly, avoiding per-symbol mask compositing. The original asset geometry remains sourced, not redrawn. Later captures verify that the actual symbols appear. The physical-screen selection bug and content-aspect mismatch were fixed before final verification.

`verification/lab/archive-check.cjs` checks all three section selections, record counts and containment, distinct physical textures, correct screen aspect, local symbol loading, keyboard operation, complete scrollable phone records, Skills selection, Reception navigation, inactive-room suspension, stable GPU resources and browser/GL errors. It also compares the remaining factual records with the pre-change working-tree snapshot, allowing only the requested removal and reorder and measures CPU/GPU times against that snapshot at equal raster sizes.

`verification/lab/archive-capture.cjs` captures desktop and phone screenshots and records browser/disk source hashes. `verification/lab/archive-report.py` generates the evidence gallery and SSIM comparisons. Raw results and test logs are linked from the gallery.

The reference’s photographic lighting and materials remain a visual target, not a claimed result of this interface pass. The existing generic physical recognition objects were retained without inventing inscriptions or organizations.


## Final measurements and remaining cost

The final matched captures use revision `archives-20261106-r5`. All three camera comparisons are exactly equal, browser responses match the current source hashes, 35 functional browser checks pass, and the 38 existing route/workshop/project unit tests pass. The preview link and evidence-gallery links were checked after restarting the interrupted static server.

At equal raster sizes, the median of three desktop run medians was 18.11 ? 18.49 ms GPU and 0.88 ? 0.89 ms CPU submission. Across four paired phone-viewport runs, GPU median was 5.49 ? 7.32 ms and CPU submission 1.06 ? 1.21 ms. Frame-interval p95 remained 33.4 ms desktop and 33.5 ms phone. These are measurements on the same Intel GPU with touch emulation, not physical-phone results.

The richer phone record presentation retains a measured GPU cost of approximately 1.8 ms compared with the previous incomplete phone summary. It is reported as remaining performance overhead, not hidden behind a generic 10% allowance or described as a performance improvement. The physical texture now uses fewer bytes than the original, inline upstream symbols avoid individual mask layers, and no new per-frame asset generation or animation loop was added. Raw initial and optimized profiles are retained in the evidence directory.
