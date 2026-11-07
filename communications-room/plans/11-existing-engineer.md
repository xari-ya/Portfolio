# 11 / Existing engineer

Reference: supplied Office & Communications diagram. Implemented in room.js unless an existing shared component is identified below. Coordinates are room-local metres unless marked world.

Build: Use the single existing engineer renderer. Pass an office placement after arrival and hide the original hall placement through scene culling.

Placement: Room-local [-2.65, 0, -2.03], yaw +90 degrees in world placement. At the user's request, the office instance is 125% of the hall height (1.875 m). Its feet rest on the floor. A separate renderer layout supplies this placement height; the approved character, animation and renderer source remain unchanged. The hall keeps its original 1.5 m height.

Reuse and budget: Share the approved avatar, skeleton, textures and idle animation. Do not create a miniature duplicate.

Verification: Verify a single visible actor, feet on the floor, correct return to the hall and bounded daylight on the actor.
