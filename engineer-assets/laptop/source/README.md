# Lenovo Legion Pro 5i — 16IAX10 WebGL model

A **working, interactive 3D recreation** of the 2025 Lenovo Legion Pro 5i Gen 10 / Legion Pro 5 16IAX10 chassis (83F3). Built entirely with **HTML, CSS, and vanilla JavaScript**. No image assets, 3D packages, build tools, dependencies, or external network calls are required.

## Files

- `index.html` — polished standalone showcase and full-size controls.
- `viewer-only.html` — compact, embeddable version of the same 3D laptop.
- `style.css` — standalone showcase styling.
- `model.js` — WebGL shaders, procedural 3D meshes, textures, camera, controls, hinges, animation.
- `README.md` — instructions.

## Run

Open `index.html` or `viewer-only.html` in Chrome, Edge, Firefox or another browser supporting WebGL 1. Nothing is installed. A local HTTP server is **not** required because there are no ES module imports, fetch calls or external assets.

## Put on GitHub Pages

1. Copy these files to a directory in your portfolio repo, e.g. `assets/legion/`.
2. Push to your GitHub Pages branch.
3. Link to `assets/legion/index.html`, or embed `viewer-only.html` using:

```html
<iframe
  src="./assets/legion/viewer-only.html"
  title="Interactive 3D Lenovo Legion Pro 5i"
  loading="lazy"
  style="display:block;width:100%;height:min(620px,75vh);border:0"
></iframe>
```

The paths must match your repo structure. For GitHub Pages project sites, prefer relative paths over root-relative paths.

## Features

- Model shell matches the approximate **364.38 × 268.06 mm** footprint.
- Physical display housing and real **hinge animation** controlled by a slider.
- Individual molded-looking keyboard key meshes and a six-row full-size deck with numpad, arrow keys, and RGB zones.
- Modeled keyboard tray, trackpad, power button, hinges, faceted rear vents, side vent fins, side port recesses, bottom cooling grilles, lid logo.
- Original JavaScript-painted blue/purple screen artwork (not a Lenovo screenshot).
- Orbit/pinch-equivalent drag, wheel zoom, 6 camera presets, RGB toggle, PNG save.
- Responsive canvas resolution cap, no runtime timers while idle and no additional graphics libraries.

## Limitations / accuracy

This is **independent fan-made visualization**, not an exact engineering/CAD model. Fine vent layouts, port socket locations, keyboard language legends, wallpaper and branding details are approximations. It is geometrically three-dimensional and usable in WebGL, but **not a GLB or Blender file**. The lid surface and keyboard are intentionally simplified for browser efficiency. It is not connected to or endorsed by Lenovo.

Lenovo PSREF chassis specs: https://psref.lenovo.com/Product/Legion_Pro_5_16IAX10

## Customization

In `model.js`:

- `paint` changes chassis and keys color palette.
- `screenTexture()` draws the default wallpaper (pure Canvas 2D).
- `keys` / `row(...)` define keyboard legends, key sizes, and positions.
- `views` changes camera presets.
- `frameScale()` adjusts automatic zoom for narrow canvases.
- `lidMat` in `render()` controls the lid hinge pivot and angle.

For a bare canvas without controls, adapt `viewer-only.html` and provide corresponding control selectors or remove the event listeners from `model.js`.
