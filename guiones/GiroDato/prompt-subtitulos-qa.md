# PROMPT MAESTRO — Subtítulos del canal + QA que falla de verdad

Sos el desarrollador a cargo de rehacer el sistema de subtítulos compartido del repo y su control de calidad. Después tenés que re-renderizar los dos Shorts de GiroDato con el sistema nuevo. Este documento tiene todas las decisiones. El trabajo termina cuando el QA nuevo da **0 fallas** en los dos videos y yo apruebo los renders, no cuando compila.

El guion, la voz, la animación y la estética de los dos videos **están aprobados: no se tocan**. Solo cambian los subtítulos, la ficha de la cita y la documentación.

## 0. Reglas de trabajo

1. Leé primero `CLAUDE.md`, `BIBLIOTECA.md`, `guiones/APRENDIZAJES.md` y `guiones/README.md`, y seguí sus reglas de trabajo: ramas, `videosPrueba/` y nada en `out/`. **Si alguna regla de estética o de subtítulos de esos archivos contradice este documento, gana este documento** (la sección 6 actualiza esos archivos).
2. Rama nueva `fix/subtitulos-canal`. Sin merge a `main` hasta que yo apruebe.
3. **No regeneres voces ni gastes créditos de ElevenLabs.** Los tiempos de las palabras ya existen; usá esos.
4. **No instales nada sin consultarme.** Si necesitás `@remotion/layout-utils` (para `measureText`), pedímelo junto con cualquier otro paquete en una sola lista. Usá `npx remotion add`, con la misma versión que el resto (4.0.541).
5. Nada destructivo: no borres composiciones, versiones viejas ni historial. El proyecto «1000 años» (`src/videos/03-1000-anos/`) **no se toca** en esta tarea.
6. Si algo cambia en el código y no fuiste vos, fui yo: no lo pises.
7. Informe honesto: si algo no quedó como se pide, decilo.

## 1. Diagnóstico (ya hecho; verificalo antes de cambiar nada)

Lo midieron sobre los MP4 finales y lo confirmaron en el código:

| # | Problema en pantalla | Causa |
| --- | --- | --- |
| a | Subtítulos centrados en x ≈ 480–490, no en 540 | `captions.ts:77`: `slotX` toma el centro de una zona segura asimétrica (`SAFE` 60–900, `captions.ts:17`; Stroop `TEXT_SAFE` 80–900). `BIBLIOTECA.md:18` lo pide («centro x ≈ 480») y `cafe.ts:74-75` (`SAFE_CX = 480`) |
| b | El subtítulo pisa el cuerpo de Tomi | El cuerpo es una caja `soft` (`cafe.ts:383`, `layout.ts:79`); tapar cuesta `s*0.5` y subir un renglón `ROW_COST = 25000` (`captions.ts:27,129`). La caja estimada es más chica que el texto real: `CHAR_W = 0.7` no cuenta el espaciado entre palabras (`CaptionsLayer.tsx:70`), el 106 % de la palabra activa, el contorno ni la animación de entrada. La fuente no se carga («Segoe UI Black» cambia según la máquina) |
| c | Páginas cortadas a mitad de frase («AHORA MIRÁ LO QUE», «TU CEREBRO LEE LA») y palabras sueltas («MÁS!») | `captions.ts:43` corta cada 4 palabras o 20 caracteres; no mira la gramática ni une las colas cortas |
| d | Amarillo en palabras sin peso («POR», «LAS», «TRES») | Es karaoke: se pinta la palabra que suena (`CaptionsLayer.tsx:36,64`). No hay lista de énfasis |
| e | La altura del subtítulo cambia entre escenas (~1300 vs ~1480) | Las alturas permitidas llegan hasta y = 450 (`captions.ts:19`). El Stroop usa otro carril (`GiroDatoStroopV2.tsx:34`). El QA solo avisa saltos de más de 200 px |
| f | La ficha muestra «Huber, Payne & Puto (1982)» | El texto está en `src/videos/01-efecto-senuelo/short-final/BoardScene.tsx`. Además lo piden `guiones/APRENDIZAJES.md:16`, `guiones/GiroDato/01-efecto-senuelo/plan.md:33` y `ENTREGA.md:26`, así que cada video nuevo lo repetiría |
| QA | Todo lo anterior pasó el QA | El QA usa la misma caja subestimada que el sistema (se aprueba a sí mismo). Ignora los choques blandos. No revisa centrado, cortes, resaltado ni textos prohibidos. `qa-stroop.mjs` apunta a la composición V1 |

