# Communications Office on phones

Checkpoint before this work: `981b51c` (completed mobile UI integration).

The phone office uses the supplied reference for its arrangement and the existing home controls for its colors, glass surfaces, typography, and focus treatment. It activates at 760 CSS pixels and below. The separate room title, central light above the board, network artwork, and foreground rug are omitted in this presentation. Equal Skills Lab and Start Over controls sit above the communications heading, followed by the headline, supporting text, and four vertically stacked original contact links.

The room's existing side walls pivot into shallow wings around the central board. Doors, windows, exterior matte, furniture, and characters retain their existing assets. The desk scales proportionally and its original nameplate retains its aspect ratio and single-line subtitle. The lounge, workstation, and plants receive phone placements. KIRA follows the existing shared route, mapped through a clear left aisle and front aisle to the actual phone dock. The Skills route and character models are unchanged.

`phone.js` contains presentation measurements and transforms, not another behaviour controller or render loop. `room.js` applies them to batched movable groups. `interface.js` projects the existing native controls onto the board using a four-corner perspective transform. Responsive height and spacing fit the content without an internal scroll. `camera.js` leaves the approved phone camera fixed. The office locks page scrolling while active; navigation restores normal scrolling. Pinch zoom, link taps, and desktop camera controls remain available. `behaviour.js` reads the current dock target. The existing hall renderer supplies the viewport, shared actor placements, picking, and phone lighting uniforms. `graphics.js` keeps the phone board background and existing desktop artwork; `daylight.js` adjusts inexpensive lighting approximations. The HTML entry point, package commands, and office-scoped stylesheet wire these changes into the existing site.

## Validation

- `npm run check` and all 32 core factory, delivery, and project-timeline tests passed.
- Seventeen office state, camera-coverage, route-continuity, collision-clearance, and projection tests passed.
- Browser checks cover 320, 360, 390, 430, and 760px phones; no inner board scrolling; 44px contact targets; keyboard selection; native touch link clicks; a fixed view during swipes and wheel input; both navigation destinations; resting/waking; notch/home-indicator safe areas; and repeated orientation/navigation without additional GPU allocations.
- The normal-motion browser check exercises docking through the existing controller with accelerated route stepping, contact-aware head movement, direct KIRA tapping, and no-WebGL fallback. This checks behaviour, not real-time cinematic duration.
- Twelve desktop/tablet views at 1440×900, 768×1024, and 761×900 retain their checkpoint camera poses, active-control measurements, typography, and material styles. Protected model, first-room stylesheet, and Skills-file checks passed.

Reports and screenshots are in `verification/phone-ui/`. Run `npm run test:office:phone` for phone functionality and `npm run test:office:phone:preserve` for comparison with the checkpoint.

## Measured cost and limits

Warmed Chrome SwiftShader samples with reduced motion measured a 3.7% increase in desktop median rendered-frame interval and an 8.3% increase on phones. The movable groups add 58 desktop / 51 phone draw calls and 114 GPU buffers at initial room construction; they add no textures, rendering surfaces, or animation loops. Repeated resizing and navigation reuse those resources. The phone measurement includes the enlarged WebGL viewport and projected native interface. These samples precede the final scroll lock and size adjustment. These software-renderer samples are not measurements of physical phones, Safari, or hardware GPU frame rates.

No new character model, outside world, reflection render pass, or third-party dependency was introduced. The room wraps existing flat architectural sections rather than bending character or furniture geometry.

The approved phone composition is locked. The miniature is 30% larger, the desk about 9% larger, and KIRA about 9% smaller than the initial phone layout. Laptop placement and scale are unchanged. The desk grows around its right edge, maintaining clearance for KIRA.
