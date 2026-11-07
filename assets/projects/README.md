# Existing project studies

These previews are captures of the portfolio's existing WebGL models and demos,
not photographs or proof of completed hardware. They let discovery reuse the
earlier work without loading a detailed model for every hovering preview.
Discovery holograms and their preview cards use `*-model.jpg`: model-only
captures of the current first study chapter. They exclude navigation, page
copy and callouts. The older `*-first.jpg` references contain complete pages
and are retained as references, but are no longer used for discovery.

`verification/production/capture-lead-images.cjs` refreshes these eight model
captures against a local server. It uses a plain background and crops to the
model bounds. On Windows, set `WORKSHOP_BROWSER_ANGLE=d3d11` before capture.

`verification/production/capture-previews.cjs` captures the original renderers on
the same canvas. Obsidian reuses the layered micromouse, TerraVita the supplied
Revision 4 instrument, JellyCast the existing coastline/research visualization,
and Kira the approved companion. The other six entries reuse their original
concept studies. Detailed studies remain accessible through the assembly view.

Project copy and development status live in `project-registry.js`. JellyCast's
map and jellyfish effects are illustrative; no forecasts or live measurements
are claimed. The catalogue's translucent pallets are projected previews. Only
the selected opaque carrier is a real workpiece in the manufacturing controller.
