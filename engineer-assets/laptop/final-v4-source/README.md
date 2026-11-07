# Lenovo Legion Pro 5i Gen 10 / 16IAX10 — WebGL Edition 4

Static interactive 3D reconstruction of the Lenovo Legion Pro 5i 16IAX10 chassis. Built entirely from **HTML, CSS, JavaScript and raw WebGL 1**. No third-party libraries, images, GLB files, network requests, API keys, bundler or backend.

This is an independently authored visual approximation, not Lenovo engineering CAD or a scan.

## Files

- `index.html` — polished, responsive full-page presentation.
- `viewer-only.html` — compact viewer for embedding in a portfolio.
- `model.js` — the procedural 3D mesh, lighting, textures and camera/hinge interaction.
- `style.css` — page and viewer styling.

## V4: final geometric alignment fixes

This version is based directly on V3. Only these two corrections were made:

1. **Flush rear thermal grille:** The rear assembly (outer faceted shell, twin grille frames, all fins, central thermal deflector and its Lenovo badge) is uniformly lowered by `0.056` model units. Its highest point is now `Y = 0.269`, approximately level with the chassis deck at `Y = 0.270`. Geometry within the grille is unchanged.
2. **Open-lid power-button clearance:** The lid pivot and both hinge barrel meshes move rearward by `0.052` model units, and the power button moves forward by `0.045`. This prevents the bottom of the open screen from overlapping the power button without altering the screen artwork, the chassis, the key spacing, the ports or the stickers.

Everything else from V3 remains: rear-only vents, Intel/RTX decals, flush LEGION lid lettering, the Lenovo rear badge, ports, keyboard, lighting and viewer interactions.

## Run

Open `index.html` in Chrome, Firefox or another modern browser with WebGL enabled.

Drag to orbit, scroll to zoom, choose a named camera preset (including **VENTS**), adjust the lid angle, toggle RGB lighting, or save a PNG snapshot.

To host on **GitHub Pages**, put these four files into a public folder such as `assets/legion/` in your site. Embed with:

```html
<iframe src="./assets/legion/viewer-only.html"
        title="Interactive Lenovo Legion Pro 5i 16IAX10"
        loading="lazy"
        style="width:100%;height:520px;border:0"></iframe>
```

## Testing and performance

- `node --check model.js` passes.
- Offline WebGL mesh instrumentation: see the included model.js; V4 geometry checks verify finite vertex coordinates and successful mesh creation.
- V4 retains the complete V3 experience, other than the two specifically requested alignment corrections.
- This build environment blocks browser WebGL; live visual screenshot verification was unavailable. Check the REAR and 3/4 camera views on your GPU-enabled browser.
- The mesh is generated once and rendering is on-demand; performance depends on browser, GPU and the complexity of the page into which it is embedded.

## Notes on accuracy

External proportions and port connector families follow the 16IAX10 design, but small machining details and materials remain artistically approximated. Side connector cavities are layered meshes, not Boolean cutouts. All logos are text-rendered approximations (not manufacturer vector assets). Not affiliated with Lenovo.
