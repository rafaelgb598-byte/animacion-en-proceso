# PROMPT MAESTRO — Short «Decí el color» (efecto Stroop) · Remotion

Sos el desarrollador y animador de un nuevo YouTube Short vertical en mi proyecto de Remotion. Es el **episodio 2 del mismo canal** que `DecoyShort` (efecto señuelo): tiene que verse y sonar como del mismo universo. El trabajo termina cuando pasa el control de calidad de la sección 9, no cuando compila.

## 0. Reglas de trabajo (obligatorias)

1. **Sin servicios pagos** salvo la API de ElevenLabs para la voz, con los límites de la sección 6. No uses el conector MCP de ElevenLabs: la voz se genera solo con `scripts/gen-voice.mjs`.
2. **La clave de ElevenLabs es secreta**: leela solo de la variable de entorno; nunca la imprimas ni la copies.
3. **Nada destructivo.** No borres ni sobrescribas nada de `DecoyShort`. Si usás git, trabajá en la rama `short/stroop` y no hagas push.
4. **No instales nada sin consultarme.** Mostrame una lista consolidada y esperá mi OK.
5. Si algo cambia en el código y no lo hiciste vos, lo hice yo: no lo pises.
6. **Sé honesto en el informe**: si falta la voz o algo no quedó como se pide, decilo.

## 1. Paso 1 — Inspección y reutilización (antes de escribir código)

1. Cargá el plugin de Remotion (`remotion-best-practices`) si está disponible.
2. Recorré lo que ya existe del Short del señuelo: `src/decoy/` (`theme.ts`, `timeline.ts`, `script.ts`), `src/components/` (Camera, Backdrop, Headline, MonoLabel, Captions, AudioLayer, CitationCard, CountdownRing, SafeZoneOverlay), `src/lib/` (`time.ts`, `anim.ts`), `scripts/gen-voice.mjs`, `scripts/gen-sfx.mjs`, `scripts/make-captions.mjs`.
3. **Ubicá a Tomy**, el personaje del Short anterior: su componente, sus props, poses y expresiones disponibles. **Reutilizalo tal cual**: mismo diseño, proporciones, colores y forma de animarse. No lo rediseñes. Si no encontrás ningún componente de Tomy, frená y preguntame.
4. **Regla de universo:** todo lo que ya exista se *importa y reutiliza* (no se copia ni se reescribe). Si un componente necesita una variante, agregale props con valores por defecto que mantengan exactamente el comportamiento actual de `DecoyShort`. Lo compartido del canal (paleta, fuentes, fondo, grano, cámara, curvas, subtítulos, sonido) pasa a vivir en un lugar común (por ejemplo `src/brand/`) si todavía no está; si lo movés, `DecoyShort` tiene que renderizar idéntico (comprobalo comparando sus frames 0, 390 y 1349 antes y después).
5. Escribime un resumen breve de lo encontrado y del plan, y seguí.

## 2. El video

- Composición: id `StroopShort`, 1080 × 1920, 30 fps, **960 frames (32 s)**. Puede ajustarse ±60 frames para seguir a la voz real.
- Tema: el efecto Stroop. El espectador tiene que decir en voz alta **el color de la tinta**, no la palabra. Con palabras que coinciden con su color es fácil; cuando no coinciden, se traba.
- Público: 16–35 años, español rioplatense (voseo). Narradora: la misma voz del Short anterior (`ELEVENLABS_VOICE_ID`).
- Idea central: **el espectador lo vive**, Tomy lo vive con él. La explicación llega recién después de que se trabó.
- Un único plano secuencia, sin cortes, igual que el episodio 1. El frame final es visualmente idéntico al frame 0 (loop sin costura).

### Rigor

- Cita en pantalla: «Stroop · 1935» y debajo «Journal of Experimental Psychology».
- La narración dice «casi todos» (no «todos»). No digas que mide inteligencia.

## 3. Estética (la misma «Mesa de evidencia»)

- Mismo fondo (mesa oscura, foco cálido, viñeta, grano animado), misma cámara con `perspective` y deriva senoidal, mismas sombras, radios, curvas de animación y subtítulos que el episodio 1. Tomar todos los valores de `theme.ts` y `anim.ts`, no escribirlos de nuevo.
- Tipografía: las mismas tres familias. Las palabras de la prueba van en **Inter Tight 800, 170 px, mayúsculas**, centradas en (520, 760).
- **Tintas de la prueba** (tokens nuevos en el theme, solo para las palabras de la prueba). Contraste contra #0A0B0D calculado: todos ≥ 5:1.

