const fs=require('node:fs'),path=require('node:path');const dir='verification/mobile-mission',read=f=>JSON.parse(fs.readFileSync(dir+'/'+f));
const perf=read('performance.json'),layout=read('layout.json'),comparison=read('comparison.json'),audit=read('audit.json'),extras=read('extras.json'),projects=read('project-inputs.json'),guards=read('source-guards.json'),final=read('final-checks.json'),legacy=read('existing-tests.json'),environment=read('environment.json');
const mean=(values,key)=>values.reduce((s,x)=>s+x[key],0)/values.length;
const perfRows=['overview','about','production','skills','experience','communications'].map(destination=>{const a=perf.runs.filter(r=>r.baseline&&r.destination===destination),b=perf.runs.filter(r=>!r.baseline&&r.destination===destination);return `| ${destination} | ${mean(a,'medianMs').toFixed(2)} / ${mean(b,'medianMs').toFixed(2)} | ${mean(a,'p95Ms').toFixed(2)} / ${mean(b,'p95Ms').toFixed(2)} | ${mean(a,'cpuSubmissionMedianMs').toFixed(2)} / ${mean(b,'cpuSubmissionMedianMs').toFixed(2)} | ${b[0].drawCalls} / ${a[0].drawCalls} |`;}).join('\n');
const legacyRows=legacy.map(r=>`| ${r.suite} | ${r.status===0?'Passed':'See retained failure details'} |`).join('\n');
const counts={interactionChecks:audit.checks.length,extraChecks:extras.checks.length,projectChecks:projects.checks.length,sourceGuards:guards.checks.length,protectedViews:comparison.protectedViews,desktopLabViews:comparison.desktopLabViews};fs.writeFileSync(dir+'/summary.json',JSON.stringify(counts,null,2));
const report=`# Mobile portfolio delivery and audit

Implemented on branch \`feat/career-lab-reference-room\`, against baseline commit \`5b5c7a4\`. Application changes are left uncommitted for review. The existing server at http://127.0.0.1:4175 was reused and its index.html was checked against the workspace by SHA-256. The pre-existing server log was preserved and continues to grow as that server serves tests.

## Engineering & Career Lab

The phone Lab retains the original physical desks, equipment, lighting, materials, models and KIRA. The room view shows both workstations together. Two labelled desk controls lead to deliberate views of the Skills workbench and Experience Archives. Their existing hall camera spring owns the transitions; no second renderer or animation loop was added.

The Skills instrument offers four domain tabs, descriptions and technologies. The optional capabilities disclosure contains the existing capabilities, workflow descriptions and links to the existing project studies. Selecting a domain also updates the physical workbench through the original controller. The Archives instrument pages through all **13 original records** across Leadership, Experience and Achievements. Previous/Next and horizontal swipes browse records; each section remembers its current record. Education remains available in the original About Education tab via the global menu, and existing educational archive records remain unchanged.

Reading gestures stay inside the instrument. A room-view control, Workshop, KIRA and Contact controls keep it connected to the wider portfolio. The existing site menu remains available. Controls have a 44px minimum height, keyboard focus outlines, accessible names, selected-state announcements and keyboard tab navigation. Native pinch zoom is retained. New Lab styles include safe-area spacing, dynamic viewport sizing and reduced-motion/transparency treatments.

The new instruments use the established phone breakpoint of **760px**. At 740×390, the physical desk occupies the left side and its instrument the right. Wider landscape screens retain the established wider Lab interface; this follows the existing site's breakpoint rather than changing any approved global presentation. Both desks and their original content remain reachable there.

Review: [interactive comparison gallery](http://127.0.0.1:4175/verification/mobile-mission/), [Skills](verification/mobile-mission/current/390x844-skills.png), [Archives](verification/mobile-mission/current/390x844-experience.png), [room entry](verification/mobile-mission/current/390x844-lab.png), [Leadership](verification/mobile-mission/final-leadership.png), [Experience](verification/mobile-mission/final-experience.png), [Achievements](verification/mobile-mission/final-achievements.png), [landscape Skills](verification/mobile-mission/740x390-skills.png).

## Audit findings and changes

| Finding | Visitor impact | Resolution |
| --- | --- | --- |
| Contact phone panel remained visible after navigation despite its hidden attribute | High: contact controls obscured the Lab and studies | Phone-only hidden-state enforcement; visible Contact composition unchanged |
| Lab used large desktop domain tiles and long archive lists below a small world view | High for the incomplete Lab phone experience | Two physical desk views with compact instruments and paged records |
| Lab content could chain touch scrolling into the document's guided journey | Medium: unintended camera travel while reading | Native reading containment and gesture boundaries; pinch zoom preserved |
| The new capabilities disclosure initially sat partly below the reading viewport | Low: its control was hard to discover | Its 44px control is now permanently visible; expanded details use the same instrument space |
| Open menu allowed background movement and lacked complete focus ownership | Medium: accidental journey movement and unreliable keyboard dismissal | Phone-only scroll lock, inert closed menu, focus handling and Escape ownership; existing menu content/layout retained |
| Orientation changes could move About to Assembly or Discovery/Contact to the Lab | Medium: visitors lost their current section | Preserve the current normalized progress after viewport layout; cancel pending restoration on different navigation or new input; camera spring and trajectories unchanged |
| Global reduced-motion transition applied to the invisible scroll spacer's height | Medium: scrollTo could clamp against its old height during resize | Disable transitions on that nonvisual phone spacer only |
| Journey position was measured twice on every animation tick, and canvas bounds on every render | Avoidable main-thread work | Phone-only cached progress keyed by native scroll position, height and selected project; observer invalidation; observed canvas bounds reused |
| Existing native touch discovery, study scrubbing and section navigation | Already functional | Preserved and exercised, including vertical continuation beyond Discovery |
| Hidden-page render suspension, scene batching and inactive Lab animation suspension | Already implemented | Retained; no speculative renderer rewrite or visual-quality reduction |

## Performance evidence

Three alternating paired runs per implementation, six rooms, **36 warmed samples** of 4.5 seconds each. Chrome on Windows used D3D11, a 390×844 emulated touch viewport, DPR1, normal motion, balanced raster and disabled auto scaling. Browser suites ran separately from the performance experiment. These are desktop GPU measurements, **not smartphone, Safari, thermal or battery measurements**. The verification browser was ${environment.browserVersion}, with renderer: ${environment.renderer}.

Values below are the mean of three per-run statistics. Columns show **before / after**. CPU submission is the renderer's existing smoothed CPU submission metric, not total JavaScript time or GPU execution time.

| View | Median frame ms | P95 frame ms | CPU submission ms | Draw calls after / before |
| --- | --- | --- | --- | --- |
${perfRows}

The existing phone loop targets approximately 30 rendered frames per second. Warmed measurements remained around that cadence; there is **no supported claim of an FPS increase**. No long tasks were observed in these warmed sample windows. Loading and rapid-transition long-task budgets were not profiled by this experiment. GPU execution time, physical input latency and byte-level memory usage were not measured. No geometry, objects, lighting, materials, texture quality, DPR policy or rendering resolution was reduced.

Skills and Archives have intentionally new phone compositions, so their before/after timings describe the experience as a whole rather than isolating the measurement cache. Protected sections keep their original compositions. Small CPU-submission differences should not be treated as an established speedup; the bounding-box call counts below are the direct evidence for the optimization.

The measurable optimization is reduced layout querying: over two warmed stationary seconds, the journey/canvas issued approximately **240 + 60 bounding-box reads before and 0 + 0 after** in Home, About, Discovery and Skills. Contact issued ${layout.samples.find(s=>s.baseline&&s.destination==='communications').calls.experience} + 60 before and 0 + 0 after. These are counts of actual API calls, not an estimate of forced-layout duration. Actual native scroll positions matched at all 24 sampled viewport/position combinations. The largest normalized progress difference was **${layout.maxProgressDifference.toFixed(8)}**, below 0.00001 and consistent with sampling the existing easing at slightly different times. GPU resource counts remained stable on repeated room visits. The DPR3 check retained the original 390×844 internal phone raster.

Sources: [paired samples](verification/mobile-mission/performance.json), [layout and scroll comparisons](verification/mobile-mission/layout.json), [interaction/resource checks](verification/mobile-mission/audit.json).

## Regression verification

The baseline and final capture sets contain **170 screenshots each**: 360×800, 390×844, 430×932, 1440×900 and 844×390; seven room destinations plus all nine projects in three chapters at each size. Additional native touch checks and screenshots cover 740×390 and DPR3. The final serial capture recorded no uncaught exceptions, console errors or failed HTTP responses.

**${comparison.protectedViews} protected views and ${comparison.desktopLabViews} desktop/wider Lab views passed** comparison of recorded camera pose/FOV/viewport, visible UI rectangles and computed styling, study visual state, internal canvas size and GPU resource counts. New phone Lab compositions were excluded from visual invariance comparisons by design. All nine studies also passed native chapter navigation; Obsidian's three subsystems, TerraVita's three sensor selections and JellyCast's three stations passed paired native input/state comparisons.

**${guards.checks.length} source protection checks passed.** The original world construction, shaders, lighting/material construction, all protected camera definitions, camera springs, guided path interpolation, project rendering/model camera code, existing room/skills construction modules, Contact implementation, protected page styles and project controllers remain byte-identical (ignoring line-ending representation where necessary). Changed shared lines only add Lab viewport/picking hooks, phone measurement caching and nonvisual resize recovery.

Baseline screenshots taken after Contact contain its confirmed pre-existing ghost overlay. Removing that overlay is an intentional functional correction, not a page redesign. Animated characters, antialiasing and screenshot timing can still produce pixel differences; camera/UI/state comparisons and source guards complement direct visual inspection. Pixel statistics are diagnostic, not a claim of full-frame pixel equality. Protected camera trajectories were preserved in source; finite screenshots do not prove every possible intermediate rendered frame on every device.

Evidence: [camera/UI comparison](verification/mobile-mission/comparison.json), [source guards](verification/mobile-mission/source-guards.json), [native project input comparison](verification/mobile-mission/project-inputs.json), [baseline captures](verification/mobile-mission/baseline/report.json), [current captures and hashes](verification/mobile-mission/current/report.json).

## Tests and environments

- Syntax checks: \`npm.cmd run check\`, including both new JavaScript modules.
- **51 existing unit/route/coverage tests**: factory/delivery, study timeline, Lab KIRA routing, Contact routing/coverage and phone layout.
- **${audit.checks.length} mobile interaction checks**: four touch viewports, every domain and archive record, gestures, menu, selection/delivery, studies, native scrolling, repeated navigation, interrupted normal-motion transitions, portrait restoration, browser hash back/forward, context loss and GPU resource stability.
- **${extras.checks.length} extra checks**: all section orientation recovery, workflow/evidence links, DPR3 and initial no-WebGL loading.
- **${projects.checks.length} paired project input checks**, including all nine studies and detail controls.
- Native scroll/resize parity also exercised 320×568, 360×800, 430×932, 760×900, 761×900 and 390×844 against the original source snapshot.
- Existing browser suites reuse the same workspace server through a test-only URL adapter; no additional development server or product URL was introduced.

| Existing browser suite | Result |
| --- | --- |
${legacyRows}

The original camera-handoff test's phone corridor assertion was also observed failing against the untouched baseline. It assumes each target coordinate stays inside the start/end bounding box; the approved phone home-to-arm transition can travel outside that box while its existing springs settle. That protected path was not changed. Compare the [original-source failure trace](verification/mobile-mission/baseline-camera-check.json) and [current trace](verification/mobile-mission/legacy-camera-current.json). The final run passes the other four legacy suites. The aggregate final-checks process therefore reports a nonzero result for that retained assertion; it is not presented as an all-green test run. The dedicated final mobile matrix and protected comparison are separate evidence.

Back/forward verification uses actual hash history entries. Ordinary application buttons retain the existing replaceState behavior; this mission does not introduce a new per-room history stack. External email/social actions were checked for their retained destinations rather than sending messages.

## Remaining limitations and separate-approval items

| Severity | Item | Visitor impact / next step |
| --- | --- | --- |
| Medium, unverified | Physical midrange phones and Safari were not available | Real device frame pacing, touch latency, browser chrome, notch behavior, thermal effects and battery use need device QA; 30 FPS on a phone is not certified |
| Low, test expectation | Legacy phone home-to-arm corridor assertion | The approved transition leaves that test's coordinate box in both baseline and current runs. No new visitor regression was demonstrated. Changing the visual path requires separate authorization |
| Low, protected layout | Some existing project study/footer controls are below a 44px height | Increasing their layout size could alter approved composition; left unchanged and recommended for separate design approval |
| Low, existing breakpoint | Phone widths above 760px use the established wider Lab presentation | Both desks remain functional; 844×390 was checked for preservation. Extending the new instrument layout to those widths is a separate responsive design choice |
| Low, existing content | The Archives Hemas award year and the Sentinel project year differ in existing records | Source content was preserved. Confirm the intended year separately |

No blanket draw-call reduction, shader simplification, model removal, texture downgrade, new smoothing library, scene rebuild or desktop redesign was attempted. Further rendering changes need profiling on real devices and protection-aware review.

## Engineering handoff

Modified application files: \`engine.js\`, \`workshop-hall.js\`, \`engineering-career-lab/lab-controller.js\`, \`index.html\`, \`package.json\`.

New application files: \`engineering-career-lab/mobile-lab.js\`, \`engineering-career-lab/mobile-lab.css\`, \`mobile-behavior.js\`, \`mobile-behavior.css\`.

New verification scripts, JSON results, screenshots, source guards and gallery are in \`verification/mobile-mission/\`. Original source copies for paired tests are under the ignored \`verification/test-results/mobile-mission-baseline/\`. The immutable baseline commit is available if those local copies need reconstructing. Screenshots are intentionally ignored by the repository's existing rules and remain available locally.

Run with this workspace served on port 4175:

\`\`\`powershell
npm.cmd run check
npm.cmd run test:mobile:mission
npm.cmd run test:mobile:regression
npm.cmd run test:mobile:performance
node verification/mobile-mission/extras.cjs
node verification/mobile-mission/project-inputs.cjs
node verification/mobile-mission/source-guards.cjs
\`\`\`

Do not rerun the baseline capture against a modified working tree: it is the protected original reference. Run browser suites serially; concurrent browser loads produced transient connection refusals on the existing Python development server during an earlier diagnostic run. The final capture and verification sequences are serial and retained independently in [final-checks.json](verification/mobile-mission/final-checks.json) and [polish-checks.json](verification/mobile-mission/polish-checks.json). The latter covers the final disclosure adjustment and refreshed paired performance samples. Generated legacy reports are archived under verification/mobile-mission/legacy-reports; only those originally clean report files were restored to their original committed contents after their outputs were saved.
`;
fs.writeFileSync('MOBILE_EXPERIENCE_REPORT.md',report);console.log('Wrote MOBILE_EXPERIENCE_REPORT.md',counts);
