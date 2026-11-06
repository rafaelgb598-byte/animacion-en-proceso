# 1000 años — «¿Qué quedaría de tu celular después de mil años?» · Propuesta V3

> **Cómo se hizo este análisis:** extraje y revisé fotogramas del MP4 final (`videosPrueba/1000-anos-celular-v2.mp4`) a 360 px, que es el tamaño real en un celular, y además los stills de QA a 1080 px. Conozco el código y la línea de tiempo exactos porque los escribí yo. **No escuché el audio en tiempo real:** lo que digo del sonido sale de las mediciones (LUFS, duración de cada toma, pausas detectadas) y de la mezcla programada, no de una escucha. Los tiempos se indican en segundos y en frames (30 fps).

---

## A. Diagnóstico de la V2

| # | Momento | Qué falla | Por qué afecta al espectador | Solución visual |
|---|---|---|---|---|
| 1 | 0,0–2,4 s | El gancho «Lo dejás cargando. Nunca volvés.» plantea una situación, pero **no una pregunta**. En el fotograma 0 hay un dormitorio en penumbra y el celular ocupa ~20 % del ancho; el perro mide ~60 px en un teléfono. La primera palabra aparece en f12. | El espectador no sabe qué va a ver ni por qué tendría que quedarse. Además, `CLAUDE.md` pide pregunta directa desde el fotograma 0. | Abrir en primer plano cenital del celular encendido, con el perro ocupando media pantalla, y la pregunta escrita y narrada desde f0. |
| 2 | Todo el video | **Un único encuadre** durante 38 s: la misma cámara a 3/4, con deriva de ±3 px y un solo acercamiento al final. | Se ve como «una imagen animada durante 40 s». Los cambios ocurren en todo el cuadro a la vez y el ojo no sabe adónde mirar. | Planos alternados y motivados (sección C): cada tramo tiene al menos un plano general y un plano del celular. |
| 3 | 18,3–18,5 s (f549–556) | **El momento más espectacular dura un cuarto de segundo:** cae el velador, colapsa la mesa y caen seis paneles de pared, todo dentro de un salto de tiempo y sin narración. | Nadie llega a ver el derrumbe, que es el cambio más grande del cuarto. Parece un corte, no un proceso. | Convertir los años 30–50 en un tramo de lectura de ~2,7 s con plano general, y escalonar los derrumbes. |
| 4 | 20–38 s | **El celular queda chico:** ~90 px de ancho a 360 px, y desde el año 200 el cielo vacío ocupa más del 50 % del cuadro. | Pierde protagonismo y la historia se vuelve el timelapse de una habitación. No se ve qué partes del celular se deterioran. | Volver al celular en cada época con primeros planos y planos detalle (batería, marco, vidrio), con señales grandes que digan qué parte es. |
| 5 | Todo el video | **Etiquetas ilegibles:** Mono de 30 px en 1080 queda en ~10 px en un celular, se apilan hasta 3 juntas y los rótulos de la barra miden ~7 px. | El espectador tendría que pausar para leer. Además repiten lo que dice la voz. | Quitar la pila de etiquetas. Como mucho una indicación por época (≥ 56 px), que señale la pieza en el primer plano, y una barra de tiempo sin rótulos chicos. |
| 6 | 34–37 s | **Se mezclan escalas:** el contador dice «AÑO 1.000», mientras la carta y la voz dicen «un millón de años». | Confunde: ¿pasaron mil años o un millón? | Quitar el «millón». El video vive en la escala de 1.000 años y dice solo lo que muestra: «todavía quedan restos». |
| 7 | 33–37 s | **Cifra sin respaldo:** «~1.000.000 de años» para el vidrio (ver sección E). | Pone en riesgo la credibilidad del canal. | Reemplazarla por una formulación cualitativa y verificable. |
| 8 | 36,7–38,5 s | **«La foto, no.» no está construido:** la foto aparece en los primeros 3 s y no vuelve, salvo un fantasma al 12 % que queda tapado por la carta (invisible). Nunca se dice dónde vive la foto ni qué le pasa. | El remate es críptico. Muchos no van a entender que se refiere a los datos. | Plantar la idea a los ~4 s («la foto sigue ahí adentro»), pagarla al final con una transición del vidrio hallado al celular original, y explicar la pérdida en una frase. |
| 9 | 2,6–3,3 s y entre hitos | **Voz y animación desfasadas en los saltos:** la voz entra cuando el contador ya frenó, y en los saltos (1 s cada uno) solo hay ruido de timelapse. Hay pausas largas, por ejemplo f235–385. | El ritmo queda en «salto, frase, silencio», y la información visual del salto no tiene a nadie que la nombre. | Que la frase de cada época empiece durante el final del salto (anticipación) y que los cambios importantes coincidan con la palabra que los nombra. |
| 10 | Todo el video | **Diseño sonoro:** los ambientes se cortan por tramos (cuarto, viento, lluvia) y el material es muy disperso (la mezcla daba −26,6 LUFS antes de la voz). Hay pocos sonidos del celular. | Suena más a capas sueltas que a un espacio. El celular, que es el protagonista, casi no suena. | Ambientes con fundidos cruzados, sonidos ligados al celular (apagado, chasquido del vidrio al levantarse, tierra que lo cubre) y un motivo sonoro para la foto (ver C). |
| 11 | 38,5–40 s | **Loop poco claro:** el corte a f0 es técnicamente perfecto (diferencia 0,25/255), pero llega después de «La foto, no.» sin sentido narrativo. | La repetición se siente como «el video terminó», no como un círculo. | Que el cierre termine en el mismo primer plano del perro del f0, con una frase que conecte con la pregunta inicial. |
| 12 | Todo el video | **Texto de lectura obligatoria arriba y abajo a la vez:** contador arriba, etiquetas en el medio, barra y subtítulos abajo. | La atención se divide en cuatro zonas. | Jerarquía: contador (grande, arriba), subtítulo (carril fijo abajo) y como mucho una indicación junto al objeto. |

