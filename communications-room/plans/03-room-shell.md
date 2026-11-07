# 03 / Room shell

Reference: supplied Office & Communications diagram. Implemented in room.js unless an existing shared component is identified below. Coordinates are room-local metres unless marked world.

Build: Build charcoal floor and back wall from shared boxes. Leave the shared entrance and right window open. Use shallow ribs rather than complex wall models.

Placement: 12 × 6 × 3.6 m. Origin [0.5, -0.06, -31.5], rotated 90 degrees. Local +x points toward the window; +z points into the foreground.

Reuse and budget: Lazy build on first approach, then retain cached geometry. Cull the original hall after entering.

Verification: Check a flush floor, no visible cracks at the portal, and no allocations during repeated visits.

Camera coverage: Extend the main floor/ceiling to local z = +8 and add narrow side aprons at the open viewing side, reaching 20 m overall width. Material batching keeps this to two additional draw calls. Hide the side aprons until the lab is culled to prevent overlap during entry. Floor UVs follow room coordinates, preserving square tile size and continuity across the extension. Office lighting applies consistently across the extension. Camera bounds keep horizontal rays within the completed side walls.
