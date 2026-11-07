# Skills Station and Experience Archives refinement

Checkpoint before implementation: `67e792b`. Approved Communications checkpoint: `8a82966`.

## Reference inventory and placement corrections

| Area | Reference elements and implemented corrections |
| --- | --- |
| Skills screen | Four-domain overview, selection prompt, domain icon rail, return control, descriptive panel, cached technical artwork, technology chips, and registry-backed project evidence. PCB artwork includes traces, pins, components and connectors; robotics uses a rover wireframe; software uses a surface plot/code pane; instrumentation uses channel graphs. |
| Skills worktop | Scope on the left, soldering/electronics in the center, existing laptop to the right. Added probe tray, wire reel, connector bins, raised development module and breadboard. Lowered the service panel that obscured the screen from the overview camera. |
| Domain demonstrations | Embedded board, bounded wheeled rover, software preview workstation, or plant/sensor chamber. Reused equipment controllers and the room update loop; mutually exclusive demonstration roots. |
| Return bench | Genuine perpendicular extension, shortened from 4.12 to 2.60 authoring units; aligned tops, proportional drawers and corrected bounds. |
| Vitrine | Separate narrow supported stand to the right of the main bench. Transparent glazing replaces the opaque walls that hid the car. Existing concept car reused. |
| Instrument rack | Benchtop instruments remain on the left. Trailing plant moved outside the rack so foliage does not intersect equipment. |
| Archive screen | Achievements default; two upper and three lower award cards. Leadership has five rows; Experience has four. Added distinct icons, date/calendar treatment, role badges, timeline markers and illustrated summary panels. Native and physical screens use the same records and selection. |
| Archive shelves | Equipment cases above, book rows on left, recognition frame at upper right, continuous orbital trophy below it, and two smaller faceted awards. No invented certificate credentials. |
| Architecture | Charcoal backboards and beveled screen casings. Warm shelf/task illumination moved to match resized geometry. Retained central Communications door; horizontal 4.6 by 1.1 m sign above it. |
| Foreground | Stacked crates and low bench on left; service bench, instrument and stool on right. Brought inside the overview camera frame while leaving the central aisle clear. |
| Foliage | Shared curved leaf mesh for lab plants; only two plant roots animate to limit draw overhead. Original office plant builder retained separately so the approved office appearance does not change. |

## State and integration

- Extended `EngineeringLab` with validated archive selection; preserved domain selection and `LabSkillsInterface.projectPlane`.
- Station centers are x +/-4.9, z -23.7, uniform scale 0.55, with inward yaw +/-0.22 radians after visual comparison. Shell is 16.4 m wide and about 5.2 m high. Overview frames both stations from near the front threshold; close-ups include display and worktop.
- One shared KIRA instance and movement route. Revised lab parking/attention targets and visible reduced-motion placement. No additional camera controller or animation loop.
- Education removed from lab data, controls, physical artwork and university illustration. About Me education source remains unchanged.
- Desktop controls use existing glass variables, typography and warm accent. Existing phone structure and camera presets are retained; shared content/geometry changes still apply.
- Communications code changes only route its shared plant call to the preserved original builder. Its layout, camera presets, contacts, mobile scales and scroll lock are retained.

## Validation

- Syntax check, 32 core tests and six KIRA route tests.
- Actual Chrome browser checks: all four domain selections, keyboard selection and return control; three archive categories and row containment; reduced-motion KIRA; repeated selections/visits without GPU resource growth; existing phone panels and Communications contacts/scroll-lock release.
- Normal-motion equipment/foliage update, contextual visibility, resource stability and rapid navigation checks are included in `verification/lab/refinement-check.cjs`.
- Reports: `verification/lab/refinement-report.json` and `verification/lab/refinement-performance.json`. Rendered comparison views: `verification/lab/refinement-*.png`.

Final warmed software-renderer comparison: median frame interval 1366.7 ms before / 1383.4 ms after (+1.22%). Draw calls 384 -> 386; tracked GPU buffers 4570 -> 4656; textures 39 -> 43. Four static supporting textures are added; repeated interactions do not allocate additional GPU resources. Chrome SwiftShader is a software renderer; these timings cannot establish physical GPU or phone FPS. Physical-device/Safari tests and photographic fidelity are not claimed.

No new renderer, external model, animation library, reflection pass or outside world was added. The existing procedural renderer still limits material realism compared with the supplied reference renders.

## Files modified

- `refinement.js`, `refinement.css`: cached domain artwork, shared archive records, screen composition and desktop controls.
- `skills/skills-data.js`, `skills/furniture.js`, `skills/equipment.js`: available categories, display painters, proportional furniture, contextual demonstrations and worktop props.
- `room/lab-room.js`, `room/lab-dressing.js`: authoritative layout, room shell, shelving, recognition objects, foliage and foreground props.
- `lab-controller.js`, `lab-kira-route.js`, `interface/skills-interface.js`: archive state, route targets, native projection and interaction integration.
- `../workshop-hall.js`: lab lighting positions/intensity and shared KIRA positioning.
- `../communications-room/room.js`: uses the preserved original shared plant builder.
- `../index.html`, `../package.json`: integration and verification command.
- `../verification/lab/refinement-{check,performance}.cjs` and JSON reports: running-site verification and baseline comparison.