**Lo que sí funciona y conviene conservar:** el concepto, el contador de años con rueda y barra logarítmica, el lenguaje de materiales y la luz que cuenta el tiempo (velador → ventana → exterior), el deterioro continuo función de `year`, la voz de Isaac en las frases de época y el loop técnico.

---

## B. Guion definitivo (≈ 42 s)

Evalué las tres opciones de gancho:
- **A — «¿Qué quedaría de tu celular después de mil años?»** ✅ **Elegida.** Es una pregunta directa (regla del canal), fija la escala (mil años) que después muestra el contador, y no afirma nada dudoso. Además prepara el giro: la respuesta esperada es «restos»; la sorpresa es lo que *no* queda.
- **B — «Dejás tu celular acá… y nadie vuelve a tocarlo.»** Plantea la situación, pero no la pregunta. Sirve como segunda línea visual, no como gancho.
- **C — «¿Cuánto tardaría tu celular en desaparecer?»** ❌ Promete una respuesta numérica que no podemos dar con rigor, y en 1.000 años el celular **no** desaparece del todo. Llevaría a afirmaciones exageradas.

| Tramo | Narración (voz Isaac) | Estado de la toma |
|---|---|---|
| Gancho | «¿Qué quedaría de tu celular después de mil años?» | **Nueva** |
| Corte de luz | «Se corta la luz. En unos días, la batería se agota… pero la foto sigue ahí adentro.» | **Nueva** |
| Año 1 | «Un año. El papel amarillea. La tela se mancha.» | Reutilizada (`year1`) |
| Año 10 | «Diez años. Se rompe la ventana. La batería puede hincharse.» | Reutilizada (`year10`) |
| Año 50 | «Cincuenta. La mesa se deshace. El libro ya no está.» | Reutilizada (`year50`) |
| Año 200 | «Doscientos años. El cobre, verde. La botella, deformada… pero entera.» | Reutilizada (`year200`, editada) |
| Año 1.000 | «Mil años.» + «Todavía quedan restos: vidrio, metal, plástico.» | Reutilizada + **nueva** |
| Revelación | «Pero hay algo que probablemente desapareció mucho antes.» | **Nueva** |
| La foto | «La foto. Sin energía, la memoria del celular puede perder sus datos en años o décadas.» | **Nueva** |
| Cierre | «Los restos duran siglos. Tus recuerdos, solo si tienen copia.» | **Nueva** |

- **Créditos estimados para las tomas nuevas:** ~330 caracteres ≈ 330 créditos de ElevenLabs, con una toma por línea y `eleven_multilingual_v2`, la misma voz y el mismo modelo que la V2 para que el timbre empate. **Requiere aprobación antes de generar.**
- **Por qué el cierre dice «solo si tienen copia»:** es lo científicamente correcto (una foto respaldada en la nube no se pierde con el teléfono), convierte el final en una reflexión útil en lugar de un golpe triste y conecta con el espectador: la pregunta inicial era sobre *su* celular.

