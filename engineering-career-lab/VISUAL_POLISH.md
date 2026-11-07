# Engineering & Career Lab: visual polish

This pass keeps the room dimensions, overview and focus cameras, Skills screen size, application content, navigation and KIRA model. The Archives display is reduced 8% horizontally and 10% vertically, with its HTML projection updated through the existing layout metadata.

## Visual corrections

- Warm bench and exhibition light pools now illuminate instrument faces, worktops, books, recognition objects and cabinetry. KIRA has a stronger warm-neutral key. Highlight rolloff protects bright instrument plastics; contact shading grounds equipment and the foreground cases.
- The previously hidden power supply is now visible on the main bench, with numeric voltage/current readouts, output terminals and support feet. Scope proportions, PCB positioning and laptop placement/scale improve recognition. The prototype enclosure rests on the worktop, clears the display and leaves the center wall unobstructed.
- Intruding rear-wall supports and a service rail were moved behind/outside the Skills display. Plants crowding the identity wall and prototype were removed or moved outward.
- Painted housings, matte composite/rubber surfaces, brushed metal, glass and floor roughness have separate responses. Self-lit screen surfaces use a cheaper reflection approximation rather than evaluating the full room lighting.
- The corner tables are replaced by a wheeled electronics service trolley and a portable acquisition case on a low plinth. Redundant cabinet light strips were removed.

## Rendered comparison

All views are captured from the actual local build. The initial lighting pass, highlight balancing and final equipment fit were inspected as separate iterations against the supplied composite.

| View | Before this pass | Polished |
| --- | --- | --- |
| Overview | [Before](../verification/lab/polish-before-overview.png) | [After](../verification/lab/polish-overview.png) |
| Skills | [Before](../verification/lab/polish-before-skills.png) | [After](../verification/lab/polish-skills.png) |
| Archives | [Before](../verification/lab/polish-before-archives.png) | [After](../verification/lab/polish-archives.png) |

The comparison uses 1920 x 1080 and identical camera/quality settings. Intermediate 1440 x 900 captures use `rebuild-polish-*`. Phone captures use `polish-phone-*`.

## Verification

Syntax checks and 38 existing core/route tests pass. The focused browser suite passes 20 checks, including actual render-loop waveform changes, registered prototype/fan transforms, KIRA idle motion, physical station hover lighting, visible power supply, every domain and Archives category, repeated visits without resource growth, Reception, suspension on exit, reduced motion, touch selection and landscape containment. There were no JavaScript exceptions or pending WebGL errors.

Protected controller, interface JavaScript/CSS, entrypoint, navigation engine, KIRA route and geometry-kit files match the pre-polish working tree byte for byte. No content records or unrelated rooms were edited during this pass.

Chrome/ANGLE D3D11 on Intel Graphics, fixed 1440 x 900 raster, three warmed runs. Median of run medians:

| Measurement | Before | Polished |
| --- | ---: | ---: |
| GPU frame cost | 18.80 ms | 17.67 ms |
| CPU update/submission | 0.87 ms | 0.84 ms |
| Frame interval | 16.7 ms | 16.7 ms |
| Frame interval p95 | 33.4 ms | 33.4 ms |
| Draw calls | 407 | 410 |

GPU time uses asynchronous disjoint timer queries; CPU values use the existing renderer's smoothed update/submission measurement. Individual-run spikes remain visible in the report. Phone viewport checks run on the same Intel GPU and do not establish physical-phone performance. Safari and physical phones remain untested.

Run `node verification/lab/polish-check.cjs` with the local server at port 4175, or set `WORKSHOP_BASE_URL`. Before/after profiling requires the ignored `verification/test-results/lab-polish-baseline` snapshot captured at the start of this pass. Results are in `verification/lab/polish-report.json`.
