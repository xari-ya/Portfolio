# Supplied Lenovo Legion / static hall integration

The active model comes from the user's final `Legion_Pro_5i_16IAX10_Final_v4` directory. The supplied files are preserved in `final-v4-source/`; `provenance.json` records the source path and SHA-256.

`legion-model.js` is a rendering adapter of the supplied `model.js`. Its Builder mesh construction, port geometry, thermal grille offsets, hinge pivot, decals, keyboard and chassis materials are retained. It returns meshes for the existing hall context. It does not create a canvas, WebGL context, camera controller, requestAnimationFrame loop, lid control or RGB control.

The open lid is fixed at 108 degrees, using the final V4 pivot `[0, 0.272, -1.224]`. A restrained engineering-workspace texture replaces the supplied wallpaper. Its control-logic drawing is illustrative, not live laptop telemetry.

The earlier provisional archive is retained in `source/` for provenance only and is not loaded by the portfolio.
