# 27 / Follow the first room's theme

Use the first room as the fixed source of the visual language. Do not modify its styles, markup, screens or models. All new styling stays in communications-room/.

The reading panel and navigation use the existing --workshop-glass-* variables. Match the home controls' 13 px corner radius, coral primary material, grey-blue secondary material, thin light border, inset highlight, soft shadows and monospace button labels. Use the existing condensed heading family with lighter weight and normal Arial body copy. Provide pointer-down feedback, visible keyboard focus, reduced-motion and reduced-transparency variants.

graphics.js reads the approved home controls' computed styles for its bitmap button painter. This keeps the physical screen's controls aligned with the same theme while preserving depth testing behind the reused models. The illustration stays above the controls, and the screen bezel follows the first room's machined frame with small red corner accents instead of a continuous neon outline.

Verification: first-room-theme-baseline.json records the first room's source hashes before this theme pass. visual.cjs verifies they are unchanged, compares primary/secondary background images, colors, borders, radii, shadows and font families in the browser, and saves theme-report.json. No styles are applied to the first room.
