# Sarith / animated engineer delivery

The original approved file remains at `character-assets/refined-character/the-builder-refined.blend`. It has not been overwritten. The new editable source is `sarith-engineer-rigged.blend`.

The rig has 44 deform bones, including two joints per finger, and a maximum of four deform influences per vertex. The approved body, face, hair, clothes, UVs and texture atlas are retained. Original surface-polish helper groups are retained separately from the deform groups. The full 154,523-vertex approved mesh remains in the Blender file, with one armature and one material. A separate 2,400-triangle skin-lid mesh is fitted over the original eyes, with two head-following lid bones; the underlying approved mesh is unchanged. Both material images are packed.

The two web exports contain the same rig and eight authored clips:

- ENGINEER_IDLE
- ENGINEER_WORKSTATION_CHECK
- ENGINEER_OBSERVE_FACTORY
- ENGINEER_GREETING
- ENGINEER_ACKNOWLEDGE
- ENGINEER_PRESENT
- ENGINEER_EXIT
- ENGINEER_RELAXED_IDLE

The Blender bind pose remains the approved T-pose. Animation frame 0 is a relaxed standing pose. The website begins in ENGINEER_IDLE; it never exposes the bind pose between clips. The rig uses Blender Z-up/front -Y and exports standard glTF Y-up/front +Z at the original approximately 0.13 m miniature height. The station applies its shared scale and rotation at runtime.

The desktop mesh contains 107,474 triangles including eyelids and a 4096 px atlas. Mobile contains 58,026 triangles including eyelids and a 2048 px atlas. Meshopt compression and texture conversion use the installed glTF Transform SDK. The character's mesh is not rebuilt each frame. Both exports validate with zero errors and zero warnings; the validator also records its informational notice about EXT_meshopt_compression support.

Build commands, from the portfolio root:

```sh
blender -b --python tools/engineer/rig_and_animate.py
node tools/engineer/optimize.cjs
blender -b --python tools/engineer/audit_rig.py
```

`engineer-*-raw.glb` files are uncompressed export intermediates. The portfolio loads only the two `sarith-engineer-*.glb` files. No packages need to be installed for the current project.

The final rig is intended for these stationary workstation clips. It is not a locomotion or general facial-performance rig. Facial geometry remains rigid to preserve the approved appearance. Idle palms face inward toward the thighs, with soft, varied finger curls and slightly asymmetric elbows. Open-hand greeting and presentation poses remain available. Pelvis, spine, shoulders and knees share a subtle weight shift, with two-link leg poses baked around fixed ankle targets. The runtime adds irregular short blinks and bounded head-led cursor attention with a delayed torso response; it does not rebuild geometry. The full editable rig remains available for later adjustments.

A snapshot of the previous rig is preserved at `revisions/before-neutral-hands-and-blinks.blend`. The immutable approved T-pose source is still separate.
