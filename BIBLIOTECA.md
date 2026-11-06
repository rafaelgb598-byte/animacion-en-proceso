# Biblioteca del canal — cómo hacemos los Shorts

Este repo es la **base de todos los Shorts**: personaje, animación, dinámica, subtítulos y recursos.
Plantillas aprobadas: **`EfectoSenueloTomiV2`** (`src/videos/01-efecto-senuelo/final/`, escena con cámara y comparaciones)
y **`GiroDatoStroopV2`** (`src/videos/02-stroop/final/`, desafío interactivo). Cada video nuevo se arma copiando la
que más se parezca y cambiando guion, voz, escena y tiempos. Los finales van a `videosFinal/GiroDato/`.

---

## 1. Estética (reglas permanentes)

| Regla | Detalle |
|---|---|
| **Personaje Tomi V2** | Joven adulto (20–25). Cabeza chica (~3,2 cabezas de alto), ojos chicos y almendrados, mandíbula, jopo levantado. Nada infantil. |
| **Vestuario fijo** | Remera turquesa `#2BB3A3` con franja blanca `#F7F3E8`, pantalón azul `#2D3A64`, zapatillas crema `#F4EEE2` con detalles turquesa. No cambiar. |
| **Dibujo siempre nítido** | Nada de desenfoque sobre personaje ni objetos. Solo un desenfoque leve del fondo. El movimiento se transmite con líneas de velocidad, pulsos, temblores y cortes. |
| **Gancho** | Pregunta directa al espectador + opciones/precios grandes desde el fotograma 0 (ej. «¿CUÁL COMPRARÍAS?»). Lo más fuerte del video en los primeros 2 s. |
| **Comparaciones** | El momento clave (las opciones a comparar) va **grande y centrado** en la zona segura (centro x ≈ 480), lejos de los bordes, sin el personaje asomando. |
| **Subtítulos** | **Carril fijo abajo**: apoyan en y = 1530 y crecen hacia arriba. Nunca tapan cara, manos que gesticulan, objetos clave ni textos. Nunca saltan arriba. |
| **Zona segura Shorts** | Nada importante debajo de y = 1536 (20 % inferior) ni a la derecha de x = 900 (botones). Arriba se evita y < 230. |
| **Loop** | El final vuelve al encuadre del gancho con el mismo título. |
| **Ritmo** | Micro-cambios cada 1–2 s; transiciones de 6–10 fotogramas; cambios de estado con anticipación + overshoot + asentamiento. |

**Paleta de textos:** contorno `#1F1A24`/`#2A2024` · palabra activa del karaoke `#FFD84A` · acento del canal `#2BB3A3` · rojo `#E24E5A`.
**Tipografías:** subtítulos y títulos `Segoe UI Black` (900, MAYÚSCULAS, contorno 14 px) · tiza `Segoe Print`.

---

## 2. Organización del repo

```
videosPrueba/                ← renders de prueba, hasta que el usuario apruebe la final (no se sube a git), por canal:
  GiroDato/  MilAños/  Ciberseguridad/  Otro/   (las mismas 4 que videosFinal; nombre <nn>-<video>-vN.mp4)
    qa/<nn-video>/           stills, hojas de contacto y QA de ese video (se borran cuando queda final)
videosFinal/                 ← SOLO las versiones finales, listas para subir, por canal:
  GiroDato/                  videos de Tomi (psicología, curiosidades) → todos los de este tipo van acá
  MilAños/                   serie «1000 años» (sin Tomi: qué queda de un objeto con el paso de los siglos)
  Ciberseguridad/  Otro/     (qué va en cada una lo define el usuario)
guiones/                     ← guiones, prompts, planes y entregas, por canal (mismas 4 carpetas):
  APRENDIZAJES.md            qué funcionó y qué no (leer antes de escribir un guion)
  README.md                  índice de todos los videos
  <canal>/<nn-video>/        guion, prompt-vN, propuesta, ENTREGA, voz-original/
src/
  canal/                     ← TODO lo reutilizable entre videos
    personaje/               esqueleto, animación, pies (rig, anim, feet, motion, presets)
      tomi-v2/               Tomi oficial: dibujo, cara, estados de actuación, timing, sincronía de labios
      tomi-v1/               Tomi original (solo lo usan videos viejos)
    subtitulos/              carril fijo abajo + componente CaptionsLayer
    escenarios/
      cafeteria/             set de cafetería y vasos (Cafe, CafeV2, Props)
      mesa/                  "mesa de evidencia": paleta, tintas de prueba, fuentes (theme.ts)
    componentes/
      tarjetas/              tarjeta de palabra, ficha de cita, diagramas de explicación
    sonidos/                 mapa tipado SONIDOS / MUSICA (generado)
  videos/<nn-video>/         ← código de cada video
    final/                   la versión que está en videosFinal
    v1/, short-final/, historial/   versiones anteriores (se conservan, no se tocan)
  laboratorio/               pruebas de diseño, hojas de personaje, herramientas de revisión
  Root.tsx                   registro de todas las composiciones
public/
  biblioteca/                ← audios e imágenes reutilizables (ver §3)
  videos/<nn-video>/         ← lo exclusivo de cada video: voz/ (narración + alineación) y sfx/ propios
scripts/                     voz, mastering, efectos, catálogo, stills y QA
```

