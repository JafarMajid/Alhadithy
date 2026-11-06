# Jafar Alhadithy — scrolling prototype

Three.js portfolio blockout: wireframe chair → grey material → furnished cube room → building exterior. Background: #eeece5. Original FBX is untouched.

Serve this folder over HTTP; ES modules and GLB loading will not work reliably from file://. For GitHub Pages, upload the folder contents (index.html, app.js, assets and vendor) to the publishing root.

## Lighting and performance
- Studio: main and rim point lights, warm ambient fill, and a directional shadow light with a shadow-only receiver matching the flat background.
- Interior: side directional sunlight with one shadow map, matching point fill, warm ambient.
- Exterior: directional sunlight and ambient fill.
- Light intensity fades by scroll position; zero-weight lights and groups become invisible and are excluded from rendering.
- No point-light shadow maps, no postprocessing, no screen-space AO. One 64×64 procedural interior contact-shadow texture. Directional shadow maps update only during scroll movement or loading.
- Rendering stops when scroll smoothing settles and while the tab is hidden.
- Mobile: 264 KB chair, pixel ratio capped at 1.25, 512px shadow map, no multisample antialiasing. Desktop: 732 KB chair, pixel ratio capped at 1.75, 1024px shadow map.
- Three.js 0.180.0 is served locally, with its MIT license included. No CDN, external fonts, video, analytics or framework.
- Scene buttons support keyboard navigation; reduced-motion preference removes scroll interpolation.

This is a lighting and movement prototype. Architecture and furniture intentionally use cubes. Physical mobile-device performance still needs testing.
