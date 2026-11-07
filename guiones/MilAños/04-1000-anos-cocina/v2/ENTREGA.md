# 1000 años · Cocina v2 — Entrega

- **Prueba:** `videosPrueba/MilAños/04-1000-anos-cocina-v2.mp4`. H.264, 1080 × 1920, 30 fps, 1.250 frames, 41,7 s. Audio a −14,2 LUFS, −1,7 dBTP.
- **Render crudo:** `videosPrueba/MilAños/qa/04-1000-anos-cocina/v2/04-1000-anos-cocina-v2-raw.mp4`.
- **Hojas de contactos** (en `videosPrueba/MilAños/qa/04-1000-anos-cocina/v2/`):
  - `hoja-de-contactos-v1.png` y `hoja-de-contactos-v2.png`, con los mismos frames.
  - `hoja-de-contactos-v2-zonas.png`, con zonas seguras y año.
- **Curva de energía:** `energia-v2.png`, por cuarto de segundo (ámbar = con voz).
- **Stems de audio:** `stem-voz.wav` y `stem-efectos.wav`.
- **QA de subtítulos:** `subtitulos-v2/` (reporte y páginas).
- **Composición:** `MilAnosCocinaV2` (`src/videos/04-1000-anos-cocina/v2/`). La v1 (`MilAnosCocinaV1`) y el celular no se tocaron: la v1 da stills idénticos (0,00) antes y después.

## Voz (plugin de ElevenLabs)

- **Isaac – Friendly Young Male** (`QmPfzE500cXXHM9uQKGc`, acento mexicano; el usuario la aprobó así) con `eleven_multilingual_v2`.
- **Flujo `FVbXq32pESdLiPxwuNDy`:** una llamada por frase, 2 tomas de las frases 1 y 10.
- **Ajustes:** el plugin no deja fijar stability, similarity ni style, así que usa los de la voz. La velocidad es la natural.
- **Tomas elegidas:**
  - Frase 1: t1 (1,94 s; la t2 dura 1,76 s).
  - Frase 10: t2 (2,98 s), la única que entra en la ventana.
  - Resto: t1.
- **Tiempos por palabra:** Scribe. Coinciden palabra por palabra con el guion.
- **Créditos: 503.** Son 473 de voz y 30 de Scribe: transcribir las dos tomas adjuntadas por URL costó 13 + 17; las demás, 0.
- **Archivos:**
  - Tomas crudas y tiempos en `v2/voz-original/`.
  - WAV comprimidos (3:1) y nivelados a −17 dBFS RMS en `public/videos/04-1000-anos-cocina/v2/voz/`, armados con `scripts/voz-cocina-v2.mjs`.

## QA (sección 5 del prompt v2)

| Prueba | Resultado |
| --- | --- |
| Encuadre | ✅ Escena ×1,30. El piso empieza en y ≈ 1460 (24 % del alto, con muebles y fragmentos). Objetos clave entre y 450 y 1200 |
| Putrefacción | ✅ Con el acercamiento ×1,22, la banana negra, el moho y el cartón abombado se distinguen en la hoja a 360 px |
| Haz de luna | ✅ Borde desenfocado 24 px (solo la luz), opacidad 0,18, no cruza la heladera, se apaga en f722–f752 y no vuelve |
| Spoiler | ✅ Ningún texto nombra el plato antes de f990 (se borró «plato en la pileta · entero») |
| Revelación | ✅ El plato llega a ~540 px de ancho, centrado en (540, ≈ 800), semienterrado (un tercio tapado) y con el borde azul visible |
| Carta | ✅ Dos renglones limpios («cerámica» / «sin fecha de vencimiento conocida»), f990–f1065 (2,5 s) |
| Textos | ✅ Gancho 84 px, remate 72 px, apuesta 72/56 px, marcadores 84 px. Todo ≥ 24 px y dentro de la zona segura. Contraste de 6,7:1 a 16,2:1 |
| Voz | ✅ 11 frases en su ventana, sin acelerar ni cortar palabras. Subtítulos con los tiempos de Scribe; `qa:subs`: 0 fallas en 16 páginas |
| Audio | ✅ −14,2 LUFS, −1,7 dBTP. Pico en los platos (f458). Zumbido del loop ≈ −23 dB. Sin tramos planos ≥ 1,5 s sin voz. Voz sobre efectos: 8,5–42 dB por frase (stems) |
| Loop | ✅ Frame 1249 = frame 0 (diferencia 0,00/255) |
| Render | ✅ H.264, 1080 × 1920, 30 fps, 1.250 frames, 41,67 s (ffprobe) |

## Desvíos respecto del prompt v2 (y por qué)

- **Nombres y rutas según `CLAUDE.md`:**
  - Composición `MilAnosCocinaV2`, porque la v1 se llama `MilAnosCocinaV1`.
  - Voz en `public/videos/04-1000-anos-cocina/v2/voz/` y tiempos en `v2/episodes/cocina.voz.json`.
  - Renders en `videosPrueba/MilAños/` en lugar de `out/`.
- **Voz:**
  - Se generó con el plugin y no con la API, por decisión del usuario. Por eso no se pudieron fijar stability, similarity ni style.
  - Textos en español neutro, aprobados por el usuario. «Ocho platos» quedó afuera para que «Todos… menos uno.» entre textual.
- **Duración y tiempos:**
  - El video dura 41,7 s, dentro del máximo de 42 s autorizado.
  - Las ventanas se ajustaron a la voz real: frase 10 en f1068–f1160 y frase 11 en f1160–f1218.
  - La carta dura 2,5 s como se pidió; el remate y la pregunta se corrieron unos frames.
- **Eventos colgados de la palabra que los nombra:**
  - La ventana se rompe con «rompe» (f312, no f290).
  - El techo cae con «techo» (f722, no f667).
  - El papel cruje con «receta» (f351).
  - El plato que gira se detiene en «menos uno» (f536–f572).
- **Subtítulos:** con el sistema del canal (base en y = 1500, como pide `CLAUDE.md`, en lugar de y ≈ 1300).
  - Las frases 1, 10 y 11 se muestran como texto grande; la 2, con el texto de la apuesta; la 9, con la carta.
  - Para que el carril quede libre: los fragmentos de los platos caen sobre la mesada a la derecha de la bacha y en el piso a la derecha del carril, la alacena cae a la derecha, las hojas caen sobre la mesada y la receta cae a la izquierda.
- **Frase 2:** la voz dice «¿Qué queda en pie?» y la pantalla «¿Cuál queda en pie?», como pide 2.4. Si se prefiere que coincidan, regenerar esa frase cuesta 18 créditos.
- **Etiqueta:** «plátano» en lugar de «banana», para el español neutro.
- **Mezcla:** compresión leve en la voz (no estaba pedida) para que el limitador final casi no trabaje. La nota de la carta también se agacha con la voz, porque sin ducking tapaba la frase 9.

## Qué tiene que escuchar el usuario

- La voz completa, sobre todo la frase 1 (f2) y la 10 (f1068): hay tomas alternativas en `v2/voz-original/`.
- Los platos (f448–f480).
- El plato que gira (f536–f572).
- Si el acento mexicano de Isaac funciona con el tono «grave y calmo» que se pedía.
