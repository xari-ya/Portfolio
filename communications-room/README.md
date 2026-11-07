# Office & Communications / Room 03

The 12 x 6 x 3.6 m office sits behind the Engineering & Career Lab. The Reception button, Contact navigation, final scroll segment, #contact and #communications use the existing sliding doorway. The doors open for the camera and Kira, then close after arrival. The original hall and lab keep their geometry and cameras.

The first room remains unchanged. The office follows its existing Apple-style glass theme: rounded translucent controls, coral primary buttons, subtle edges and shadows, condensed headings, monospace labels and readable body text. CSS reuses the existing glass variables; the physical canvas buttons read the home controls' computed materials and typography. Source-hash guards and computed-style comparisons verify the first room stays intact and the new controls match.

The reference-led room uses the site's graphite, brushed steel, ivory, signal red, condensed type and shared geometry/material helpers. It includes a machined communications display, Get in Touch panel, sloping faceted reception desk, charging pad/cabinet, leather lounge, tripod dome lamp, oval table, red woven rug, side workstation, plants, exposed service ceiling and warm panels. Physical screen artwork stays behind the actors; accessible transparent HTML anchors track the actual camera. Narrow screens and WebGL failure use a readable contact panel.

The latest proportion adjustment reduces the desk to 80%, the laptop from 0.22 to 0.165, and the charging station and Kira to 75%. Kira finishes shrinking on the lab approach, before the office doorway; the engineer stands left of the display buttons. The engineer is 125% of its original height in this room. All scale values live in CommunicationsLayout.scale. The laptop sits at the resized desk's 0.868 m surface, and Kira's track clearance accounts for the smaller pad. The existing engineer, laptop, chair, plants and Kira model builder remain unchanged; placement transforms provide the size changes. A copied renderer layout controls office character height while the original hall height remains 1.5 m.

Drag the scene to look around from the fixed arrival position. camera.js bounds the full horizontal field of view at the wall edges, recomputes limits on resize and bounds vertical looking. The view cannot continue into empty space beyond either side wall. The floor and ceiling continue beyond the viewing side to conceal cut edges throughout the allowed angles. Side aprons become visible after the lab is culled, keeping the earlier room clear; world-aligned floor UVs maintain consistent tile size. The two equal-sized navigation buttons are centred and use the site glass-and-coral hover palette. With either button focused, arrow keys provide keyboard looking and Home restores the composition. The drag hint and Reset View button have been removed. Touch retains normal page scrolling. All control updates use the existing render loop.

The room builds once, caches geometry/textures, and batches static surfaces. Four small procedural textures supply floor joints/scuffs, leather, woven fabric and light halos. The window scenery uses three planes: sky, a campus-garden image, and transparent swaying foliage. No outdoor tree, building or terrain meshes are created. A shared bounded shader provides moving sunlight, mullion shadows, approximate furniture occlusion and rough floor reflections, without another scene, framebuffer or shadow map. Reduced motion freezes environmental animation; offscreen room updates stop its clock.

The built-in imagegen tool generated two decorative bitmap assets, then local WebP exports reduced their size:

- [Display building](assets/building-v2.webp), 90,978 bytes; [prompt and provenance](assets/building-v2.provenance.json).
- [Campus window view](assets/campus-v2.webp), 234,982 bytes; [mobile version](assets/campus-mobile-v2.webp), 63,798 bytes; [prompt and provenance](assets/campus-v2.provenance.json).

The 27 individual build sheets in plans/ cover geometry, reused assets, lighting, materials, scenery and visitor controls. The earlier park files remain in the repository but are no longer requested by this room.

## Verification

With the server on port 4173, run npm run check, npm test, npm run test:communications and npm run test:communications:visual. Browser checks use installed Chrome with software WebGL by default; WORKSHOP_BROWSER_EXECUTABLE selects another Chromium and WORKSHOP_BASE_URL can override the functional test URL.

Functional checks cover desktop contact alignment, mobile reading, entry clearance and door opening/closing, navigation back to Skills, reduced motion, WebGL fallback, and twenty visits without new buffers or textures. Interaction checks exercise actual mouse dragging, both wall stops, immediate reversal, vertical limits, reset, keyboard control, projected contact hit targets, actor sizes on return and environmental animation. Geometry tests trace sampled viewport rays at extreme combined angles over seven screen sizes, including ultrawide, and simulate Kira's pre-entry scale transition along the actual route. Route tests cover shared Kira ownership, doorway traversal and mid-route reversals.

Visual checks validate SHA-256 hashes for protected model/rendering sources and Kira's mesh builder, then capture wide desktop, ordinary desktop and mobile views. Latest captures are in verification/communications/reference-*.png; wall-limit views are left-wall.png and right-wall.png. The pre-Phase-07 office view used 267 scene draw calls; the final Phase 07 software-renderer measurement uses 269, below the 320-call budget, with 53 tracked textures. Software captures verify behavior and composition, rather than hardware frame rates. The lighting uses approximate furniture occluders, rather than full global illumination. The resume control is disabled if its PDF is absent from the checkout.


## Phase 07 reception behaviour

The existing OfficeBehaviour instance owns office lifecycle and attention requests; the hall update remains the sole KIRA pose writer. Native anchors keep their original destinations. First activation lasts 1.6 seconds and return activation 0.65 seconds, without hiding or blocking content. Visible inactivity becomes IDLE at 30 seconds and RESTING at 90 seconds, only after actual docking. Hidden tabs suspend this clock. Reception substates cover entry, approach, alignment, active observation, acknowledgement, rest, wake and exit.

The existing miniature uses its 1.7-second acknowledgement clip and brief bounded looks; no rig or model has changed. The dock indicator follows actual position, alignment and movement. Contact focus drives the existing desk, Get in Touch panel and PCB workstation. Main display artwork is cached; only accents redraw during ambient life. Two existing plant crowns move slightly on desktop; mobile, low quality and reduced motion suppress this motion. The existing daylight shader and layered exterior remain in use. No new reflection renderer, tree shadow maps or outdoor meshes were added.

The supplied original PDF is hosted at the existing root URL. Its SHA-256 is 336c02d9d0d5955846caca81c3854b736a43c80f62e33af09ccf60a033d8c365.

Source checkpoint: verification/communications/phase07/checkpoint. Controller tests: node --test verification/communications/phase07/behaviour.test.cjs. Browser integration/performance checks: npm run test:communications:life; extended idle and equipment checks: node verification/communications/phase07/polish.cjs. Reports distinguish deterministic/accelerated tests from normal-motion browser tests and software rendering from physical GPU measurements.

Phase 07 measured results and limitations: verification/communications/phase07/IMPLEMENTATION.md.
