# PROMPT — 1000 años · «¿Qué quedaría de tu celular después de mil años?» · V3 (Remotion)

Sos el director técnico y animador del Short. El objetivo es transformar la V2 existente en la V3: una composición nueva, `MilAnosCelularV3`, que reutilice el sistema ya construido. Este documento es autónomo. El trabajo termina cuando pasa el control de calidad de la sección 10, no cuando compila.

La historia en una línea: **el espectador empieza preguntándose qué sobrevive de su celular y termina entendiendo que los restos físicos duran siglos, pero la foto que guardaba puede perderse en años, salvo que tenga copia.**

## 0. Reglas (obligatorias)

1. **Rama:** trabajá en una nueva, `short/girodato-celular-v3`, creada desde `short/ultimo-en-pie-celular`. No hagas push. No toques `main`.
2. **Nada destructivo.** No borres ni modifiques los archivos de la V2: `src/videos/03-1000-anos/v2/`, `src/videos/03-1000-anos/v2/componentes/`, `public/videos/03-1000-anos/v2/` ni nada en `out/`. Si necesitás cambiar un componente, **copialo** a `src/videos/03-1000-anos/final/componentes/`. En `Root.tsx` solo *agregás* la composición nueva.
3. **No instales nada sin consultarme** (lista con paquete, para qué y tamaño; esperá OK).
4. **Créditos de ElevenLabs: antes de generar voz o efectos, pedime aprobación** con el texto exacto y los créditos estimados (usá `estimate_only` si usás el conector). La clave, si se usa la API, va solo por la variable de entorno `ELEVENLABS_API_KEY`.
5. **Si algo cambia en el código y no fuiste vos, fui yo:** no lo pises.
6. **Leé `CLAUDE.md` y `BIBLIOTECA.md`.** Rigen: subtítulos en carril fijo abajo; nada clave por debajo de y = 1536 ni a la derecha de x = 900; dibujo nítido (sin desenfoque sobre objetos); renders nuevos en carpetas nuevas de `out/`; `--gl=angle`.
7. **Honestidad en el informe:** si algo no quedó como se pide, decilo.

## 1. Inspección (Paso 1)

1. Leé `produccion/03-1000-anos/final/propuesta.md` (diagnóstico, guion, storyboard y revisión científica) y `produccion/03-1000-anos/v2/ENTREGA.md`.
2. Estudiá la V2: `src/videos/03-1000-anos/v2/` (`UltimoEnPie.tsx`, `timeline.ts`, `decay.ts`, `theme.ts`, `types.ts`, `lib/`, `episodes/celular.ts`, `episodes/celular.voz.json`) y `src/videos/03-1000-anos/v2/componentes/` (camera, scene, props, fx, ui, audio, debug).
3. Revisá los scripts: `scripts/stills.mjs`, `gen-sfx-ultimo.mjs`, `edit-voz-ultimo.mjs`, `qa-wave-png.mjs`, `qa-frame-diff.mjs`, `qa-contrast.mjs`, `contact-sheet-1000-anos-v2.mjs`.
4. Mirá el MP4 de la V2 extrayendo fotogramas: `npx remotion ffmpeg -ss <t> -i videosPrueba/1000-anos-celular-v2.mp4 -frames:v 1 -s 360x640 <png>`. El ffmpeg que trae Remotion es mínimo: no tiene los filtros `fps`, `tile`, `showwavespic` ni `ebur128`, pero sí `loudnorm` y `scale` vía `-s`.
5. Verificá Remotion 4.0.541 y que estén `@remotion/google-fonts`, `@remotion/media` y `zod`.
6. Cargá el skill `remotion-best-practices` si está disponible.
7. Escribime un resumen del plan (5–8 líneas) y seguí.

