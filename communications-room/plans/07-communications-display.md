# 07 / Communications display

Reference: supplied Office & Communications diagram. Implemented in room.js unless an existing shared component is identified below. Coordinates are room-local metres unless marked world.

Build: Build a chamfered steel bezel, restrained red corner accents, countersunk fasteners and physical canvas display. Match the first room's dark screen substrate and rounded glass controls. Read the approved home buttons' computed material, border, radius, font family and text colors for the canvas artwork. Keep the canvas depth-tested behind the existing engineer and laptop. Project transparent semantic contact anchors onto the four canvas buttons; redraw only for hover, focus, press, asset load or availability changes.

Placement: Visible face 7.5 × 2.5 m; centre [0.6, 2.12, -2.845]. HTML frame 1200 × 448. Project anchors with the current visitor camera, including drag offsets.

Reuse and budget: Reuse the existing contact anchors and lab projection helper. Use a reading panel on narrow screens and when WebGL is unavailable.

Verification: Test email/social destinations, keyboard focus, return buttons and unavailable résumé behavior.

Button alignment: Project each button's four corners independently and clip its transparent click area to that exact quadrilateral. Hover artwork is painted once on the physical canvas, avoiding a second offset HTML border while the camera turns.
