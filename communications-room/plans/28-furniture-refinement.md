# Warm industrial furniture refinement

Checkpoint before implementation: `92e5a96`.

The existing couch is now at room-local [5.38, 0, 0.10], yaw -90 degrees, parallel with the window wall. A shared graphite rug with brick-red edging sits under its front feet and the coffee table. The timber-topped table at [4.32, 0, 0.10] uses a thin dark apron, two brushed-metal U frames, a lower shelf and a tray holding the existing books and cup. The table is 1.28 by 0.60 m and stops at room-local z = 0.74, leaving 0.51 m to KIRA's approach centerline at z = 1.25. The relocated floor lamp and analytic couch shadow use the new physical placements.

The left workstation moves toward the camera to [-5.40, 0, 2.05], with its chair at [-4.72, 0, 2.12]. Its 1.62 m top leaves a 0.5 m gap beyond the doorway. A supported shelf frame, recessed drawer handles, concealed monitor support, timber surfaces and restrained warm edging replace the old thin desk. The monitor retains its original painter and GitHub reaction. The two unchanged placeholder cars have named office-car-mount-0/1 parent groups for future model replacement.

The rear-left vine is replaced with seven curved broad leaves in a tapered planter. The foreground hanging vine is replaced with a nine-leaf snake plant in the workstation's front planting pocket. Leaves use shared double-sided meshes with separate front/back vertices to preserve normals. The two right-side plants retain their existing movement support. New left plants remain statically batched.

One deterministic 256-square timber texture is shared by both tables and the display shelves. No new render loop, external model, reflection pass or dependency is introduced.

Verification: furniture.cjs captures overview, left/right and mobile views, compares warmed software-rendered performance against the checkpoint, checks navigation resource reuse and confirms the GitHub workstation response. Functional results are in verification/communications/furniture-report.json; the separate --perf-only run writes furniture-performance.json. The initial comparison found a slowdown, prompting a simpler axis-aligned sofa shadow and consolidated botanical/material batches. Software rendering measurements do not represent physical GPU performance.

furniture-clearance.cjs derives the table footprint from its actual mesh and placement in the running website, then samples the shared KIRA controller's complete route with a 0.34 m safety radius. It requires more than 0.10 m additional clearance and verifies the table stays parallel to the walls. Its result is furniture-clearance.json.

Final measured route clearance is 0.186 m beyond the safety radius. After material consolidation the scene uses 274 draw calls versus 269 at the checkpoint, and 54 textures versus 53. Geometry-kit object count falls from 980 to 782. Forty-eight warmed software-rendered samples show median intervals +1.88% desktop and +0.03% mobile. P95 rises 10.70% desktop and 13.04% mobile, missing the 10% tail-latency target; physical GPU performance is unmeasured. Functional checks, protected-model checks, contact hit alignment, navigation resource reuse and route clearance passed. The initial functional report's timing figures predate the shader/material optimizations; use furniture-performance.json for the latest comparison.