**Datos de la V2 que vas a reutilizar:**
- **Deterioro:** cada objeto es función pura de `year` (`decay.ts`). Los springs de caída usan el frame del evento (`lib/anim.ts` `fall`) y la mesa colapsa vía `lib/support.ts`.
- **Cámara:** contenedor con `perspective` 1800 px, origen (540, 1020), planos `sky` (z −800) y `wall` (z −400) con escala compensada. El celular usa perspectiva local para no intersecar la mesa.
- **IDs de SVG:** son globales por documento. **No montes dos instancias de la escena en la misma página** (rompe máscaras y clips). Por eso la hoja de contactos se arma desde PNG copiados temporalmente a `public/`.
- **Voz existente** (Isaac `QmPfzE500cXXHM9uQKGc`, `eleven_multilingual_v2`), ya editada en `public/videos/03-1000-anos/v2/voz/*.wav`. Duraciones y frases en `celular.voz.json`:

  | Toma | Texto | Duración |
  |---|---|---|
  | `year1` | «Un año. El papel amarillea. La tela se mancha.» | 3,71 s |
  | `year10` | «Diez años. Se rompe la ventana. La batería puede hincharse.» | 3,58 s |
  | `year50` | «Cincuenta. La mesa se deshace. El libro ya no está.» | 3,95 s |
  | `year200` | «Doscientos años. El cobre, verde. La botella, deformada… pero entera.» | 5,53 s |
  | `year1000` | «Mil años.» | 0,76 s |

  Las tomas `hook`, `week`, `winner` y `photo` **no se usan en la V3**. Los originales están en `produccion/03-1000-anos/v2/voz-original/`.

## 2. El video

- Composición `MilAnosCelularV3`: 1080 × 1920, 30 fps, **1.260 frames (42,0 s)**. Ajustá la duración final según las tomas de voz reales, siempre entre 35 y 45 s.
- **Archivo final:** `out/1000-anos/final/1000-anos-celular-v3.mp4` (H.264, `--crf=18 --gl=angle`) y después el master de loudness (sección 9).
- Sin música. Narración (Isaac) + efectos. Texto en español rioplatense neutro.
- **Loop:** el frame 1259 tiene que ser visualmente igual al frame 0 (mismo primer plano del perro, contador «AÑO 0»).

## 3. Guion (voz)

| ID | Texto | Entra en | Estado |
|---|---|---|---|
| `v3hook` | «¿Qué quedaría de tu celular después de mil años?» | f6 | **NUEVA** |
| `v3power` | «Se corta la luz. En unos días, la batería se agota… pero la foto sigue ahí adentro.» | f108 | **NUEVA** |
| `year1` | (existente) | f218 | reutilizada |
| `year10` | (existente) | f350 | reutilizada |
| `year50` | (existente) | f582 | reutilizada |
| `year200` | (existente) | f690 | reutilizada |
| `year1000` + `v3remains` | «Mil años.» + «Todavía quedan restos: vidrio, metal, plástico.» | f862 / f892 | reutilizada + **NUEVA** |
| `v3before` | «Pero hay algo que probablemente desapareció mucho antes.» | f952 | **NUEVA** |
| `v3photo` | «La foto. Sin energía, la memoria del celular puede perder sus datos en años o décadas.» | f1040 | **NUEVA** |
| `v3close` | «Los restos duran siglos. Tus recuerdos, solo si tienen copia.» | f1168 | **NUEVA** |

**Cómo generar las tomas nuevas:**
1. Total ≈ 330 caracteres ≈ 330 créditos (1 toma por línea, `eleven_multilingual_v2`, misma voz). **Pedí aprobación antes.**
2. Con el conector de ElevenLabs: `creative_generate_speech` con `generations_count: 1` y un solo `flow_id`; después bajá cada `full_res_url` a `produccion/03-1000-anos/final/voz-original/<id>.mp3`. Sin conector: agregá las líneas a un `guion.json` nuevo y adaptá `scripts/gen-voz-1000-anos.mjs` (copia: `gen-voz-v3.mjs`).
3. Editá con una copia de `edit-voz-ultimo.mjs` (`edit-voz-v3.mjs`): pausas de 0,2 s como máximo y salida a `public/videos/03-1000-anos/final/voz/*.wav` + `src/videos/03-1000-anos/final/voz.json` con las frases.
4. **Medí cada duración y ajustá los frames de entrada.** Ninguna frase puede pisar a la siguiente. Si `v3photo` supera 4,0 s, avisame antes de comprimir.
5. Si la voz no está aprobada, armá todo con las tomas existentes y marcá en la línea de tiempo dónde van las nuevas (subtítulo provisorio), para que pueda revisar el ritmo.

## 4. Tiempo: frames → años (`src/videos/03-1000-anos/final/timelineV3.ts`)

Mismo método que la V2: se interpola `log10(año)` con `Easing.bezier(0.65, 0, 0.35, 1)` en los saltos y con deriva mínima en las lecturas.