---

## C. Storyboard (1.260 frames · 42,0 s)

**Planos:** G = general · M = medio · PP = primer plano · PPP = primerísimo plano · D = detalle.

| # | Frames (s) | Plano y cámara | Animación | Narración | Sonido |
|---|---|---|---|---|---|
| 1 | 0–75 (0–2,5) | **PPP cenital** de la pantalla: el perro ocupa ~55 % del cuadro, con el cable a la vista. Deriva mínima. | Celular encendido, brillo que respira. Vibra en f45. Contador «AÑO 0» desde f0. Pregunta escrita en pantalla desde f0. | Gancho | Zumbido del cargador, vibración |
| 2 | 75–105 (2,5–3,5) | **Tirada de cámara atrás** (motivada: «¿dónde está?») hasta un M de la mesa de luz con el velador. | Se revela el cuarto. | — | Ambiente del cuarto (entra) |
| 3 | 105–200 (3,5–6,7) | M → **PP** de la pantalla mientras se apaga. | Corte de luz: el velador parpadea y se apaga (f110). Fundido de la pantalla (f120–128). **Plantar la foto:** la cámara entra al vidrio negro y, con una «vista de rayos X» de 1 s (f150–185), aparece el chip de memoria con la miniatura del perro iluminada adentro. Texto chico «memoria» junto al chip. | Corte de luz | Apagado eléctrico, chasquido. Motivo de la foto: dos notas suaves al ver la miniatura |
| 4 | 200–220 | **Salto** (timelapse) en M. | Flicker día/noche, rueda el contador. | — | Barrido del tiempo |
| 5 | 220–330 (7,3–11) | **G** del cuarto → **D** del velador manchado. | Polvo, papel amarillo, manchas de humedad. | Año 1 (entra en f218) | Ambiente del cuarto |
| 6 | 330–350 | Salto | | | Barrido |
| 7 | 350–480 (11,7–16) | **M** de la ventana: el vidrio se rompe en f368, en cámara. Luego **PP lateral bajo** del celular: el vidrio se levanta, se ve la línea de luz y aparece la indicación «batería hinchada» con flecha. | Rotura con fragmentos y entrada de la enredadera. | Año 10 (entra en f350) | Vidrio roto, viento que entra |
| 8 | 480–495 | Salto corto | | | Barrido |
| 9 | 495–660 (16,5–22) | **G amplio** (la cámara retrocede a la izquierda). Lluvia. **Años 30→50 en lectura lenta:** la pared se raja y cae por paneles (f520–600), el velador cae (f540) y la mesa colapsa (f575). Termina en **M** del celular sobre los restos. | Derrumbes escalonados y legibles. | Año 50 (entra en f560, después del colapso) | Lluvia, crujido de madera, golpes de paneles amortiguados |
| 10 | 660–680 | Salto | | | Barrido |
| 11 | 680–840 (22,7–28) | **G** de la pradera con muros bajos → **grúa abajo** hasta un **PP** del celular semienterrado. Indicaciones «cobre oxidado» (en el cable) y «aluminio opaco» (en el marco). | Pasto creciendo, botella deformada al costado. | Año 200 (entra en f690) | Viento, insectos, pasto |
| 12 | 840–860 | Salto | | | Barrido |
| 13 | 860–950 (28,7–31,7) | **G** del montículo con flores → **empuje lento** hacia la tierra. | Brillo del vidrio entre la tierra. | Año 1.000 + «Todavía quedan restos…» | Viento suave |
| 14 | 950–1010 (31,7–33,7) | **PPP** del fragmento de vidrio en la tierra, con destello en f975. | Restos de marco y plástico visibles alrededor. | «Pero hay algo que probablemente desapareció mucho antes.» | Destello, silencio relativo |
| 15 | 1010–1035 | **Transición por forma (match cut):** el rectángulo de vidrio sucio se funde con el vidrio limpio del celular original, en la misma posición y tamaño. | Disolvencia de 25 frames. | — | Motivo de la foto |
| 16 | 1035–1150 (34,5–38,3) | **PPP** de la pantalla original: el perro reaparece y **se fragmenta** (bloques de píxeles que se apagan de a uno) hasta quedar negro. Rótulo chico permanente: «representación». | Metáfora visual, no simulación física. | «La foto. Sin energía, la memoria del celular puede perder sus datos en años o décadas.» | Ruido digital suave que se apaga |
| 17 | 1150–1260 (38,3–42) | **Pausa de 0,5 s en negro** → la foto vuelve (encendida) → misma composición que el plano 1, de modo que **f1259 = f0**. | Contador a «AÑO 0». | Cierre: «Los restos duran siglos. Tus recuerdos, solo si tienen copia.» | Zumbido del cargador (empalma con f0) |

