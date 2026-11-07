# 24 / Exterior scenery

Reference: supplied Office & Communications diagram. Implemented in room.js unless an existing shared component is identified below. Coordinates are room-local metres unless marked world.

Build: Layer a gradient sky, generated warm campus-garden WebP and transparent procedural foreground foliage behind the window. The nearby glass building and golden foliage follow the supplied reference without outdoor geometry. Use assets/campus-v2.webp or campus-mobile-v2.webp; generation prompt and provenance are in assets/campus-v2.provenance.json.

Placement: Three 16 × 6 m planes beyond local x = 8 m. Desktop and mobile WebP exports are selected on first load.

Reuse and budget: No terrain, outdoor buildings or tree meshes. Upload the park once; sway only the foliage transform. Preserve transparent draw ordering.

Verification: Check sky is behind the park, no opaque foliage rectangle, and the procedural park remains visible if the image fails.
