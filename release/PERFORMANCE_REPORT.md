# Performance report

The release reduces asset transfer/storage and duplicate material allocation while preserving geometry, texture-upload pixels, CSS, camera behavior and animation timing. It does **not** claim a general FPS increase.

## Environment and method

Windows desktop: Intel Core Ultra 9 275HX, 33,752,997,888 bytes system RAM, Intel Graphics through ANGLE Direct3D 11. Chrome 157.0.8103.38; independent functional review also used Edge 156.0.4314.58. Desktop 1440×900 and touch-emulated 390×844, DPR 1, normal motion. These are not physical smartphone or thermal-endurance measurements.

The original was served from the hash-verified recovery snapshot; production was served from the built static artifact using the same case-sensitive Node HTTP server. Cold and repeat loads were recorded. Three alternating paired runs per viewport sampled seven actual rooms for four seconds each: 84 comparable room samples. A complete mobile pair was repeated after automatic baseline render scaling changed its canvas resolution; unequal-canvas raw samples were excluded. Raw and aligned datasets remain external. Instrumentation counts actual WebGL-drawing callbacks and API draw calls, not every requestAnimationFrame callback. Its rendered-frame count matched the original scene counter exactly in the 84 room samples.

Normal-motion comparisons include live actors, equipment, changing displays and manufacturing. They are samples on shared desktop hardware, not deterministic GPU benchmarks. JavaScript heap values are browser estimates and include garbage-collector timing. Resource counts are application tracking, not driver-reported VRAM. GPU time, device power, thermal behavior and real-phone sustained FPS were not measured.

## Accepted improvements

- Forty-two phone material entries use smaller lossless WebP at exactly the original renderer upload dimensions. GPU RGBA readback matched the original on accepted maps. One nonmatching and two larger conversions were rejected and originals retained.
- One exact duplicate compact material entry was remapped to the same canonical texture, eliminating a redundant fetch/decode/upload entry and an estimated 5,592,406 RGBA8 bytes including mipmaps. This format estimate is not measured VRAM.
- Eleven project/room images retain their original dimensions and decoded RGBA pixels in smaller lossless WebP files.
- The deployment allowlist excludes obsolete/source-only previews, editing masters, tests and development debris. Local code needs no production npm dependency and no extra renderer framework.
- Stable names use cache revalidation; Pages handles platform compression. Compression and revalidation were exercised locally; actual Cloudflare response behavior remains a first-deployment check.

A small responsive-query caching refactor was profiled and tested, then **reverted** because the measurements did not show a consistent overall benefit. The final engine and communications responsive calculations therefore match the approved original apart from text normalization and a shoreline license comment. No adaptive-resolution policy, frame cap, scene timing or visible quality was reduced for this release.

## Earlier profiling results (candidate refactor rejected)

These medians explain why the CPU refactor was rejected; they are **not** presented as final-release speed gains. FPS means rendered frames/elapsed wall time. CPU is the median JavaScript callback containing a render, not GPU completion time.

| Viewport | Room | Original FPS | Candidate FPS | Original CPU ms | Candidate CPU ms |
|---|---|---:|---:|---:|---:|
| 1440 px | overview | 55.2 | 55.2 | 1.50 | 1.50 |
| 1440 px | about | 54.2 | 54.7 | 1.40 | 1.50 |
| 1440 px | production | 54.5 | 54.7 | 1.50 | 1.50 |
| 1440 px | lab | 51.3 | 51.2 | 1.50 | 1.50 |
| 1440 px | skills | 48.2 | 48.2 | 1.40 | 1.70 |
| 1440 px | experience | 46.1 | 46.4 | 1.70 | 1.90 |
| 1440 px | communications | 55.2 | 55.1 | 1.70 | 1.70 |
| 390 px | overview | 27.5 | 27.5 | 1.80 | 1.70 |
| 390 px | about | 27.2 | 27.5 | 2.10 | 2.30 |
| 390 px | production | 27.5 | 27.5 | 1.90 | 2.40 |
| 390 px | lab | 27.5 | 27.5 | 1.50 | 1.60 |
| 390 px | skills | 27.5 | 27.5 | 1.70 | 1.80 |
| 390 px | experience | 27.2 | 27.5 | 2.40 | 2.30 |
| 390 px | communications | 27.5 | 27.7 | 2.00 | 1.80 |

Variation includes faster and slower samples, so a universal CPU/FPS improvement is not supported. The final release measurements and project-asset transfer comparison are appended below after validation.

## Initial and repeat loading

The approved cinematic dominates entrance duration (~8.4 seconds including the sampling settle period) and is deliberately unchanged. Earlier median cold transfer was approximately 8.29 MB desktop / 5.83 MB touch viewport, including the appropriate engineer model. Repeat transfer was ~41 KB of revalidation/header overhead on the local server. Homepage assets were already compressed/appropriate and were not degraded; optimized phone maps are loaded only when their project studies need them. Faster project-asset transfer must therefore be distinguished from homepage cinematic duration.

## Remaining bottlenecks and limits

The original renderer schedules desktop rendering near a 16 ms threshold and phone rendering near 32 ms; observed rates follow that cadence and available GPU scheduling. Scene draw-call counts vary by room and live state. The rich model topology, original lighting, authoring fidelity and animations were retained. The engineer has intentional desktop/mobile mesh variants; no new polygon reduction was applied. Large CPU spikes during lazy initialization and sustained physical-mobile heating require real-device follow-up before making hardware-specific claims.

No physical phone, Safari/iOS, Firefox, driver-level GPU duration/VRAM or remote network/CDN benchmark is claimed. See the release audit for exact PASS/NOT TESTED boundaries.