| Frames | Año | Tipo |
|---|---|---|
| 0–110 | 0 | Fijo (gancho y cuarto) |
| 110–200 | 0 → 1 semana | Lectura lenta (corte de luz y plantado) |
| 200–220 | → 1 | Salto |
| 220–330 | 1 → 1,3 | Lectura |
| 330–350 | → 10 | Salto (la ventana se rompe **en cámara**, ~f368, ya en lectura: poné el evento de ventana en el año 10,1) |
| 350–480 | 10 → 12 | Lectura |
| 480–495 | → 30 | Salto |
| **495–600** | **30 → 50** | **Lectura lenta (log)**: derrumbes escalonados (pared f520–600, velador f540, mesa f575) |
| 600–660 | 50 → 55 | Lectura |
| 660–680 | → 200 | Salto |
| 680–840 | 200 → 210 | Lectura |
| 840–860 | → 1.000 | Salto |
| 860–1010 | 1.000 | Fijo |
| 1010–1260 | 0 | Fijo (pasado: la foto) |

- Los frames de los eventos (rotura de vidrio, velador, mesa, paneles, lluvia) salen de `frameAtYear()`, nunca a mano.
- En 1010–1150 la escena muestra el **celular original**, pero el contador **no vuelve a «AÑO 0» hasta f1150**. Mientras tanto, el contador se oculta con un fundido de 10 frames: es un recuerdo, no otro año.
- Saltos: flicker día/noche de ±18 % (3 ciclos), grano de 0,05 → 0,08 y partículas aceleradas (como en la V2).

## 5. Planos y cámara (`src/videos/03-1000-anos/final/shots.ts` + `CameraV3.tsx`)

Definí cada plano como `{ from, to, kind: 'world'|'macro', framing: {cx, cy, zoom, rotX, rotY}, enter: 'cut'|'move'|'match', ease }`. Los movimientos usan `Easing.bezier(0.45, 0, 0.2, 1)` y los cortes caen en un salto o en una frase. **Cada cambio de plano tiene que mostrar algo nuevo**; nada de zoom permanente.

| # | Frames | Tipo | Encuadre y movimiento | Qué revela |
|---|---|---|---|---|
| 1 | 0–75 | macro cenital | El celular ocupa ~62 % del ancho, el perro ~55 % del cuadro. Deriva de 2 px. | Protagonista y foto |
| 2 | 75–105 | world | Movimiento hacia atrás hasta un plano medio de la mesa de luz (zoom 1,35 → 1,0). | Dónde está |
| 3 | 105–200 | world → macro | Empuje hacia la pantalla mientras se apaga. En f150–185, `MemoryXRay`: el vidrio se vuelve semitransparente y aparece el chip con la miniatura del perro iluminada. | La foto vive adentro |
| 4 | 200–330 | world | Corte en el salto → plano general del cuarto (zoom 0,92). En f280, empuje lento al velador manchado. | Polvo, manchas |
| 5 | 350–420 | world | Plano medio de la ventana (cx 270, cy 560, zoom 1,6): rotura en cámara. | Ventana rota, agua |
| 6 | 420–480 | macro lateral bajo | Celular de perfil: el vidrio se levanta; `Callout` «batería hinchada». | Qué parte cambia |
| 7 | 495–600 | world | Plano general amplio (zoom 0,85, rotY −6°). Derrumbes legibles. | Colapso del cuarto |
| 8 | 600–660 | world | Plano medio del celular sobre los restos. | El celular resiste |
| 9 | 680–740 | world | Plano general de la pradera con muros bajos. | La naturaleza vuelve |
| 10 | 740–840 | world → macro | Grúa abajo hasta un primer plano del celular semienterrado. `Callout` «cobre oxidado» (cable) y «aluminio opaco» (marco). En el vidrio negro, un reflejo tenue con la forma del perro al 6 %. | Deterioro por partes |
| 11 | 860–950 | world | Plano general del montículo → empuje lento. | Mil años |
| 12 | 950–1010 | macro | Primerísimo plano del fragmento de vidrio en la tierra (opaco, rayado), con restos de marco y plástico. Destello en f975. | Lo que queda |
| 13 | 1010–1035 | match | `MatchCut`: el rectángulo sucio se funde con el vidrio limpio del original, en la misma posición y tamaño. | Volver al pasado |
| 14 | 1035–1150 | macro cenital | Igual al plano 1. `PhotoDecay` de f1070 a f1135. | La foto se pierde |
| 15 | 1150–1260 | macro cenital | 15 frames en negro → la foto vuelve → composición idéntica al f0. | Loop |

**El celular en planos macro** (`PhoneMacro`): reutilizá `Phone` y `DogScreen` con más resolución y detalle (junta del vidrio, puerto, 2 tornillos, cámara), y las mismas curvas de `decay.ts` para que el deterioro empate con el plano general. La vista lateral baja muestra el grosor, la batería hinchada y la separación del vidrio. El vidrio de los años 200 y 1.000 tiene que verse **opaco y rayado** (no impecable).