---

## D. Rediseño del final

1. **Plantar (3,5–6,7 s):** la voz dice «la foto sigue ahí adentro» y la imagen muestra *dónde*: un chip con la miniatura del perro. El espectador aprende que la foto no está «en la pantalla», sino en la memoria.
2. **Recordar sin decir:** en los primeros planos de cada época (años 10 y 200) el vidrio negro refleja tenuemente la forma del perro. Es un eco, no un fantasma literal, y cada vez se ve menos.
3. **Pagar (31,7–38,3 s):** después de mostrar lo que **sí** queda (vidrio, metal, plástico), la frase «hay algo que desapareció mucho antes» abre el giro. La transición por forma vuelve a la foto, y la fragmentación con la frase que explica por qué (sin energía, la memoria pierde datos) cierra la idea. El rótulo «representación» deja claro que es una metáfora.
4. **Cerrar el círculo (38,3–42 s):** volvemos al plano exacto del inicio, con la foto viva. La frase final da la lectura («los restos duran siglos; tus recuerdos, solo si tienen copia»), y al repetirse el Short la pregunta del gancho se lee distinta: ya no es sobre el plástico, es sobre la foto.

No hace falta música ni dramatismo: la emoción sale del contraste entre «un vidrio que dura» y «una foto que no».

---

## E. Revisión científica

| Afirmación | Veredicto | Formulación segura |
|---|---|---|
| «El vidrio dura ~1.000.000 de años» | ❌ **Sin respaldo.** Se rastrea a un comentario de 1972 de la química Evelyn Marboe en el NYT: una botella «podría no fragmentarse en arena por un millón de años». Es una conjetura con reservas, no una medición. | «El vidrio puede permanecer muchísimo tiempo; no se conoce un tiempo medido de desaparición.» |
| «Aluminio: 200 a 500 años» y «PET: ~450 años» | ⚠️ **Estimaciones repetidas sin estudio primario.** Las fuentes las atribuyen a NOAA, Mote Marine Lab o Woods Hole según el caso; el rango de las latas varía de 80 a 200 o 500 años según la fuente. Describen persistencia o fragmentación en el mar, no descomposición completa. | No dar cifras. En el año 1.000, decir «todavía quedan restos». |
| «En unos días, la batería se agota» | ✅ Un celular encendido sin carga se agota en horas o días. El autodescargado de Li‑ion es ~1–2 %/mes (más ~3 % del circuito de protección) y se duplica cada +10 °C. | Igual. |
| «La batería puede hincharse» | ⚠️ **Plausible pero no cuantificable.** La descarga profunda y el almacenamiento prolongado se asocian a hinchazón por gases, pero no hay umbrales públicos confiables. | Mantener «puede». |
| «La memoria puede perder sus datos en años o décadas» | ✅ **Con matices.** La norma JEDEC JESD218 exige para SSD de cliente una retención sin energía de **1 año a 30 °C**, medida al final de su vida útil (peor caso); en memorias poco usadas suele ser mayor, y el calor la acorta. Es una especificación de SSD, no de teléfonos, pero se trata de la misma tecnología (NAND flash). La sentencia es robusta en lo comparativo: la pérdida ocurre en una escala de **años/décadas**, no de siglos. | «Sin energía, la memoria puede perder sus datos en años o décadas.» |
| «El cobre se pone verde» | ✅ El cobre expuesto a humedad forma pátina (carbonatos y cloruros); la corrosión de placas depende de la humedad, los contaminantes y el acabado. | Igual. |
| «El vidrio sigue entero en el año 200» | ✅ Razonable: el vidrio enterrado en seco casi no se corroe y en húmedo se meteoriza en la superficie, aunque el núcleo suele sobrevivir. | Mostrar la superficie opaca y rayada, no un vidrio impecable. |
| La foto en la nube | ✅ Si hay copia, la foto no depende del teléfono. | Cierre: «solo si tienen copia». |