## 2. Zona segura: una sola fuente de verdad

Creá `src/canal/zonaSegura.ts` y hacé que todo (subtítulos, layouts, QA y documentación) lo importe o lo cite. Lienzo de 1080 × 1920.

```ts
export const LIENZO = { w: 1080, h: 1920 };
export const ZONA = { top: 240, bottom: 1536, left: 60, right: 900 }; // nada clave fuera de acá
export const CENTRO_X = 540;                  // TODO texto centrado usa este centro
export const ANCHO_TEXTO_MAX = 720;           // 180–900: simétrico respecto de 540 y respeta right = 900
export const CARRIL = { bottom: 1500, maxLineas: 2 }; // el bloque se apoya en y = 1500 y crece hacia arriba
```

- Textos centrados: **siempre en x = 540**, con el ancho limitado a `ANCHO_TEXTO_MAX`. Nunca más se centra en el medio de la zona asimétrica.
- Elementos alineados a la izquierda (etiquetas, fichas): pueden usar `ZONA.left`.
- Quitá `SAFE_CX = 480` de `cafe.ts`. Si la cámara del señuelo se encuadra con ese valor, **no cambies el encuadre** (está aprobado): renombrá la constante para que quede claro que es de cámara (`CAMARA_CX`) y que no es el centro de los textos.

## 3. Sistema de subtítulos nuevo (`src/canal/subtitulos/`)

### 3.1 Desacople

La librería compartida no puede importar nada de `src/videos/`. Hoy `captions.ts:1-2` y `CaptionsLayer.tsx:4-5` importan `WORDS` y `Box` del video 01. Movés los tipos (`Palabra`, `Caja`, `Pagina`) a `src/canal/subtitulos/tipos.ts`, y cada video pasa sus palabras, cajas, énfasis y rangos ocultos por props. `CaptionsLayer` usa el `fps` de `useVideoConfig()`, no `f/30` fijo (`CaptionsLayer.tsx:34`).

### 3.2 Tipografía y medida real

- La fuente se carga con `@remotion/google-fonts` (ya instalado). Elegí la de Google Fonts más parecida a la actual: probá Montserrat 900 e Inter Tight 900. Mostrame un still comparativo (actual vs. candidatas) en el mismo fotograma, seguí con la más parecida y explicá por qué.
- Usá `waitUntilDone()` / `delayRender` para que ningún fotograma se renderice con la fuente de reemplazo.
- Mantené tamaño, mayúsculas, contorno y colores actuales (están aprobados), salvo lo que cambia la sección 3.4.
- El ancho de cada renglón se **mide** con la fuente real (`measureText` de `@remotion/layout-utils`, o un canvas fuera de pantalla si no lo autorizo). Incluye el espaciado entre palabras, el escalado máximo de la palabra activa, el contorno y la escala de entrada. Nada de `CHAR_W` aproximado.

### 3.3 Paginación por frase (la regla más importante)

Cada página tiene 1 o 2 renglones, cada renglón mide ≤ `ANCHO_TEXTO_MAX`, y la página dura al menos 15 frames (0,5 s).

1. **Cortes manuales primero:** si el texto del guion trae `|`, se corta ahí sí o sí.
2. **Dónde se puede cortar**, de mejor a peor:
   - fin de oración (`. ? ! …`);
   - pausa real en la voz ≥ 0,18 s entre dos palabras;
   - coma o dos puntos;
   - límite de frase: antes de un verbo, de «que», de una preposición o de una conjunción.
3. **Nunca** se termina una página ni el primer renglón en una de estas palabras: `el, la, lo, los, las, un, una, unos, unas, al, del, de, a, en, con, por, para, sin, sobre, entre, que, y, e, o, u, ni, pero, más, muy, tan, su, sus, mi, tu, se, me, te, le, les, no`. (`más` y `no` sí pueden cerrar si llevan puntuación final, como «¡No!» o «más.».)
4. **Sin huérfanas:** una página de una sola palabra solo se permite si es una oración completa («Fácil.») o está en la lista `remates` del video. Si sobra una cola corta, se une a la página anterior, siempre que entre en 2 renglones.
5. **Renglones parejos:** entre los cortes válidos de una página de 2 renglones, elegí el que minimiza la diferencia de ancho. El segundo renglón puede ser más largo, nunca menos de la mitad del primero.
6. Implementalo como función pura y testeable `paginar(palabras, opciones) → Pagina[]`. Escribí pruebas unitarias con los casos reales que fallaron («Ahora mirá lo que pasa…», «Cambió contra qué lo comparás», «Tu cerebro lee la palabra…», «¡Son solo cincuenta centavos más!»). Usá Node `--test` o lo que ya tenga el repo, sin instalar nada nuevo.

