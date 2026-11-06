# Biblioteca del canal — cómo hacemos los Shorts

Este repo es la **base de todos los Shorts**: personaje, animación, dinámica, subtítulos y recursos.
El video de referencia (aprobado) es **`EfectoSenueloTomiV2`** (`src/final-v2/`). Cada video nuevo
se arma copiando esa carpeta y cambiando guion, voz, escena y tiempos.

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

## 2. Mapa del código

| Carpeta / archivo | Qué es |
|---|---|
| `src/character/rig.ts` | Esqueleto: poses, FK, IK de 2 huesos, `Dims` (proporciones). |
| `src/character/anim.ts` | `track`, easings, resortes (`springSeries`), parpadeos, trayectorias en arco. |
| `src/character/feet.ts` | Pies plantados para caminar sin patinar (`footState`, `hipHeightFor`). |
| `src/character/v2/style.ts` | **Tomi V2**: proporciones (`DIM_V2`), escala de cabeza, paleta, grosores. |
| `src/character/v2/CharacterV2.tsx` | Dibujo de Tomi V2 (`frontProp` / `backProp` para objetos en las manos). |
| `src/character/v2/HeadV2.tsx` | Cara paramétrica V2 (cejas con forma, sonrisa asimétrica con hoyuelo). |
| `src/character/v2/acting.ts` | **Estados de actuación**: neutral, irónico, pensando, duda, firme, sorpresa, sospecha, incredulidad, eureka, celebración (`statePose`). |
| `src/character/v2/lipsync.ts` | **Sincronía de labios** desde la alineación de ElevenLabs (`lipSeries`): apertura y ancho de boca por fotograma. Tomi habla cuando habla el narrador. |
| `src/character/v2/motion2.ts` | Timing: `snap` (anticipación+overshoot+asentamiento), `pop`, `shake`, `pulse`, `beatPose` (línea de tiempo de estados). |
| `src/final-v2/cafe.ts` | **Plantilla de escena**: objetos, cámara (`CAM_KEYS`, encuadres `PAIR`/`TRIO`), beats de actuación, mirada, caminata, zonas protegidas. |
| `src/final-v2/CafeSceneV2.tsx` | Render de la escena (set, objetos, tiza, efectos breves). |
| `src/final-v2/layout.ts` | Montaje entre escenas y mapa de zonas protegidas por fotograma. |
| `src/final-v2/captions.ts` | **Subtítulos en carril fijo** (Viterbi + ocultamiento de último recurso). |
| `src/final-v2/QA.tsx` | QA por fotograma: choques, % en el carril, saltos, hoja de contactos. |
| `src/final-v2/EfectoSenueloTomiV2.tsx` | Composición final: escenas + título del gancho + subtítulos + audio. |
| `src/scenes/decoy-v2/CafeV2.tsx` | Set de cafetería (pared, mostrador, lámparas, piso, exterior, etalonaje). |
| `src/scenes/decoy/Props.tsx` | Vaso de café con squash & stretch. |
| `src/short-final/CafeScene.tsx` | Piezas reutilizables: `Tag` (cartel de precio), `ChalkPath`, `ChalkText`, `Sparkle`, servilleta. |
| `src/short-final/BoardScene.tsx` | Escena de pizarrón con tiza (`v2` para Tomi V2). |
| `src/proposal-v2/` | Hojas de diseño (comparación V1/V2, estados de actuación) y el clip de prueba. |
| `src/biblioteca/sonidos.ts` | Mapa tipado de sonidos y música (`SONIDOS`, `MUSICA`). |

---

## 3. Recursos (`public/biblioteca/`)

Catálogo completo con duración, descripción, origen y licencia: **`public/biblioteca/catalogo.json`**.
Desde el código: `import { SONIDOS, MUSICA } from "../biblioteca/sonidos"` → `staticFile(SONIDOS.whip)`.

| Carpeta | Contenido |
|---|---|
| `sfx/transiciones/` | whoosh-suave, whoosh-corto, swish, whip, riser, zip |
| `sfx/impactos/` | vaso-apoyo, thud, impact, low-hit, air-clack, crack, wood, paper-slap |
| `sfx/enfasis/` | tic-precio, pop-aparicion, tick, price-pop, pluck, shimmer, click-close, flick |
| `sfx/reacciones/` | sorpresa, revelacion |
| `sfx/objetos/` | pasos, servilleta, coin-clink, coin-spin, creak, paper |
| `sfx/ambiente/` | sala-cafe (room tone, 45 s) |
| `musica/` | Investigations — Kevin MacLeod (CC BY 4.0, **crédito obligatorio**: `CREDITO-investigations.txt`) |

- Los `.mp3` de efectos son de ElevenLabs Sound Effects; los `.wav`, sintetizados por nuestros scripts.
- Al agregar un sonido: copiarlo a la categoría que corresponda y correr `node scripts/catalogo-biblioteca.mjs`.
- Los videos ya hechos siguen usando sus rutas originales (`public/short-final/…`); no moverlas.

**Voz (ElevenLabs):** Isaac – Friendly Young Male, Voice ID `QmPfzE500cXXHM9uQKGc` (español). Tiempos por palabra
con ElevenLabs Scribe → `public/<video>/voz/palabras.json` → `words.ts`. La clave va solo por variable de entorno.

---

## 4. Cómo hacer un video nuevo

1. **Guion y voz.** Guion en `produccion/<video>/guion.txt` → voz ElevenLabs → tiempos por palabra.
2. **Copiar la plantilla.** `src/final-v2/` → `src/<video>/`. Cambiar `WORDS` (palabras) y los `CUE` (fotogramas clave).
3. **Escena.** Reusar el set o armar uno nuevo; objetos en `cafe.ts` (posiciones, apariciones, carteles).
4. **Cámara.** Encuadres con la función `frame(cx, cy, zoom)` para comparaciones centradas; cortes `cut: true`.
   Dejar libre el carril de subtítulos (nada clave entre y ≈ 1330 y 1536 dentro de x 60–900).
5. **Actuación.** `BEATS` con estados de `acting.ts`; mirada (`GAZE`) hacia lo que se nombra; saltos y aterrizajes.
6. **Sonido.** `SFX` con la biblioteca (`SONIDOS`), sincronizados a los `CUE`. Música con `MUSICA` y ducking bajo la voz.
7. **QA.** Renderizar el Still de QA: **0 choques**, **≥ 95 % en el carril**, **ningún salto > 200 px**. Revisar la hoja de contactos.
8. **Render.** `npx remotion render <Composición> out/<video>/<nombre>.mp4 --gl=angle` (y una versión `--props='{"debug":true}'` para revisar cajas).

**Stills rápidos:** `node scripts/stills.mjs <carpeta> [--props=JSON] <Composición>:<f1>,<f2> …` (un solo bundle).

---

## 5. Checklist antes de entregar

- [ ] Gancho con pregunta directa y opciones visibles en el fotograma 0.
- [ ] Comparación clave grande y centrada, sin el personaje cortado en el borde.
- [ ] Ningún desenfoque sobre el dibujo.
- [ ] QA de subtítulos en verde (0 choques, ≥ 95 % en el carril, sin saltos grandes).
- [ ] Crédito de la música en la descripción (si se usa Investigations).
- [ ] Render nuevo en una carpeta nueva de `out/` (nunca sobrescribir videos entregados).