| Token | Hex | Contraste |
| --- | --- | --- |
| inkRed | #F0443A | 5,2:1 |
| inkBlue | #3D8BFF | 5,9:1 |
| inkYellow | #F5D547 | 13,6:1 |
| inkWhite | #F3EFE6 | 17,2:1 |

- Sin verde: rojo y verde juntos no los distinguen muchos daltónicos.
- Regla de color: el naranja de acento del canal (#FF5B2E) se parece al rojo, así que **no aparece durante las rondas**. Solo vuelve en el sello final «STROOP» (sección 4, f780).
- Cada palabra aparece sobre una tarjeta de papel oscuro (#15161A, radio 28, mismas sombras que la tarjeta del menú), como si se apoyara en la mesa: entra con el spring de aterrizaje y sale con la salida estándar.
- Tomy está a la izquierda, sin tapar la tarjeta (ubicalo según su tamaño real, dentro de la zona segura x 80–940, y 240–1420), mirando la tarjeta.

## 4. Guion y cronograma (fuente de verdad para `timeline.ts`)

| Frames | Imagen | Voz / sonido |
| --- | --- | --- |
| 0–75 | Cabecera «DECÍ EL COLOR.» y debajo «NO LA PALABRA.». Tomy se acomoda frente a la mesa | «Decí en voz alta el color. No leas la palabra.» |
| 75–90 | Etiqueta Mono «RONDA 1» | Tic |
| 90–210 | 5 tarjetas que **coinciden**, 24 frames cada una: AZUL/azul · ROJO/rojo · AMARILLO/amarillo · BLANCO/blanco · ROJO/rojo. Tomy las dice cómodo | Sin voz (que hable el espectador). Tic suave por tarjeta |
| 210–240 | Cabecera «AHORA EN SERIO.» | «Fácil. Ahora en serio.» |
| 240–480 | 8 tarjetas que **no coinciden** (palabra/tinta), cada vez más rápido: ROJO/azul (36 f) · AMARILLO/rojo (34) · AZUL/amarillo (32) · BLANCO/rojo (30) · ROJO/amarillo (28) · AZUL/blanco (28) · AMARILLO/azul (26) · ROJO/blanco (26). Tomy se traba: duda, se equivoca en la 4.ª, se tapa la cara en la última (usá las expresiones que tenga) | Sin voz. Tic por tarjeta, cada vez más agudo |
| 480–520 | Todo se congela en la última tarjeta. Cámara se acerca un 6 % | Golpe sordo |
| 520–780 | Explicación. La última tarjeta se separa en dos capas: la palabra «ROJO» con rótulo Mono «leer: automático» y la tinta con rótulo «nombrar el color: esfuerzo»; las dos flechas chocan en el centro. Ficha de cita «Stroop · 1935 / Journal of Experimental Psychology» (reutilizá CitationCard) | «¿Te trabaste? Le pasa a casi todos. Leer es automático: tu cerebro lee la palabra antes de que puedas evitarlo. Nombrar un color cuesta más. Las dos respuestas chocan, y gana la que llega primero.» |
| 780–840 | Sello naranja «STROOP» (mismo estilo que el sello «SEÑUELO»). Cabecera «EFECTO Stroop» («Stroop» en Instrument Serif itálica) | «Se llama efecto Stroop.» |
| 840–960 | Cabecera «¿TE ANIMÁS OTRA VEZ?». Comentario sugerido en Mono en la zona de subtítulos: «Comentá: ¿en qué tarjeta te trabaste?». Las tarjetas y la cámara vuelven al estado del frame 0; la cabecera vuelve a «DECÍ EL COLOR.» en f930–950 | «¿Te animás otra vez? Más rápido.» |
| 959 | Idéntico al frame 0 | |

- Las duraciones de las tarjetas son la parte más importante del video: no las alargues para encajar otra cosa.
- **La imagen sigue a la voz:** con la alineación real de ElevenLabs, si un evento queda a más de 6 frames de su palabra, ajustá `timeline.ts`, no el audio.

## 5. Subtítulos

- Mismo componente y estilo que el episodio 1.
- **Ocultos de f0 a f520** y de f840 al final: si se muestran durante las rondas arruinan la prueba, y en el resto la cabecera ya dice lo mismo.
- Palabras clave en Instrument Serif itálica: «automático», «Stroop».

## 6. Audio

- **Voz:** reutilizá `scripts/gen-voice.mjs` con los mismos ajustes, el mismo caché y el mismo manifiesto que el episodio 1, apuntando a `public/stroop/vo/`. Una petición por bloque de voz (5 en total), con `previous_text` y `next_text`. Los números se escriben en palabras en el texto enviado («mil novecientos treinta y cinco» si lo agregás). **Presupuesto: 2.000 caracteres en total.** Ante 401, 402, 403 o 429, frená y avisame.
- **Efectos:** reutilizá `scripts/gen-sfx.mjs` (agregá recetas nuevas sin tocar las existentes) con salida en `public/stroop/sfx/`: tic de tarjeta (seno 1,6 kHz → 2,6 kHz a lo largo de la ronda 2, 12 ms), golpe sordo (reutilizar thud), sello (reutilizar impact), ambiente de sala (reutilizar room, recortado a 32 s en loop).
- **Mezcla:** igual que el episodio 1. Objetivo ≈ −14 LUFS integrados, pico real ≤ −1 dBTP.
- No podés escuchar: verificá con la alineación que estén todas las palabras y en orden. En el informe, pedime que escuche «Stroop», «animás» y «trabaste».

## 7. Código

~~~
src/
  Root.tsx                 (agregar <Composition id="StroopShort" .../> sin tocar las demás)
  stroop/
    StroopShort.tsx
    timeline.ts            todos los frames de la sección 4 como constantes con nombre
    script.ts              textos de voz y secuencia de tarjetas (palabra, tinta, duración)
    theme.ts               solo lo nuevo (tintas); el resto se importa del theme del canal
  components/stroop/
    WordCard.tsx           tarjeta parametrizada: palabra, tinta, entrada y salida
    InterferenceDiagram.tsx
~~~

- Las mismas reglas que el episodio 1: animación solo con `useCurrentFrame()`, `interpolate()` con clamp, `spring()` y `<Sequence>`; nada de `transition`, `@keyframes`, `Date` ni `Math.random()`; TypeScript estricto; ningún frame mágico fuera de `timeline.ts`; props validadas con zod (`showSafeZones`, `hasVoiceover`).
- La secuencia de tarjetas vive en `script.ts` como datos, para que el próximo episodio de la serie cambie solo los datos.

## 8. Vista previa

Renderizá con `npx remotion still` en `out/stroop/stills/`, con y sin guías de zona segura, los frames 0, 40, 120, 220, 260, 330, 400, 470, 500, 560, 680, 800, 880, 959, y armá una hoja de contactos. **Mirá cada imagen** y corregí hasta que pase la sección 9.

## 9. Control de calidad

| Prueba | Criterio |
| --- | --- |
| Universo | Fondo, cámara, fuentes, sombras, subtítulos y Tomy idénticos en estilo al episodio 1 (poné lado a lado un still de cada uno y comparalos) |
| DecoyShort intacto | Sus frames 0, 390 y 1349 son idénticos antes y después de tus cambios |
| Prueba válida | En la ronda 2 ninguna tinta coincide con su palabra y no se repite la tinta en tarjetas seguidas |
| Spoiler | No hay subtítulos visibles entre f0 y f520 |
| Zona segura | Ningún texto fuera de x 80–940, y 240–1420, incluido el acercamiento |
| Legibilidad móvil | En la hoja de contactos reducida a 360 px de ancho, las palabras y su color se distinguen sin esfuerzo |
| Daltonismo | Simulá protanopia y deuteranopia sobre los stills de la ronda 2 (con un script) y confirmá que las cuatro tintas se siguen distinguiendo |
| Loop | Frame 959 vs frame 0: diferencia mínima (comparalo con un script) |
| Audio | Sin clipping; loudness según la sección 6; ritmo de los tics alineado a las tarjetas (±1 frame) |
| Render | H.264, 1080 × 1920, 30 fps, verificado con `npx remotion ffprobe` |

## 10. Render e informe

- Render: `npx remotion render StroopShort out/stroop_v1.mp4 --codec=h264 --crf=18`. Sin voz: `out/stroop_v1_BORRADOR-SIN-VOZ.mp4`.
- Informe: ruta del MP4 y de la hoja de contactos; estado (terminado o borrador); tabla de la sección 9 con el resultado de cada prueba; qué reutilizaste y qué componentes nuevos creaste; desvíos y su motivo; caracteres de ElevenLabs consumidos; qué necesitás de mí.
