# Engineering & Career Lab environment rebuild

The environment now uses larger, taller installations and a closer overview camera, a central identity panel integrated with the retained Reception doors, simplified ceiling structure, individually jointed floor panels, modular bench storage, additional laboratory instruments, and a glazed rotating embedded rover exhibit. Existing Skills and Archives records and their application logic are retained.

The camera, display projection, laptop height, installation frames and archive display use consistent horizontal and vertical layout scales. Phones have explicit overview and station cameras, a full-height overview and separate station viewing regions above the existing reading panels. Touch navigation remains visible; landscape panels stay below the 3D viewport.

Environmental updates share the existing render loop. Active elapsed time drives the turntable, ventilation and independent board indicators. Startup illumination settles without disabling controls. KIRA arrives for direct lab navigation, acknowledges station changes, looks toward the selected installation, and retains the existing model and Reception route. Decorative motion freezes for reduced motion and room activity suspends on exit.

## Visual inspection

Actual Chrome/WebGL captures were inspected after the foundation, equipment and lighting passes; proportion and framing corrections were made before proceeding. Final views are separate camera views of the same geometry.

- [1920px overview](../verification/lab/rebuild-desktop-1920.png)
- [Skills close-up](../verification/lab/rebuild-desktop-skills-1920.png)
- [Archives close-up](../verification/lab/rebuild-desktop-archives-1920.png)
- [Portrait overview](../verification/lab/rebuild-mobile-390x844-lab.png)
- [Portrait Skills](../verification/lab/rebuild-mobile-390x844-skills.png)
- [Landscape touch layout](../verification/lab/rebuild-touch-landscape.png)

Stage captures use `verification/lab/rebuild-stage-a-*`, `stage-b-*`, `stage-c-*` and `stage-c2-*`. The supplied composite is the visual comparison reference. These are rendered procedural geometry, not a backdrop image.

## Performance and verification

Chrome, Intel Graphics through ANGLE D3D11; desktop raster fixed at 1440 x 900 with identical quality settings. Three warmed before/after runs compare against the preserved starting working tree, including its uncommitted refinements. GPU measurements use asynchronous disjoint timer queries; CPU values are the existing smoothed renderer update/submission measurement. Queries are confined to verification scripts.

| Desktop measurement, median across runs | Before | Rebuild |
| --- | ---: | ---: |
| GPU frame cost | 23.54 ms | 18.05 ms |
| CPU update/submission | 0.96 ms | 0.90 ms |
| Frame interval | 33.1 ms | 16.7 ms |
| Frame interval p95 | 33.5 ms | 33.4 ms |
| Draw calls | 386 | 407 |

GPU cost fell approximately 23%. The main saving removes workshop lighting and shadow sampling whose result was subsequently replaced by lab lighting. Fully emissive lab surfaces skip unnecessary lighting, and mobile uses four local light contributions. Actual light spill, opaque material batching and transparent glazing remain within the existing renderer.

The emulated-phone runs retain approximately 33.3 ms median frame intervals in all three views. GPU results and per-run variation are recorded separately. They are measurements on this Intel GPU at phone viewport sizes, not physical-phone benchmarks.

Checks passed: syntax; 38 core/route unit tests; visible-button selections for four domains and three archive tabs; repeated visits without GPU resource growth; active/inactive animation; portrait and landscape containment; Reception transition; touch selection and return navigation; reduced motion; and no browser/WebGL errors.

Reports: `verification/lab/environment-report.json`, `environment-mobile-report.json`, and `environment-preservation.json`. Browser checks run with:

```text
node verification/lab/environment-check.cjs
node verification/lab/environment-mobile.cjs
```

The scripts reuse the installed Chrome. `WORKSHOP_BASE_URL` selects the local server (default port 4175). Before/after measurements require the ignored `verification/test-results/lab-baseline` working-tree snapshot captured before this rebuild; they fail explicitly if it is missing. No destructive Git operation was used. Physical phones and Safari remain unverified.
