# Jafar Alhadithy — scrolling prototype

Three.js portfolio blockout: exported white matte wireframe → diagonal noisy solid-material reveal with triangle particles → stationary chair surrounded by a spherical room reveal → straight, front-facing exit through the window. Background: #eeece5. Original FBX and GLB exports are untouched.

Serve this folder over HTTP; ES modules and GLB loading will not work reliably from file://. For GitHub Pages, upload the folder contents (index.html, app.js, assets and vendor) to the publishing root.

## Lighting and performance
- Studio: main and rim point lights, warm ambient fill, and a directional shadow light with a shadow-only receiver matching the flat background.
- Interior: warm side directional sunlight through the window, one shadow map, dark blue ambient at 0.45 intensity. No interior point light. Ceiling and walls contain the warm illumination.
- Exterior: directional sunlight and ambient fill.
- Light intensity fades by scroll position; zero-weight lights and groups become invisible and are excluded from rendering.
- Original chair geometry provides an invisible full silhouette shadow caster (color and depth writes disabled). The exported wireframe uses white matte material. Complementary shader masks blend it into the solid chair from upper left to lower right with noise.
- Room shader reveals world-space spherical distance from the chair, perturbs the edge with noise, and displaces vertices at the boundary. Its depth shader uses the same reveal so unrevealed walls do not cast phantom shadows.
- Triangle effects use two instanced draw calls (65/90 particles on mobile, 150/220 on desktop) and switch off outside transitions.
- No point-light shadow maps, no postprocessing, no screen-space AO. One 64×64 procedural interior contact-shadow texture. Directional shadow maps update only during scroll movement or loading.
- Rendering stops when scroll smoothing settles and while the tab is hidden.
- Mobile: 264 KB chair, pixel ratio capped at 1.25, 512px shadow map, no multisample antialiasing. Desktop: 732 KB chair, pixel ratio capped at 1.75, 1024px shadow map.
- Three.js 0.180.0 is served locally, with its MIT license included. No CDN, external fonts, video, analytics or framework.
- Scene buttons support keyboard navigation; reduced-motion preference removes scroll interpolation.

This is a lighting and movement prototype. Architecture and furniture intentionally use cubes. Physical mobile-device performance still needs testing.