### 3.4 Resaltado

- **Amarillo solo para las palabras clave** que declara cada video en su `script.ts`/`cafe.ts` (`enfasis: string[]`), **máximo 1 por página**.
  - Señuelo: `señuelo`, `cincuenta centavos`, `grande`, `mediano`, `tapá`.
  - Stroop: `automático`, `Stroop`, `chocan`, `color`.
  - Ajustá estas listas si una frase se lee mejor con otra palabra y contámelo en el informe.
- La palabra que suena (karaoke) se marca **sin color**: escala 1,04 y opacidad 100 % contra 78 % del resto. Ese escalado entra en la medida de la 3.2.
- El estilo itálico existente del Stroop («*Stroop*») se mantiene.

### 3.5 Carril fijo y choques

- **Un solo carril para todo el video:** el bloque se apoya en y = 1500 (`CARRIL.bottom`), centrado en 540, y crece hacia arriba hasta 2 renglones. **Nunca sube.** Eliminá el optimizador de alturas (filas hasta 450, `ROW_COST`, `LEFT_COST`, slots a la izquierda).
- Los rangos ocultos que ya existen se mantienen (en el Stroop, durante las rondas).
- **El carril se respeta desde el layout, no desde el subtítulo.** Si en algún fotograma con subtítulo visible Tomi (cuerpo, cabeza, manos), un objeto o un texto entra en el rectángulo del bloque, la escena se corrige así, en este orden:
  1. Correr a Tomi o al objeto en x, o subirlo, sin cambiar su actuación.
  2. Si no alcanza, achicar ese plano de cámara.
  3. Si tampoco alcanza, avisame con el fotograma y una propuesta. No muevas el subtítulo.
- El cuerpo de Tomi deja de ser `soft`: todo es duro para el subtítulo.

## 4. QA nuevo (`scripts/qa-subtitulos.mjs`, `npm run qa:subs -- <Composicion>`)

El QA **no puede reutilizar las cajas ni las medidas del sistema de subtítulos**. Mide los píxeles renderizados.

1. **Capas de depuración:** agregá a las dos composiciones una prop zod `capa: "todo" | "subtitulos" | "escena"` (default `"todo"`).
   - `"subtitulos"`: solo los subtítulos sobre fondo transparente (render PNG con alfa).
   - `"escena"`: todo menos los subtítulos.
2. **Por cada página de subtítulo:** renderizá con `npx remotion still` el fotograma del medio y el de máxima escala de entrada, con `capa: "subtitulos"`. Con un script en Node puro (`scripts/lib/png.mjs` ya existe), medí la caja real de píxeles con alfa > 0.
3. **Fallas** (cualquiera hace fallar el QA con código ≠ 0):

| Prueba | Criterio |
| --- | --- |
| Centrado | Centro de la caja en x 540 ± 4 px |
| Ancho | x0 ≥ 180 y x1 ≤ 900 |
| Carril | Borde inferior en y 1500 ± 4 y borde superior ≥ 1300 en todas las páginas. Ninguna página fuera del carril (0 %, no «≥ 95 %») |
| Zona segura | Nada por debajo de 1536 ni a la derecha de 900 |
| Choques | En los fotogramas de las páginas, la intersección entre la caja de subtítulos ensanchada 12 px y los píxeles no transparentes de Tomi, los objetos y los textos debe ser 0 px. Para eso renderizá además una variante de `"escena"` sin fondo ni escenario, o una máscara equivalente que expongan los componentes |
| Cortes | Ninguna página ni primer renglón termina en una palabra de la lista 3.3.3 |
| Huérfanas | Ninguna página de 1 palabra que no sea oración completa ni `remate` |
| Duración | Toda página dura ≥ 15 frames |
| Énfasis | ≤ 1 palabra amarilla por página y solo de la lista `enfasis` |
| Fuente | La fuente cargada es la elegida (verificalo en el render, no en el código) |
| Prohibidas | Ningún texto visible del video contiene palabras de `src/canal/qa/prohibidas.ts`. La lista arranca con `["Puto"]` y la búsqueda no distingue mayúsculas. Buscá también en `src/`, `guiones/` y `BIBLIOTECA.md`, y avisá cada coincidencia |

