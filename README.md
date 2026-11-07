# SARITH — ASSEMBLY REQUIRED · Portfolio prototype v2

## What this is
An **offline**, scroll-driven interactive engineering portfolio for Sarith Dodangodage, built with HTML, CSS and a custom WebGL 2 renderer. No CDN, third-party runtime, package install or backend is required.

## Open it
Run `npm start` and visit `http://127.0.0.1:4173`. The local HTTP server is needed to load the supplied character assets. The site has no production JavaScript dependencies. Hardware acceleration/WebGL 2 provides the interactive hall; its illustrated fallback keeps the portfolio, project browsing, résumé and contact available when 3D is unavailable.

## How to experience the site
1. Enter through the existing Kira introduction. The Main Assembly Hall runs its coordinated manufacturing demonstration.
2. Click **Meet Sarith**, select the miniature engineer, or scroll forward to approach his observation workbench. About Me includes his introduction, both undergraduate programmes, interests, direction and existing résumé. On desktop, readable HTML is registered to the physical wall display; phones retain the character above and content below. Reading scroll stays inside that interface; **Explore My Work / Continue to Projects** advances to the existing production-line destination.
3. Use **Back to Workshop** to return, or continue toward the existing project archive and select any of nine CV projects. Their original project-specific presentations remain available.
4. Continue into Inspect or open the project file for contributions, descriptions, technology and existing repository links. Contact remains at the end of the current portfolio.
5. The hall journey follows overview, engineer, production line, assembly and the rear doorway. Select important machinery to inspect it; Escape or Back to Workshop exits inspection. Assembly and conveyor inspections retain limited orbit. The top-right camera and process toolbar is now limited to `/?workshopDebug`.
6. Kira retains his greetings and autonomous routine. Reduced-motion mode holds the engineer still and starts manufacturing paused. Debug Pause freezes manufacturing; Restart returns safely through output/reset. Every loading sequence now opens the workshop overview, including visits with an initial `#about` fragment; section links work normally after arrival.

Implementation, assets, rigging and verification: [The Engineer / About Me](ENGINEER_ABOUT_IMPLEMENTATION.md). Screenshots: [verification gallery](verification/engineer/index.html).

## Content and creative caveats
- Existing project copy was taken from the four-page CV: Obsidian, compost monitoring/TerraVita, JellyCast, SENTINEL, Click Claim, analog FSK IR, HabitSeed, small-business POS and Prajaa. The linked `Sarith_Dodangodage_CV.pdf` is the supplied original r?sum?, restored at its existing resource path.
- Models are **stylized conceptual visualizations**, not the user's exact photographs, finished product renders, technical drawings or production CAD.
- JellyCast is ongoing research, not a proven operational forecast. SENTINEL is remote patient monitoring, not the separate nursing patient-safety research.
- TerraVita's MQ-135 is an air-quality *response* and should not be represented as a selective CO₂/O₂ measurement instrument.
- No invented awards, testimonials, usage statistics or performance metrics are embedded.

## Notes for further production development
The current experience is a prototype; for a production website, replace conceptual 3D with verified CAD/photography and project documents, build concise project case-study pages, test across real graphics hardware, implement SEO and optimize graphics performance under heavy load.

## Structure
- `index.html`: interactive experience and project file interface
- `style.css`: editorial art direction and responsive style
- `engine.js`: scroll choreography, project database, interaction events, offline WebGL 2 geometry + renderer
- `workshop-system.js`: authoritative fixed-step manufacturing controller and arm kinematics, shared with the tests
- `workshop-hall.js`: retained mechanical models, coordinated scene animation, station picking, guided cameras, materials and lighting
- `kira-loader.js`: existing five-stage entrance, retained
- `verification/`: browser automation, controller tests, screenshots and measured results
- `workshop-appearance.js`, `workshop-shadows.js`: shared lighting, static bay dressing and selective workcell shadows
- `homepage-appearance.css`: homepage and entrance theme, local licensed typography
- `Sarith_Dodangodage_CV.pdf`: supplied original r?sum?



## V6 TerraVita unified WebGL model
The user's TerraVita Rev 4 model is extracted directly and embedded inside `engine.js` as losslessly rebatched, compressed vertex/normal data. It renders on the existing WebGL canvas, with no iframe or external viewer. WORK: scroll gathers the device from separated internal subsystems; INSPECT: the same model opens to expose its internals. Open `index.html` directly in a browser. See `TERRAVITA_MODEL_V6.md` for provenance and source measurement caveats.

## Main Assembly Hall refinement / V22

See [V22_WORKSHOP_REFINEMENT.md](V22_WORKSHOP_REFINEMENT.md) for the implementation and verification record. The room, articulated arm, detailed rotary workstation, conveyor, three computing cabinets, approved Kira geometry, introductory copy, portfolio navigation and loader remain in place. No additional rooms are implemented.

Playwright is installed as a project-local development dependency. Run `npm run check` and `npm test` for syntax and controller verification. With `npm start` running, `npm run test:browser` checks a complete live cycle, physical component ownership, station interactions, existing navigation, mobile touch scrolling, reduced motion and graphics failure. It writes `verification/browser-report.json` and screenshots. The browser helper reuses an installed Chromium; `WORKSHOP_BROWSER_EXECUTABLE` can select another installed Chromium binary. `WORKSHOP_BROWSER_ANGLE=swiftshader` selects software rendering when hardware OpenGL is unavailable.

Development inspection is available at `/?workshopDebug`: `window.__workshopDev.setTime(seconds)` replays and pauses the same controller, `run()` resumes it, and `state()` exposes physical transforms, monitoring state and rendering counters. These inspection functions are absent from ordinary page loads.

## Homepage and engineer display / November 2026

The red-and-graphite visual pass retains the original main assets and manufacturing behaviour. It brings the engineer bay forward, adds fitted lighting, shelving, tools, plants and a chair, and restyles the wall display with a machined bezel and accessible icon tabs. The homepage introduction occupies the lower-left floor area with a larger name and seamlessly feathered blue-black backdrop. Kira patrols the usable width of the foreground and exchanges arrival/departure gestures with the engineer. The control monitor shows the actual five joint matrices; the retained Legion displays a separate, static electronics/PCB workspace. The existing five-stage entrance uses the same palette and fixtures.

See [implementation and verification](HOMEPAGE_VISUAL_REFINEMENT.md) and the [screenshot gallery](verification/homepage/index.html). With the server running, `npm run test:homepage` verifies the public interface, startup destination, protected assets and rendering budget. The Git restore tag is `restore/before-homepage-redesign-2026-11-02` (`176a150`).

## Office & Communications / Room 03

The existing Skills Room reception doors now connect to the 12 × 6 m communications office. Use Contact, the lab Reception button, or continue scrolling after Experience Archives. The room reuses the engineer, Kira and supplied laptop, with accessible contact actions, a lounge, layered exterior scenery and moving daylight. See [room documentation](communications-room/README.md) and [component build sheets](communications-room/plans/). Run `npm run test:communications` with the local server running. The résumé PDF remains unavailable in this checkout.
