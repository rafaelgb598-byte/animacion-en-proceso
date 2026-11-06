# 1000 años — Celular v4 · Entrega

- **Final (aprobada):** `videosFinal/MilAños/03-1000-anos-celular.mp4` (era `videosPrueba/MilAños/03-1000-anos-celular-v4.mp4`). H.264, 1080 × 1920, 30 fps, 1.327 frames, 44,2 s. Audio a −14,6 LUFS, −1,4 dBTP.
- **RAW:** `videosPrueba/MilAños/qa/03-1000-anos/v4/03-1000-anos-celular-v4-raw.mp4`.
- **Hoja de contactos:** `videosPrueba/MilAños/qa/03-1000-anos/v4/stills/contact-sheet.png`.
- **Composición:** `MilAnosCelularV4` (`src/videos/03-1000-anos/v4/`). La v3 no se tocó.

## Decisiones del usuario

- Carta sin cifra: «sigue ahí después de 1.000 años», en lugar de «~1.000.000 de años», que no tiene respaldo.
- Epílogo con la frase de la memoria. Por eso dura 44,2 s, por encima de los 38–42 del prompt.
- La invitación a comentar va solo como texto, sin voz.

## Voz

- **0 créditos nuevos.**
- La toma `v3photo` se recortó: se quitó «La foto.» del principio (`scripts/edit-voz-1000-anos-v4.mjs` → `v4memory.wav`).
- El remate «La foto, no.» usa la toma de la v2.
- `v3close` («Los restos duran siglos…») ya no se usa.
- Los tiempos por palabra de los subtítulos son estimados (proporcionales al largo dentro de cada frase medida).