**Regla de reutilización:** si algo puede servir para otro video (un personaje, un gesto, un sonido, un componente
visual), va en `src/canal/` o `public/biblioteca/`. Si es exclusivo de un video, va en su carpeta de `videos/`.
Para agregar una variante a algo compartido, se suma una prop con valor por defecto que deje lo anterior igual.

### Piezas principales

| Archivo | Qué es |
|---|---|
| `src/canal/personaje/rig.ts` | Esqueleto: poses, FK, IK de 2 huesos, `Dims` (proporciones). |
| `src/canal/personaje/anim.ts` | `track`, easings, resortes (`springSeries`), parpadeos, trayectorias en arco. |
| `src/canal/personaje/feet.ts` | Pies plantados para caminar sin patinar (`footState`, `hipHeightFor`). |
| `src/canal/personaje/tomi-v2/style.ts` | Proporciones (`DIM_V2`), escala de cabeza, paleta, grosores. |
| `src/canal/personaje/tomi-v2/CharacterV2.tsx` | Dibujo de Tomi (`frontProp` / `backProp` para objetos en las manos). |
| `src/canal/personaje/tomi-v2/acting.ts` | **Estados de actuación**: neutral, irónico, pensando, duda, firme, sorpresa, sospecha, incredulidad, eureka, celebración (`statePose`). |
| `src/canal/personaje/tomi-v2/motion2.ts` | Timing: `snap`, `pop`, `shake`, `pulse`, `beatPose` (línea de tiempo de estados). |
| `src/canal/personaje/tomi-v2/lipsync.ts` | **Sincronía de labios** desde la alineación de ElevenLabs (`lipSeries`). |
| `src/canal/subtitulos/` | Subtítulos en carril fijo (`captions.ts`) y su componente (`CaptionsLayer`). Opciones: zona segura, renglones, `oneLineMax`. |
| `src/canal/escenarios/cafeteria/` | Set de cafetería y vaso con squash & stretch. |
| `src/canal/escenarios/mesa/theme.ts` | Mesa oscura: colores, tintas sin verde (aptas para daltonismo), fuentes. |
| `src/canal/componentes/tarjetas/` | `WordCard` (geometría configurable), `CitationCard`, `RaceExplainer` (dos procesos que compiten), `InterferenceDiagram`. |
| `src/videos/01-efecto-senuelo/final/` | Plantilla de video en escenario: cámara (`frame()`, cortes), beats, mirada, zonas protegidas, QA. |
| `src/videos/01-efecto-senuelo/short-final/` | `Tag`, `ChalkPath`, `ChalkText`, `Sparkle` (en `CafeScene.tsx`) y el pizarrón (`BoardScene.tsx`). |
| `src/videos/02-stroop/final/` | Plantilla de video **interactivo**: ejemplo, cuenta regresiva, niveles, barra de tiempo, explicación, loop. |
| `src/videos/03-1000-anos/final/` | Serie **«1000 años»** (`MilAnosCelularV3`): deterioro de materiales función del año (`decay.ts`), línea de tiempo frame → año, cámara por planos (`shots.ts`), planos macro del objeto, contador y barra logarítmica. `v2/` es la versión anterior (`MilAnosCelularV2`). Todo dibujado en SVG/CSS 3D, efectos sintetizados (`scripts/gen-sfx-1000-anos-*.mjs`). |

---

## 3. Recursos (`public/`)

Catálogo completo con duración, descripción, origen y licencia: **`public/biblioteca/catalogo.json`**.
Desde el código: `import { SONIDOS, MUSICA } from "…/canal/sonidos/sonidos"` → `staticFile(SONIDOS.whip)`.