**Hipotético y declarado como tal:** el orden y el aspecto visual del deterioro (mesa, pared, pasto) son ilustrativos. La leyenda «simulación» queda visible al final.

**Fuentes:**
- [Skeptics SE — origen de la cifra del millón de años](https://kiwix.lema.org/skeptics.stackexchange.com_en_all_2023-11/questions/52827/does-glass-decompose-in-one-million-years)
- [Glass Online — críticas de la industria a la cifra](https://glassonline.com/?p=7249)
- [AnandTech — retención de datos en SSD (JESD218)](https://anandtech.com/print/9248/the-truth-about-ssd-data-retention)
- [Flash Memory Summit 2012 — casos de uso de retención](https://old.flashmemorysummit.com/English/Collaterals/Proceedings/2012/20120821_TC12_Vasudevan.pdf)
- [Dell KB — retención de datos con equipos apagados](https://www.dell.com/support/kbdoc/en-ca/000198930/ssd-data-retention-considerations-when-powering-off-systems-for-a-prolonged-duration)
- [Battery University — autodescarga](https://batteryuniversity.com/article/elevating-self-discharge)
- [Corning Museum of Glass — meteorización del vidrio](https://blog.cmog.org/2011/glass-corrosion-weathering)
- [Experimento Ballidon (52 años de vidrio enterrado)](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11913731/)
- [SurferToday — tabla de degradación](https://www.surfertoday.com/environment/the-estimated-decomposition-rates-of-common-marine-debris-items)
- [Sailors for the Sea — «How Long Till It's Gone»](https://sailorsforthesea.org/wp-content/uploads/How-Long-Till-Its-Gone-Jan2024-1.pdf)
- [Nokia Bell Labs — corrosión por fluencia en PCB](https://www.nokia.com/bell-labs/publications-and-media/publications/relative-humidity-dependence-of-creep-corrosion-on-printed-circuit-boards)
- [RSC Advances 2025 — partículas y corrosión](https://pubs.rsc.org/en/content/articlehtml/2025/ra/d5ra04326c)

---

## F. Plan técnico de producción

**Se conserva sin cambios:** `decay.ts` (curvas), `Room`, `Floor`/`Mound`, `Grass`, `Vine`, `Lamp`, `Book`, `Bottle`, `Charger`, `Nightstand`, `DogScreen`, `Light`, `Rain`, `TimeFlicker`, `Atmosphere`, `OdometerCounter`, los scripts de QA, los efectos sintetizados y las tomas de voz `year1`, `year10`, `year50`, `year200` y `year1000`.

**Se crea en una carpeta nueva** (`src/videos/03-1000-anos/final/` y `src/videos/03-1000-anos/final/componentes/`):
- `timelineV3.ts` — mapa frame → año de 1.260 frames, con la lectura lenta de los años 30–50; tiempos de entrada de la voz; planos.
- `shots.ts` — lista de planos (tipo, encuadre `{cx, cy, zoom, rotX, rotY}`, easing y motivación).
- `CameraV3.tsx` — interpola entre planos con cortes o movimientos, y permite planos «macro» que montan el celular en otra escena.
- `PhoneMacro.tsx` — escena dedicada al celular grande (cenital y lateral bajo) que reutiliza `Phone`/`DogScreen` y las curvas de `decay.ts`, con más detalle: tornillos, junta y puerto.
- `MemoryXRay.tsx` — vista estilizada del chip con la miniatura.
- `PhotoDecay.tsx` — fragmentación de píxeles determinista con `random()`.
- `Callout.tsx` — indicación grande con flecha.
- `MatchCut.tsx` — fundido entre el fragmento y el vidrio original.
- `MilAnosCelularV3.tsx` y su registro en `Root.tsx` (solo agregar).
- Efectos nuevos sintetizados en `scripts/gen-sfx-1000-anos-final.mjs`: motivo de la foto, ruido digital, crujido de madera, tierra.

**Se retira de la V3** (sin borrar archivos): la pila de `DecayLabel`, la carta «ÚLTIMO EN PIE» con cifra y los rótulos chicos de la barra.

**Créditos:** solo las 6 líneas nuevas de voz (~330 créditos), y solo con aprobación.
