# 25 / Sunlight and shadows

Reference: supplied Office & Communications diagram. Implemented in room.js unless an existing shared component is identified below. Coordinates are room-local metres unless marked world.

Build: Compile one bounded daylight function into the room and shared actor shaders. Project through the window aperture and mullions, with simple desk/sofa occlusion.

Placement: Sun points toward local +x with elevation proportional to 0.47; very slow direction and cloud modulation share the room clock.

Reuse and budget: No added shadow maps. Cheap ray/box tests provide approximate furniture shadows; desk-strip spill and contact darkening anchor objects.

Verification: Verify changing daylight, fixed aperture shadows, paused offscreen updates and a frozen clock under reduced motion. Hardware frame rates require a separate device benchmark.