| Carpeta | Contenido |
|---|---|
| `biblioteca/sfx/transiciones/` | whoosh-suave, whoosh-corto, swish, whip, riser, zip |
| `biblioteca/sfx/impactos/` | vaso-apoyo, thud, impact, low-hit, air-clack, crack, wood, paper-slap |
| `biblioteca/sfx/enfasis/` | tic-precio, pop-aparicion, tick, price-pop, pluck, shimmer, click-close, flick |
| `biblioteca/sfx/tics/` | tics de tarjeta: `tic-r1` (suave) y dos series que suben de tono (`tic-r2-1…8`, `tic-v2-1…9`) |
| `biblioteca/sfx/reacciones/` | sorpresa, revelacion |
| `biblioteca/sfx/objetos/` | pasos, servilleta, coin-clink, coin-spin, creak, paper |
| `biblioteca/sfx/ambiente/` | sala-cafe (room tone, 45 s) |
| `biblioteca/musica/` | Investigations — Kevin MacLeod (CC BY 4.0, **crédito obligatorio**: `CREDITO-investigations.txt`) |
| `biblioteca/imagenes/` | imágenes y texturas reutilizables (vacía por ahora: todo se dibuja en SVG) |
| `videos/01-efecto-senuelo/` | `voz/` narración Isaac + palabras · `sfx/` efectos propios del video |
| `videos/02-stroop/` | `v1/voz/` y `final/voz/`: narración (mp3 crudo, masterizado y alineación por carácter) |
| `videos/03-1000-anos/` | `v2/` y `final/`: `voz/` (Isaac, wav editados) y `sfx/` (sintetizados por código). Tomas originales en `guiones/MilAños/03-1000-anos/*/voz-original/`. |

- Los `.mp3` de efectos son de ElevenLabs Sound Effects; los `.wav`, sintetizados por nuestros scripts (gratis).
- Al agregar un sonido: copiarlo a la categoría que corresponda y correr `node scripts/catalogo-biblioteca.mjs`.

**Voz (ElevenLabs):** Isaac – Friendly Young Male, Voice ID `QmPfzE500cXXHM9uQKGc` (español), `eleven_multilingual_v2`,
**velocidad natural (1,0)** y mastering suave (`normalize-voice.mjs --drive 6`). Acelerarla la hace sonar forzada.
`node --env-file=<.env> scripts/gen-voice.mjs --lines <voice-lines.json> --out public/videos/<video>/voz --budget <n>`.
La clave va solo por variable de entorno.

---

## 4. Cómo hacer un video nuevo

1. **Guion y voz.** Leer `guiones/APRENDIZAJES.md`. Guion en `guiones/<canal>/<nn-video>/` → voz ElevenLabs en `public/videos/<nn-video>/voz/` (con alineación por carácter).
2. **Copiar la plantilla.** `src/videos/<plantilla>/final/` → `src/videos/<nn-video>/final/`. Cambiar textos y tiempos (todo fotograma con nombre en `timeline.ts`).
3. **Escena.** Reusar el set o armar uno nuevo; objetos en `cafe.ts` (posiciones, apariciones, carteles).
4. **Cámara.** Encuadres con la función `frame(cx, cy, zoom)` para comparaciones centradas; cortes `cut: true`.
   Dejar libre el carril de subtítulos (nada clave entre y ≈ 1330 y 1536 dentro de x 60–900).
5. **Actuación.** `BEATS` con estados de `acting.ts`; mirada (`GAZE`) hacia lo que se nombra; saltos y aterrizajes.
6. **Sonido.** `SFX` con la biblioteca (`SONIDOS`), sincronizados a los `CUE`. Música con `MUSICA` y ducking bajo la voz.
7. **QA.** Renderizar el Still de QA: **0 choques**, **≥ 95 % en el carril**, **ningún salto > 200 px**. Revisar la hoja de contactos.
8. **Render.** `npx remotion render <Composición> videosPrueba/<canal>/<nn>-<video>-vN.mp4 --gl=angle` (y una versión `--props='{"debug":true}'` para revisar cajas).

**Stills rápidos:** `node scripts/stills.mjs <carpeta> [--props=JSON] <Composición>:<f1>,<f2> …` (un solo bundle).

---

## 5. Checklist antes de entregar

- [ ] Gancho con pregunta directa y opciones visibles en el fotograma 0.
- [ ] Comparación clave grande y centrada, sin el personaje cortado en el borde.
- [ ] Ningún desenfoque sobre el dibujo.
- [ ] QA de subtítulos en verde (0 choques, ≥ 95 % en el carril, sin saltos grandes).
- [ ] Crédito de la música en la descripción (si se usa Investigations).
- [ ] Si es interactivo: regla clara antes de jugar, tiempo real para responder, colores verificados.
- [ ] Las pruebas van a `videosPrueba/<canal>/` (stills y QA en `videosPrueba/<canal>/qa/<nn-video>/`, nunca en `out/`); cuando el usuario dice que es la final, se decide con él y se mueve a `videosFinal/<canal>/` (los de Tomi a `GiroDato/`). Nunca sobrescribir.
