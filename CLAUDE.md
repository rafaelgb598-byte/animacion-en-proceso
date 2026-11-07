# Shorts del canal (Remotion)

Este repo es la base de todos los YouTube Shorts del canal. **Antes de hacer cualquier video, leé `BIBLIOTECA.md`**
(estética, organización del repo, recursos y cómo hacer un video nuevo). Plantillas aprobadas:
`src/videos/01-efecto-senuelo/final/` (`EfectoSenueloTomiV2`) y `src/videos/02-stroop/final/` (`GiroDatoStroopV2`).

## Reglas permanentes del usuario
- Personaje **Tomi V2** (`src/canal/personaje/tomi-v2/`), facciones maduras; vestuario fijo: remera turquesa `#2BB3A3` con franja blanca, pantalón azul, zapatillas crema con turquesa.
- El dibujo **siempre nítido** (sin desenfoque sobre personaje u objetos).
- Gancho con **pregunta directa** y opciones/precios visibles desde el fotograma 0.
- La comparación clave va **grande y centrada** en la zona segura.
- Subtítulos (`src/canal/subtitulos/`, reglas en `BIBLIOTECA.md` § Subtítulos; medidas en `src/canal/zonaSegura.ts`): centrados en x = 540, ancho ≤ 720, carril fijo con base en y = 1500 (crecen hacia arriba, nunca suben).
  Páginas cortadas por frase (nunca en «de», «la», «que»…, sin palabras huérfanas). Amarillo solo para la palabra clave (`enfasis`, máx. 1 por página).
  El subtítulo no esquiva nada: el encuadre deja el carril libre de Tomi, objetos y textos (en el 01 el usuario permitió el torso y las piernas de Tomi; nunca su cara ni sus manos que gesticulan). No poner franjas fijas grandes en primer plano para tapar el carril: el usuario las rechazó.
  Antes de entregar: `npm run qa:subs -- <Composición>` con **0 fallas** (mide los píxeles del render).
- Nunca mostrar ni decir el tercer apellido del estudio de 1982; la cita es «Huber et al. · 1982» (lista en `src/canal/qa/prohibidas.ts`).
- Zona segura Shorts: nada clave bajo y = 1536 ni a la derecha de x = 900.
- Lo reutilizable va en `src/canal/` (código) y `public/biblioteca/` (audios, imágenes; `catalogo.json`). Lo exclusivo de un video, en `src/videos/<nn-video>/` y `public/videos/<nn-video>/`. Música CC BY: poner el crédito.
- Voz a velocidad natural (1,0), mastering suave. Tomi mueve la boca con la voz (`lipsync.ts`).
- Videos interactivos: la regla se entiende antes de jugar (ejemplo + cuenta regresiva) y hay tiempo real para responder.

## Guiones y aprendizaje continuo
- Todo lo escrito de cada video (guion, prompts, propuesta, ENTREGA, tomas de voz originales) va en `guiones/<canal>/<nn-video>/` (mismas 4 carpetas que `videosFinal/`).
- **Antes de escribir un guion, leer `guiones/APRENDIZAJES.md`** y el índice `guiones/README.md`; para un video nuevo, partir del guion y del código del video más parecido en vez de empezar de cero (ahorra tokens y créditos).
- **Al cerrar cada versión/video, actualizar `APRENDIZAJES.md`** (qué funcionó, qué el usuario rechazó y por qué, créditos gastados) y su fila en `guiones/README.md`.

## Trabajo
- **Todo vive en `main`** (es lo que se bajan el usuario y su compañero). Antes de empezar, `git pull`; al terminar, commit y `git push` a `main`.
  Si una tarea larga necesita rama, se mergea a `main` y se borra apenas el usuario la aprueba: no quedan ramas viejas dando vueltas.
  Si otra sesión está trabajando en la misma carpeta, no cambiarle la rama ni commitear sus archivos a medio hacer.
- Cada render de video de prueba va a `videosPrueba/<canal>/` (mismas 4 carpetas que `videosFinal/`; nombre `<nn>-<video>-vN.mp4`, sin sobrescribir: numerar `-v2`, `-v3`…) y **se sube al repo** (commit + push) para ir masterizándolo; las pruebas que no sirvan las borra el usuario después. Solo cuando el usuario dice que es la versión final, se decide con él y se mueve a `videosFinal/<canal>/`; la final anterior queda en `videosPrueba/<canal>/` con su número de versión (nada se pierde). El índice de qué video está dónde es `guiones/README.md`. Stills, hojas de contacto y QA van a `videosPrueba/<canal>/qa/<nn-video>/` y se borran cuando el video queda final. **No se usa `out/`** (nada de renders sueltos en `out/` ni en `src/`).
- **Canal Ciberseguridad** (serie «Anatomía de una estafa», sin Tomi, ES + EN): marca y plantilla en `src/canales/ciberseguridad/marca/`, episodios en `src/canales/ciberseguridad/episodios/<nn>/`, recursos en `public/videos/ciberseguridad/`; reglas y cómo hacer un episodio en `guiones/Ciberseguridad/README.md`. Sus videos van a `Ciberseguridad/`.
- **Canal Despiece** (objetos cotidianos por dentro, sin Tomi, **solo español con voseo**): marca en `src/canales/despiece/marca/`, motor reutilizable en `src/canales/despiece/motor/`, episodios en `src/canales/despiece/episodios/<nn>-<objeto>/`, recursos en `public/videos/despiece/`. Voz: **Matías** (`wW8LJCzyKXPO6ftZkssL`, variable `ELEVENLABS_VOICE_ID_DESPIECE`), nunca la de otro canal. Reglas y cómo hacer un episodio en `guiones/Despiece/README.md`. Sus videos van a `videosPrueba/Despiece/` y `videosFinal/Despiece/`. **Mano a Mano** (`src/canales/mano-a-mano/`, `guiones/ManoAMano/`) está en espera: sin código.
- `videosFinal/` tiene 6 carpetas: `GiroDato`, `MilAños`, `Ciberseguridad`, `Despiece`, `ManoAMano`, `Otro`. **Los videos de Tomi (como el efecto señuelo y el Stroop) van siempre a `GiroDato/`.** Los videos de la serie **«1000 años»** (sin Tomi: objetos que envejecen; código en `src/videos/03-1000-anos/`, composiciones `MilAnos…`) van a `MilAños/`. Para otros tipos de video, preguntar al usuario dónde van.
- No regenerar voces ni gastar créditos de APIs (ElevenLabs) sin autorización. La clave va solo por variable de entorno.
- Render de prueba: `npx remotion render <Comp> videosPrueba/<nombre>.mp4 --gl=angle` · stills: `node scripts/stills.mjs`.
