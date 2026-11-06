# Shorts del canal (Remotion)

Este repo es la base de todos los YouTube Shorts del canal. **Antes de hacer cualquier video, leé `BIBLIOTECA.md`**
(estética, mapa del código, recursos y cómo hacer un video nuevo). La plantilla aprobada es `src/final-v2/`
(composición `EfectoSenueloTomiV2`).

## Reglas permanentes del usuario
- Personaje **Tomi V2** (`src/character/v2/`), facciones maduras; vestuario fijo: remera turquesa `#2BB3A3` con franja blanca, pantalón azul, zapatillas crema con turquesa.
- El dibujo **siempre nítido** (sin desenfoque sobre personaje u objetos).
- Gancho con **pregunta directa** y opciones/precios visibles desde el fotograma 0.
- La comparación clave va **grande y centrada** en la zona segura.
- Subtítulos en **carril fijo abajo**; nunca tapan cara, manos que gesticulan, objetos ni textos; nunca saltan arriba. Correr el QA (0 choques, ≥95 % en carril).
- Zona segura Shorts: nada clave bajo y = 1536 ni a la derecha de x = 900.
- Recursos reutilizables en `public/biblioteca/` (`catalogo.json`, `src/biblioteca/sonidos.ts`). Música CC BY: poner el crédito.

## Trabajo
- Ramas nuevas para cada cambio; no tocar `main`. Renders nuevos en carpetas nuevas de `out/` (no sobrescribir).
- No regenerar voces ni gastar créditos de APIs (ElevenLabs) sin autorización. La clave va solo por variable de entorno.
- Render: `npx remotion render <Comp> out/<video>/<nombre>.mp4 --gl=angle` · stills: `node scripts/stills.mjs`.
