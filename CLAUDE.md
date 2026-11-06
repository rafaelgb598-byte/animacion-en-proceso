# Shorts del canal (Remotion)

Este repo es la base de todos los YouTube Shorts del canal. **Antes de hacer cualquier video, leé `BIBLIOTECA.md`**
(estética, organización del repo, recursos y cómo hacer un video nuevo). Plantillas aprobadas:
`src/videos/01-efecto-senuelo/final/` (`EfectoSenueloTomiV2`) y `src/videos/02-stroop/final/` (`GiroDatoStroopV2`).

## Reglas permanentes del usuario
- Personaje **Tomi V2** (`src/canal/personaje/tomi-v2/`), facciones maduras; vestuario fijo: remera turquesa `#2BB3A3` con franja blanca, pantalón azul, zapatillas crema con turquesa.
- El dibujo **siempre nítido** (sin desenfoque sobre personaje u objetos).
- Gancho con **pregunta directa** y opciones/precios visibles desde el fotograma 0.
- La comparación clave va **grande y centrada** en la zona segura.
- Subtítulos en **carril fijo abajo**; nunca tapan cara, manos que gesticulan, objetos ni textos; nunca saltan arriba. Correr el QA (0 choques, ≥95 % en carril).
- Zona segura Shorts: nada clave bajo y = 1536 ni a la derecha de x = 900.
- Lo reutilizable va en `src/canal/` (código) y `public/biblioteca/` (audios, imágenes; `catalogo.json`). Lo exclusivo de un video, en `src/videos/<nn-video>/` y `public/videos/<nn-video>/`. Música CC BY: poner el crédito.
- Voz a velocidad natural (1,0), mastering suave. Tomi mueve la boca con la voz (`lipsync.ts`).
- Videos interactivos: la regla se entiende antes de jugar (ejemplo + cuenta regresiva) y hay tiempo real para responder.

## Trabajo
- Ramas nuevas para cada cambio y merge a `main` cuando el usuario lo apruebe. Cada render de video de prueba va a `videosPrueba/<canal>/` (mismas 4 carpetas que `videosFinal/`; nombre `<nn>-<video>-vN.mp4`, sin sobrescribir: numerar `-v2`, `-v3`…). Solo cuando el usuario dice que es la versión final, se decide con él y se mueve a `videosFinal/<canal>/`. Stills, hojas de contacto y QA van a `videosPrueba/<canal>/qa/<nn-video>/` y se borran cuando el video queda final. **No se usa `out/`** (nada de renders sueltos en `out/` ni en `src/`).
- `videosFinal/` tiene 4 carpetas: `GiroDato`, `MilAños`, `Ciberseguridad`, `Otro`. **Los videos de Tomi (como el efecto señuelo y el Stroop) van siempre a `GiroDato/`.** Los videos de la serie **«1000 años»** (sin Tomi: objetos que envejecen; código en `src/videos/03-1000-anos/`, composiciones `MilAnos…`) van a `MilAños/`. Para otros tipos de video, preguntar al usuario dónde van.
- No regenerar voces ni gastar créditos de APIs (ElevenLabs) sin autorización. La clave va solo por variable de entorno.
- Render de prueba: `npx remotion render <Comp> videosPrueba/<nombre>.mp4 --gl=angle` · stills: `node scripts/stills.mjs`.