## 6. Revelación final (no negociable)

- **`MemoryXRay` (f150–185):** silueta del chip (rectángulo con patas) bajo el vidrio y la miniatura del perro adentro, con un brillo suave. Rótulo «memoria» (Mono 34 px) con flecha. Debe leerse en 1 s.
- **`PhotoDecay` (f1070–1135):** grilla de 16 × 34 bloques sobre la foto. Cada bloque se apaga a gris o negro en un frame determinado por `random('blk-i')`, ponderado de abajo hacia arriba. Algunos bloques se desplazan 1 celda antes de apagarse. Rótulo permanente chico «representación» (Mono 26 px, ash) en la esquina inferior del celular. Sin glitch RGB ni flashes.
- **Cierre (f1150–1260):** la foto vuelve con el mismo brillo que en f0. El texto del cierre va solo en subtítulo (carril fijo). Sin carta ni cifras.
- Al final se muestra **«simulación»** (Mono 26 px) cerca del contador durante f1168–1240. Quitalo antes de f1245 para que el loop empalme.

## 7. Textos

- **Jerarquía:** contador (Plex Mono 700, 88 px, ámbar, con velo `veilStrong`) → subtítulo (Barlow Condensed 600, 56 px, bone, en el carril que apoya en y = 1530) → `Callout` (Barlow 600, 56 px, bone sobre velo, con flecha de 3 px hacia la pieza). **Como mucho un `Callout` por plano** y nunca dos textos nuevos en el mismo segundo.
- **Gancho:** la pregunta escrita desde f0 (Barlow 600, 72 px, centrada en y ≈ 300, dos líneas), además de la voz. Sin subtítulo duplicado durante el gancho.
- **Barra de tiempo:** se conserva, sin rótulos chicos. Solo la línea, el punto ámbar y la etiqueta del hito actual sobre el punto (Mono 34 px).
- **Prohibido:** cifras de duración de materiales («450 años», «200 a 500», «un millón»), la pila de `DecayLabel` y textos de menos de 30 px (salvo «representación» y «simulación», de 26 px).
- **Zona segura:** textos entre x 80–900 e y 230–1536; ningún texto encima de la pieza que señala un `Callout`.
- Todo color y fuente en `src/videos/03-1000-anos/final/themeV3.ts`, que extiende `theme.ts` de la V2. El ámbar es solo para el tiempo.

## 8. Sonido

- Reutilizá `public/videos/03-1000-anos/v2/sfx/*.wav` (tick, charger-hum, buzz, power-off, timewarp, odometer, glass-break, lamp-fall, room, wind, rain, insects, glint).
- **Nuevos, sintetizados por código** en `scripts/gen-sfx-1000-anos-final.mjs` (copiá el enfoque de `gen-sfx-ultimo.mjs`) → `public/videos/03-1000-anos/final/sfx/`:
  - `photo-motif.wav`: dos senos suaves, 660 → 880 Hz, 400 ms. Suena en f160 (`MemoryXRay`) y en f1035 (vuelta a la foto).
  - `data-loss.wav`: tren de clics de bits que se espacia y baja de 4 kHz a 800 Hz, 2 s. Suena en f1070.
  - `wood-creak.wav`: ruido filtrado con resonancias de 180 y 320 Hz, 600 ms. Suena en el colapso de la mesa.
  - `panel-thud.wav`: seno de 70 Hz más ruido, 200 ms. Suena en cada panel de pared.
  - `soil.wav`: ruido rosa filtrado a 1,5 kHz con granos, 1 s. Suena en la grúa del plano 10.
  - `glass-tick.wav`: clic seco de 3 kHz, 15 ms. Suena cuando el vidrio se levanta en el plano 6.
- **Ambientes** con fundido cruzado de 20 frames entre cuarto → viento → lluvia → viento → pradera. Sin cortes secos.
- **Ducking:** efectos al 40 % bajo la voz (como en la V2).
- **Mezcla:** después del render, master con `loudnorm` en dos pasadas a −14 LUFS y TP −1,5, en un archivo aparte.

## 9. Render

```bash
npx remotion render MilAnosCelularV3 videosPrueba/1000-anos-celular-v3-raw.mp4 --codec=h264 --crf=18 --gl=angle
```