## Final-build verification after reverting the CPU refactor

One additional paired pass sampled every room at both viewports on the **actual final build**, with existing balanced quality/DPR 1 held equal for the comparison. This pass checks preservation; it is a single final-build pair, not a statistically proven FPS gain. The 28 raw room samples, 8 cold/repeat load records and 12 lazy project-load records are retained in `performance-final/performance.json` outside the repository. All paired canvas dimensions match, rendered-frame counters agree and WebGL errors are zero.

| Width | Room | FPS before → after | FPS change | Frame median ms before → after | Frame p95 ms before → after | Draws/frame before → after |
|---|---|---:|---:|---:|---:|---:|
| 1440 | overview | 55.0 → 55.0 | -0.0% | 18.2 → 18.2 | 18.3 → 18.3 | 461.9 → 461.9 |
| 1440 | about | 55.2 → 55.0 | -0.5% | 18.2 → 18.2 | 18.3 → 18.3 | 462.1 → 462.1 |
| 1440 | production | 55.2 → 55.0 | -0.4% | 18.2 → 18.2 | 18.3 → 18.3 | 475.1 → 475.1 |
| 1440 | lab | 50.7 → 50.4 | -0.5% | 18.2 → 18.2 | 24.3 → 24.3 | 403.8 → 403.8 |
| 1440 | skills | 47.5 → 47.5 | +0.0% | 18.3 → 18.2 | 24.3 → 24.3 | 404.0 → 404.0 |
| 1440 | experience | 45.9 → 46.0 | +0.1% | 24.2 → 24.2 | 24.3 → 24.3 | 548.0 → 548.0 |
| 1440 | communications | 55.2 → 55.0 | -0.4% | 18.2 → 18.2 | 18.3 → 18.3 | 526.3 → 531.2 |
| 390 | overview | 27.5 → 27.5 | +0.1% | 36.4 → 36.4 | 36.4 → 36.5 | 461.9 → 461.9 |
| 390 | about | 27.5 → 27.7 | +0.9% | 36.4 → 36.4 | 36.4 → 36.4 | 462.1 → 462.1 |
| 390 | production | 27.5 → 27.5 | -0.0% | 36.4 → 36.4 | 36.4 → 36.5 | 475.1 → 475.1 |
| 390 | lab | 27.5 → 27.5 | -0.0% | 36.4 → 36.4 | 36.5 → 36.5 | 403.8 → 403.8 |
| 390 | skills | 27.5 → 27.5 | -0.1% | 36.4 → 36.4 | 36.5 → 36.4 | 404.0 → 404.0 |
| 390 | experience | 27.5 → 27.5 | +0.0% | 36.4 → 36.3 | 36.4 → 36.5 | 548.0 → 548.0 |
| 390 | communications | 27.5 → 27.7 | +0.9% | 36.4 → 36.4 | 36.5 → 36.4 | 521.1 → 519.6 |

Differences in draw calls reflect live scene/actor state and shadow scheduling; they are not claimed as a renderer batching improvement. No quality/canvas reduction is used to claim a gain. CPU task duration, submission distributions, heap start/end, long tasks, canvas dimensions and resource tracking are recorded in the raw data. Warm navigation stayed at 5,276 tracked shared buffers and 65 tracked shared textures across repeated room/category changes; imported phone resources have their own cache/counts. Neither count represents driver VRAM.

## Measured lazy project transfer

The following is **incremental actual browser transfer** while opening HabitSeed, then Click Claim, then Prajaa in the same context. Shared handset resources loaded earlier remain cached. The original and final use the same local HTTP compression/revalidation behavior. Fixed settling periods are included in readiness observations; load-wall-time changes are not claimed as network-speed gains.

| Width | Study | Before bytes | After bytes | Saved bytes | Reduction |
|---|---|---:|---:|---:|---:|
| 1440 | habitseed | 9,812,183 | 7,710,489 | 2,101,694 | 21.4% |
| 1440 | click-claim | 7,239,416 | 6,203,199 | 1,036,217 | 14.3% |
| 1440 | prajaa | 1,190,784 | 681,253 | 509,531 | 42.8% |
| 1440 | **Combined incremental transfer** | **18,242,383** | **14,594,941** | **3,647,442** | **20.0%** |
| 390 | habitseed | 9,812,183 | 7,710,489 | 2,101,694 | 21.4% |
| 390 | click-claim | 7,239,416 | 6,203,199 | 1,036,217 | 14.3% |
| 390 | prajaa | 1,190,784 | 681,253 | 509,531 | 42.8% |
| 390 | **Combined incremental transfer** | **18,242,383** | **14,594,941** | **3,647,442** | **20.0%** |

The compact-phone material allocation estimate falls from 33,751,050 to 28,158,644 bytes (16.6%); the iPhone material estimate remains 47,185,950 bytes. This removes one redundant 1024×1024 RGBA8 mipmapped upload while preserving material values. Desktop/mobile engineer topology and texture allocations remain intentional original variants.

The complete production artifact is 34,138,240 bytes. A conservative original deployment closure including retained fallback/legacy previews was 39,598,574 bytes (13.8% reduction). Matching only the final asset closure back to original encodings gives 38,163,397 bytes (10.5% reduction), before adding new publication/license notices. Storage and network comparisons use different scopes and are labeled accordingly.

The accepted gains are less transfer/decode work for project materials, fewer duplicate texture resources and a much smaller maintainable publication tree. Final FPS remains broadly governed by the approved renderer cadence and hardware; no broad frame-speed claim is justified or required to accept these fidelity-preserving improvements.