4. **Salida** en `videosPrueba/GiroDato/qa/<nn-video>/subtitulos/`:
   - `reporte.json` (por página: texto, frames, caja medida, resultado de cada prueba);
   - `reporte.md` legible;
   - `paginas.png`, una hoja de contactos con todas las páginas sobre la escena real, con guías de x = 540, carril y zona segura dibujadas.
5. Agregá a `package.json` los scripts `qa:subs`, `stills` (`node scripts/stills.mjs`) y `render:prueba`. Corregí los valores por defecto de `scripts/qa-stroop.mjs`, que apuntan a la composición V1.

## 5. Ficha de la cita (señuelo)

- En `short-final/BoardScene.tsx`, la ficha dice exactamente «Huber et al. · 1982» y debajo «Journal of Consumer Research». Mismo estilo, mismo lugar.
- Revisá el texto de la voz (`words.ts` / timing): si la narración pronuncia el tercer apellido, **frená y avisame**. No regeneres la voz.
- Si `CitationCard.tsx` y la copia en línea del Stroop (`GiroDatoStroopV2.tsx:202-232`) se pueden unificar sin cambiar el render del Stroop, unificalas y verificalo con `scripts/qa-frame-diff.mjs`. Si no, dejalo para después y decímelo.

## 6. Documentación (para que todo lo que venga salga bien)

Mostrame cada cambio como diff.

- **`CLAUDE.md`**: reemplazá la regla de subtítulos por un resumen de 4 líneas que apunte a `src/canal/zonaSegura.ts` y a la sección de subtítulos de `BIBLIOTECA.md`: centro 540, ancho ≤ 720, carril fijo con base en y 1500, cortes por frase, amarillo solo para el énfasis, `npm run qa:subs` con 0 fallas antes de entregar. Agregá: «Nunca mostrar ni decir el tercer apellido del estudio de 1982; la cita es "Huber et al. · 1982"».
- **`BIBLIOTECA.md`**:
  - Corregí la línea 18 («centro x ≈ 480» → 540).
  - Corregí la 19 y la 129 (el carril viejo 1330–1536 en x 60–900).
  - Escribí una sección «Subtítulos» con las reglas de 3.2 a 3.5 y cómo usar el sistema en un video nuevo (props, `enfasis`, `remates`, `|`).
- **`guiones/APRENDIZAJES.md`**:
  - Corregí la línea 16 (cita «Huber et al. · 1982»).
  - Agregá una entrada: qué falló en los subtítulos de 01 y 02, por qué pasó el QA y la regla nueva.
- **`guiones/GiroDato/01-efecto-senuelo/plan.md:33` y `ENTREGA.md:26`**: cita corregida.
- **`guiones/README.md`**: corregí la extensión del guion del 01 y el enlace roto del 03 (sin tocar archivos del 03).

## 7. Renders y verificación

1. Corré `npm run qa:subs` en `EfectoSenueloTomiV2` y `GiroDatoStroopV2` hasta llegar a 0 fallas.
2. **Regresión:** en los fotogramas sin subtítulo, el video nuevo tiene que ser idéntico al anterior, salvo la ficha de la cita y lo que hayas movido por la 3.5. Comparalo con `scripts/qa-frame-diff.mjs` sobre un fotograma cada 30 y listá los que cambian, con su motivo.
3. Renderizá los dos videos con `--gl=angle` en `videosPrueba/GiroDato/`, con el siguiente número libre: `01-efecto-senuelo-vN.mp4` y `02-stroop-vN.mp4`. No sobrescribas.
4. Verificá con `npx remotion ffprobe`: 1080 × 1920, 30 fps, misma duración que la versión anterior.

## 8. Informe final

1. Rutas de los MP4, de `paginas.png` y de `reporte.md` de cada video.
2. Tabla del QA (sección 4) por video, con el número de páginas que pasan cada prueba.
3. La lista de páginas de subtítulo de cada video, en texto, para que la lea de corrido.
4. La fuente elegida y el still comparativo.
5. Qué escenas tuviste que reacomodar por la 3.5, y el antes y después de cada una.
6. Diffs de la documentación.
7. Desvíos respecto de este documento y su motivo.
8. Lo que quedó pendiente: unificar la cita, limpiar `Root.tsx`, que el 01 y el Stroop no dependan de `short-final/` ni de `v1/`, y llevar «1000 años» al sistema nuevo. Esto último lo hacemos en otra tarea, después de que apruebe estos videos.
