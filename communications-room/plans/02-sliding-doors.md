# 02 / Sliding doors

Reference: supplied Office & Communications diagram. Implemented in room.js unless an existing shared component is identified below. Coordinates are room-local metres unless marked world.

Build: Place each existing leaf under an animated transform. Slide horizontally into the returns; keep the original leaf meshes, red edge strips and dimensions.

Placement: Existing leaves: 1.17 × 3.36 × 0.10 m; centres x = ±0.61 m. Each travels 1.24 m.

Reuse and budget: Trigger opening before the camera crosses and whenever Kira occupies the doorway. Door animation is excluded from static batching.

Verification: Verify the aperture exceeds 90% on arrival and closes after both travellers return.
