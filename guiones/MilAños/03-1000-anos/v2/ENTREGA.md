# Último en pie — el celular (v2, con voz)

- Video: `videosPrueba/MilAños/03-1000-anos-celular-v2.mp4` (H.264 1080×1920, 30 fps, 1.200 frames, 40,0 s; −14,4 LUFS, −1,38 dBTP).
- Render sin masterizar: `videosPrueba/MilAños/qa/03-1000-anos/v1-v2/v2/03-1000-anos-celular-v2-raw.mp4`. Versión sin voz: `videosPrueba/MilAños/03-1000-anos-celular-v1.mp4`.

## Voz
- ElevenLabs (conector), voz **Isaac – Friendly Young Male** `QmPfzE500cXXHM9uQKGc`, modelo `eleven_multilingual_v2`, una toma por segmento.
- Flujo: https://elevenlabs.io/app/flows/hvCoULwBeqzOLYzCcZ6Q
- **Créditos consumidos: 426** (hook 32 · week 28 · year1 46 · year10 59 · year50 51 · year200 69 · year1000 79 · winner 50 · photo 12). La estimación previa no cobró.
- Tomas originales: `guiones/MilAños/03-1000-anos/v2/voz-original/*.mp3`.
- Edición sin créditos (`node scripts/edit-voz-1000-anos-v2.mjs`): `year200` con pausas acortadas a 0,2 s (6,6 → 5,5 s); `year1000` recortado a «Mil años.» (las cifras de aluminio y PET quedan solo en las etiquetas, no entraban antes de la carta).
- Entradas en `VOICE_CUES` (`src/videos/03-1000-anos/v2/timeline.ts`); frases y tiempos en `src/videos/03-1000-anos/v2/episodes/celular.voz.json`.
- Efectos con ducking al 40 % mientras habla.

## Efectos
- Los 14 efectos son sintetizados por código (`scripts/gen-sfx-1000-anos-v2.mjs`), sin bancos ni licencias.

## Subtítulos
- Carril fijo abajo (apoyan en y = 1530), una frase por vez; 100 % en el carril y sin choques con etiquetas, barra ni carta (revisado en stills).
- No se subtitulan el gancho ni «La foto, no.»: ya están escritos en pantalla.
