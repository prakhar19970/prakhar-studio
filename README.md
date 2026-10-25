# Prakhar's Studio

A React + TypeScript portfolio with a live React Three Fiber studio and GSAP scroll choreography.

## Run

- `npm install`
- `npm run dev`
- `npm run build` (TypeScript checks and a Vite production build)

## Edit

- `src/content.ts`: résumé-backed project case studies and career history.
- `src/App.tsx`: navigation, three-chapter tour, project dialogs, biography and contact actions.
- `src/Studio.tsx`: original procedural room, character, scene interactions and camera choreography.
- `src/liteRenderer.ts`: a depth-buffered software fallback for devices without WebGL2. It keeps the same scene and interaction model, with simpler lighting, lower geometry detail and a capped frame rate.
- `src/styles.css`: desktop and mobile presentation, including reduced-motion support.
- `public/assets/`: the supplied illustrated portrait and downloadable résumé.

The studio is loaded separately from the portfolio content. Rendering pauses while it is off screen. Animation can be paused; a user's reduced-motion preference is respected on first load. The character is a stylized interpretation of the supplied illustration, built from geometry, with coding, waving and tablet poses. It is not a photorealistic or motion-captured model.

## Content provenance

Professional details and outcomes are from Prakhar_Shukla_Senior_FullStack_Engineer_Resume.pdf, supplied by the user. The case-study interface artwork is illustrative and is labeled accordingly; it does not represent production screenshots. Contact email and LinkedIn URL come from that résumé.

## Validation

TypeScript and production build checked. Desktop and 390-pixel mobile layouts, guided tour, case-study dialog, navigation and lighting controls were reviewed in the available browser. That browser disables WebGL, so visual QA exercised the software rendering path; the GPU-specific lighting and shadows were not visually verified there.
