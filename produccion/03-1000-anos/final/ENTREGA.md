# 1000 años — Celular V3 · Entrega

- **Final:** `out/1000-anos/final/1000-anos-celular-v3.mp4`. H.264, 1080 × 1920, 30 fps, 1.350 frames, 45,0 s. Audio a −14,4 LUFS, −1,29 dBTP.
- **RAW (sin masterizar):** `out/1000-anos/final/1000-anos-celular-v3-raw.mp4`.
- **Hoja de contactos:** `out/1000-anos/final/stills/contact-sheet.png` (26 frames a 360 px).
- **Composición:** `MilAnosCelularV3` (`src/videos/03-1000-anos/final/MilAnosCelularV3.tsx`), registrada en `Root.tsx` en la carpeta «1000-anos».

## Voz (Isaac `QmPfzE500cXXHM9uQKGc`, `eleven_multilingual_v2`)

- **Nuevas, 381 créditos en total:** v3hook 48 · v3power 83 · v3remains 47 · v3before 56 · v3photo 86 · v3close 61.
- **Reutilizadas de la V2 (0 créditos):** year1, year10, year50, year200, year1000.
- **Tomas originales:** `produccion/03-1000-anos/final/voz-original/`.
- **Edición:** `node scripts/edit-voz-1000-anos-final.mjs` genera `public/videos/03-1000-anos/final/voz/*.wav` y `src/videos/03-1000-anos/final/voz.json`.

## Efectos

- Reutilizados de la V2: `public/videos/03-1000-anos/v2/sfx/`.
- **Nuevos, sintetizados** (`node scripts/gen-sfx-1000-anos-final.mjs` → `public/videos/03-1000-anos/final/sfx/`): photo-motif, data-loss, wood-creak, panel-thud, soil, glass-tick.
- Formas de onda de los nuevos: `out/1000-anos/final/sfx-waves/`.

## Control de calidad medido

- **Loop:** f0 vs f1349 → 0,38/255.
- **Continuidad:** 219/220 → 1,60 · 494/495 → 0,47 · 599/600 → 0,54 · 679/680 → 3,68 (cae dentro de un salto de timelapse).
- **Contraste:** 6,45–15,55:1 en el gancho, el contador, los subtítulos, las indicaciones y los rótulos chicos.