Después masterizá el audio y copiá el video sin recodificarlo hacia `out/1000-anos/final/1000-anos-celular-v3.mp4`. Verificá con `npx remotion ffprobe` (H.264, 1080 × 1920, 30 fps, todos los frames, duración exacta) y con `loudnorm print_format=json` (I ≈ −14, TP ≤ −1).

## 10. Control de calidad

Generá stills (`scripts/stills.mjs`, con y sin `showSafeZones`) de un frame por plano más 0, 1259, 1035 y 1100. Armá la hoja de contactos a 360 px (copiá `contact-sheet-1000-anos-v2.mjs` con la lista de frames de la V3) y **mirá cada imagen**.

| Prueba | Criterio |
|---|---|
| Gancho | En f0, a 360 px, se ven el celular, el perro y la pregunta. |
| Protagonismo | El celular ocupa ≥ 25 % del ancho en al menos 60 % de los frames. Nunca pasan más de 4 s sin verlo claramente. |
| Variedad | 15 planos según la sección 5; ningún encuadre se repite en tramos consecutivos. |
| Tiempo | Derrumbes visibles (pares de frames sin saltos salvo caídas y rotura). Revisá con `qa-frame-diff.mjs` los pares 219/220, 494/495, 599/600 y 679/680. |
| Legibilidad | Ningún texto de menos de 30 px salvo «representación» y «simulación». Contraste ≥ 4,5:1 medido con `qa-contrast.mjs`. |
| Zona segura | Textos dentro de x 80–900 e y 230–1536; subtítulos 100 % en el carril; 0 choques con callouts u objetos señalados. |
| Voz | Cada frase dentro de su plano. La palabra clave coincide (±3 frames) con su evento: «ventana» con la rotura, «mesa» con el colapso, «la foto» con la vuelta al perro. |
| Ciencia | Ninguna cifra de duración de materiales. Solo afirmaciones de la tabla de la sección 11. «Representación» visible durante `PhotoDecay`. |
| Final | Una persona que no vio el guion entiende: (1) qué quedó, (2) qué se perdió, (3) por qué. Si no, es un problema narrativo: corregilo. |
| Loop | f1259 vs f0: diferencia media < 1/255 (`qa-frame-diff.mjs`). |
| Audio | Sin recorte; −14 LUFS ± 1; TP ≤ −1 dBTP; ambientes sin cortes. Generá las formas de onda de los efectos nuevos con `qa-wave-png.mjs`. |
| Render | H.264, 1080 × 1920, 30 fps, duración exacta. |
| Rendimiento | Ningún frame tarda más de 2 s en renderizar; si pasa, reducí el pasto a 180 briznas y avisame. |

## 11. Afirmaciones permitidas (revisión científica)

- «En unos días, la batería se agota.» Un teléfono encendido sin carga dura horas o días; el autodescargado de Li‑ion es ~1–2 %/mes.
- «La batería puede hincharse.» Mantener el «puede».
- «Sin energía, la memoria puede perder sus datos en años o décadas.» JEDEC JESD218 exige a las SSD de cliente 1 año a 30 °C al final de su vida útil; en memorias poco usadas la retención suele ser mayor y el calor la acorta. Misma tecnología NAND.
- «El cobre se pone verde.» Pátina por humedad.
- «Todavía quedan restos: vidrio, metal, plástico.» Cualitativo.
- **Prohibido:** «el vidrio dura un millón de años» (sin respaldo: es un comentario especulativo de 1972), «450 años», «200 a 500 años» y cualquier otra cifra de descomposición.
- Fuentes en `produccion/03-1000-anos/final/propuesta.md`, sección E.

## 12. Informe final

1. Rutas absolutas del MP4 final, el RAW y la hoja de contactos.
2. Estado: **terminado** o **borrador**, y por qué.
3. Tabla de la sección 10 con el resultado de cada prueba.
4. Desvíos respecto de este documento y su motivo.
5. Créditos de ElevenLabs consumidos (por línea).
6. Qué tengo que escuchar y qué tengo que mirar yo.
7. Paquetes instalados (si te autoricé alguno).

## 13. Texto para publicar (no lo publiques vos)

- **Título:** «¿Qué quedaría de tu celular después de mil años?»
- **Descripción:** «Simulación animada: el deterioro de los materiales es ilustrativo. Lo que probablemente se pierde primero es lo que no se ve. ¿Tenés copia de tus fotos?»
- **Comentario fijado:** las fuentes sobre retención de datos (JEDEC JESD218 vía AnandTech) y sobre durabilidad del vidrio (Corning Museum of Glass), más una aclaración de que el «millón de años» que circula para el vidrio no tiene un estudio que lo respalde.
