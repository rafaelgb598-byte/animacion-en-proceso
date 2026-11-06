# PROMPT MAESTRO — Short «Último en pie: el celular en la mesa de luz» (Remotion, animación por código)

Sos el desarrollador y animador a cargo de construir y renderizar un YouTube Short vertical en mi proyecto local de Remotion. Este documento contiene todas las decisiones creativas y técnicas. No dependas de ninguna conversación anterior. El trabajo termina cuando pasa el control de calidad de la sección 12, no cuando compila.

**Todo se dibuja y anima por código** (SVG + transformaciones CSS 3D + filtros), con la misma técnica y el mismo lenguaje de materiales del Short `DecoyShort` que ya existe en el proyecto: objetos físicos estilizados sobre fondo oscuro bajo un foco cálido, grano, sombras suaves, 2.5D sin Three.js. **No se usan imágenes generadas por IA ni video generado.** Además del Short, dejás una plantilla reutilizable (`UltimoEnPie`) para los próximos episodios.

## 0. Reglas de trabajo (obligatorias)

1. **No uses servicios pagos** (APIs, bancos de sonido, render en la nube) sin mi autorización explícita. Este Short no necesita ninguno.
2. **Nada destructivo.** No borres ni sobrescribas archivos existentes. Todo lo nuevo va en carpetas nuevas. En `Root.tsx` solo *agregás* la composición. No modifiques los archivos de `DecoyShort`: si querés reutilizar algo (`lib/anim.ts`, `Backdrop`, `gen-sfx.mjs`), **copialo** a la carpeta nueva. Si hay git, trabajá en la rama `short/ultimo-en-pie-celular` y no hagas push.
3. **No instales nada sin consultarme.** Mostrame una lista consolidada (paquete, para qué, tamaño) y esperá mi OK. Preferí `npx remotion add <paquete>`.
4. **Si algo cambia en el código y no fuiste vos, fui yo:** no lo pises.
5. **Honestidad en el informe.** Si algo no quedó como se especifica, decilo.

## 1. Paso 1 — Inspección

1. Revisá `package.json`, `src/`, `Root.tsx`, `remotion.config.ts`, `public/`, y estudiá cómo está hecho `DecoyShort` (cámara, backdrop, tarjeta, vasos SVG, mano, grano, `timeline.ts`, `theme.ts`, `lib/anim.ts`, `scripts/gen-sfx.mjs`). Este Short debe sentirse hecho por el mismo estudio.
2. Verificá Remotion v4 y versiones alineadas de `@remotion/*`.
3. Si está el plugin `remotion-best-practices`, cargalo y seguí sus reglas.
4. Paquetes probables (ya deberían estar): `@remotion/google-fonts`, `@remotion/media`, `zod`.
5. Escribime un resumen breve del plan y seguí.

## 2. El video

- Composición: id `MilAnosCelularV2`, 1080 × 1920, 30 fps, **1.200 frames (40 s exactos)**.
- Premisa: un celular queda cargando sobre una mesa de luz. Nadie vuelve nunca. Un contador corre de AÑO 0 a AÑO 1.000 y el deterioro avanza **de forma continua** sobre cada objeto. Gana **el vidrio de la pantalla**. La foto que mostraba, no.
- Un único plano secuencia, sin cortes (salvo el corte de loop en f1155). El cambio lo hacen el tiempo, los materiales, la luz y una cámara casi quieta.
- Sin narración. Texto en pantalla en español neutro.
- El frame 1199 debe ser visualmente idéntico al frame 0: loop sin costura.
- Público: 16–40 años, hispanohablante; se entiende sin leer.

### Rigor (no negociable)

- Es una simulación ilustrada. La carta final dice «simulación · estimaciones».
- Las cifras publicadas (sección 7) son para residuos **a la intemperie**. Mientras el cuarto está cerrado (AÑO 0 a ~AÑO 8) solo hay polvo, amarilleo y manchas. Desde que se rompe la ventana y entra el agua se aplican las tasas de intemperie.
- Solo tres etiquetas llevan número, todas con fuente (aluminio, PET, vidrio). El resto describe procesos sin cifras.
- Sin personas. La foto del fondo de pantalla es un perro ilustrado (vector original, sin marcas ni íconos de interfaz).

## 3. Idea visual: el tiempo como material

En el Short del señuelo la regla de comparación revelaba lo que hace el cerebro. Acá el instrumento es el **contador de años con barra logarítmica**, y lo que se revela es qué materiales resisten. Cada objeto es un componente SVG/CSS 3D que recibe una sola prop: `year` (número continuo). Toda su apariencia sale de funciones de deterioro en `decay.ts`. Así el deterioro no salta entre «estados»: avanza, y el espectador lo ve pasar.

El tiempo no corre lineal: se detiene casi en cada hito (para que se lean las etiquetas) y acelera entre hitos (sección 5).

## 4. Dirección de arte

### 4.1 Concepto «Mesa de evidencia, mil años después»

El mismo set del canal: un objeto cotidiano sobre fondo oscuro bajo un foco cálido, materiales táctiles, sombras creíbles. La diferencia es que acá el set también envejece: la pared detrás se mancha, se raja y cae; el piso se vuelve tierra; el foco cálido de velador se convierte en luz de día fría y después en luz exterior verdosa. Premium, sobrio, editorial. Nada de neón, glitch, emojis, partículas decorativas sin función ni transiciones de plantilla.

### 4.2 Paleta (`theme.ts`)

Materiales (compartidos con el lenguaje del señuelo):

| Token | Hex | Uso |
| --- | --- | --- |
| bg | #0A0B0D | Vacío, viñeta a #000 |
| bgLit | #1A1C20 | Centro del foco |
| wall | #2A2620 → #3A352C | Pared (gradiente vertical) |
| laminate | #8C6E4E / #A2825E | Laminado de la mesa de luz |
| particle | #6B5A45 | Aglomerado expuesto |
| phoneBody | #1C1D21 | Cuerpo y bisel |
| aluminum | #9AA0A8 → dull #6E727A | Marco del celular |
| glass | #0E1116 + especular #FFFFFF al 22 % | Pantalla apagada |
| cableWhite | #E8E4DA → #BDB6A6 | Cable y cargador |
| copper | #B87333 → verdigris #4E8F7A | Cobre expuesto |
| lampMetal | #7C7F86 → rust #8A4B2A | Base del velador |
| fabric | #E9DFC9 | Pantalla del velador |
| paper | #F3EFE6 → old #D9C49A | Libro |
| pet | rgba(200,225,235,.35) | Botella |
| water | rgba(120,170,200,.45) | Agua |
| moss | #4F6B3A | Musgo |
| grass | #5E7F3F / #7FA05A | Pasto |
| soil | #3B2F24 | Tierra |
| vine | #3F6A3A | Enredadera |

Interfaz de la serie:

| Token | Hex | Uso |
| --- | --- | --- |
| bone | #F2EEE6 | Textos |
| amber | #E0A33B | **Solo** el contador, el punto de la barra y «ÚLTIMO» |
| ash | #B8B4AA | Etiquetas y barra |
| ink | #0B0C0E | Panel de la carta (78 %) |

Regla de color: el ámbar es el tiempo. No aparece en ningún objeto.

> Nota: si después decido que este Short va en el mismo canal que el señuelo, cambio `amber` por el acento de ese canal y las fuentes en `theme.ts`. Por eso **ningún color ni fuente puede estar escrito fuera de `theme.ts`**.

### 4.3 Tipografía (`@remotion/google-fonts`)

- **IBM Plex Mono** 500/700: contador, barra, etiquetas, pie de la carta (`tabular-nums`).
- **Barlow Condensed** 600: gancho, nombre del ganador, «La foto, no.».

### 4.4 Luz (la luz cuenta el tiempo)

Implementada como capas por código, interpoladas por `year`:

| Rango | Fuente | Color | Comportamiento |
| --- | --- | --- | --- |
| AÑO 0 | Velador (desde la pantalla de tela) + pantalla del celular | Cálida #FFC98A, foco elíptico centrado en el velador | Respira ±2 % |
| 1 SEMANA → AÑO 8 | Ventana (de día) | Gris neutro #C9CDD2 | Haz diagonal desde la ventana, polvo visible dentro del haz |
| AÑO 8 → AÑO 50 | Ventana rota | Fría #B4C3CC | Haz más ancho; lluvia en AÑO 30–60 |
| AÑO 50 → 1.000 | Exterior (la pared ya cayó) | Verdosa suave #CFE0C2 | Luz cenital pareja, sombras cortas |

El velador se apaga en f90 (corte de luz): fundido de 6 frames con un pequeño parpadeo (dos caídas de 40 % en f88 y f90).

### 4.5 Materiales, superficie y grano

- Fondo/vacío: igual que `DecoyShort` (gradiente radial + viñeta + grano `feTurbulence` baseFrequency 0.9, `seed = frame % 30`, opacidad 0,05, overlay).
- Textura de papel/laminado: `feTurbulence` estática con semilla fija por material, opacidad 0,05–0,08.
- Sombras de contacto debajo de cada objeto: elipse con blur, que se ablanda cuando entra luz difusa.
- **Polvo de superficie**: una capa por objeto (`DustLayer`) con ruido fino gris claro, opacidad = `dust(year)` (0 → 0,35 en AÑO 1 → 0,5 en AÑO 8, luego lo lava la lluvia y baja a 0,1).
- **Polvo en suspensión**: 40 partículas de 2–4 px, opacidad 0,15–0,35, deriva senoidal lenta, solo visibles dentro del haz de luz, posiciones con `random('dust-i')`. Desaparecen desde AÑO 50 (exterior).

## 5. Tiempo: frames → años

El año es continuo y se calcula en `timeline.ts` con `yearAt(frame)`. Entre hitos se interpola **log10(año)** con `Easing.bezier(0.65, 0, 0.35, 1)` (arranca lento, acelera, frena). En los tramos de «lectura» el año queda casi quieto (deriva mínima para que el contador no se congele del todo).

| Frames | Año | Tramo |
| --- | --- | --- |
| 0–80 | 0 | Gancho (año fijo) |
| 80–100 | 0 → 1 semana (0,019) | Salto |
| 100–200 | 1 semana | Lectura |
| 200–230 | → 1 | Salto |
| 230–350 | 1 → 1,3 | Lectura |
| 350–380 | → 10 | Salto |
| 380–530 | 10 → 12 | Lectura |
| 530–560 | → 50 | Salto |
| 560–710 | 50 → 55 | Lectura |
| 710–740 | → 200 | Salto |
| 740–890 | 200 → 210 | Lectura |
| 890–920 | → 1.000 | Salto |
| 920–1155 | 1.000 | Lectura, revelación y carta |
| 1155–1199 | 0 | Corte de loop (igual al frame 0) |

Durante los saltos se acelera también el «ruido del tiempo»: el grano sube a 0,08, las partículas se aceleran, y la luz parpadea suavemente como en un timelapse (ciclo día/noche: oscilación de luminosidad ±18 % con 3 ciclos por salto). Esto es lo que vende que pasa el tiempo sin usar cortes.

### Contador (`OdometerCounter`)

- Muestra el hito más cercano por debajo del año actual con texto: «AÑO 0», «1 SEMANA», «AÑO 1», «AÑO 10», «AÑO 50», «AÑO 200», «AÑO 1.000». Durante los saltos los dígitos **ruedan rápido** pasando por valores intermedios reales (`Math.floor(year)`), y frenan al llegar al hito con un clic.
- Posición: x 100, y 300 (línea base), Plex Mono 700, 72 px, ámbar.
- Debajo, en Mono 22 px ash: la fecha relativa en palabras durante la lectura («una semana después», «un año después», etc.).

### Barra de tiempo (`TimeBar`)

y 1390, de x 100 a x 920, 4 px, ash al 60 %, escala logarítmica de 1 día a 1.000 años, marcas con rótulos Mono 20 px «1 sem · 1 a · 10 · 100 · 1.000». Punto ámbar de 14 px en `log10(year)`; en f1155 vuelve a la izquierda sin animación.

## 6. Los objetos (componentes, todos con prop `year`)

### 6.1 Layout (coordenadas de mundo en 1080 × 1920)

Zona crítica: x 80–940, y 240–1420. Centro de composición x = 540.

| Elemento | Posición |
| --- | --- |
| Pared | Plano trasero x 0–1080, y 0–1180, a translateZ −400 |
| Ventana | En la pared, arriba a la izquierda: x 120–420, y 360–760, marco de 14 px |
| Piso | Plano inclinado (rotateX 78°) desde y 1180 hacia abajo |
| Mesa de luz | Caja CSS 3D: frente x 230–850, y 980–1520; tapa de 620 × 300 px de profundidad, cajón con tirador metálico |
| Celular | Sobre la tapa, centro (560, 1020) en vista, 200 × 410 px, rotado −8° en plano, radio 32 |
| Cargador + cable | Cargador enchufado en la pared a la derecha (x 900, y 1120); cable en curva Bézier hasta el puerto inferior del celular |
| Velador | Base metálica en (330, 980), altura total 420 px, pantalla de tela trapezoidal |
| Libro | Sobre la tapa, a la derecha del celular, (760, 1005), 210 × 60 px de canto visible |
| Botella PET | Detrás del libro, (800, 900), 90 × 300 px |
| Contador | (100, 300) |
| Gancho / textos | Centro y 1250 |
| Etiquetas | Desde (100, 1300) hacia arriba |
| Carta | Centro (540, 1150) |
| Origen de cámara | (540, 1020) |

### 6.2 Comportamiento por objeto (`decay.ts` define cada curva como función de `year`)

**Celular** (`Phone`)
- AÑO 0: pantalla encendida con la ilustración del perro (golden retriever vectorial simple: 6–8 formas, sin texto), brillo pulsante ±4 % (período 60 frames), ícono de carga **no** (sin interfaz). En f45 vibra: ±2 px durante 8 frames.
- f90: la pantalla se apaga (fundido 8 frames) y queda vidrio oscuro con reflejo especular de la ventana (un rectángulo claro deformado al 22 %).
- AÑO 1–10: polvo sobre el vidrio (la capa de polvo no tapa el especular del todo).
- AÑO 8–15: la batería se hincha: el vidrio se levanta en el borde inferior (rotateX hasta 4°, aparece una línea de luz en el borde). Etiqueta «batería de litio · puede hincharse».
- AÑO 50+: el marco de aluminio pierde brillo (aluminum → dull), aparecen picaduras (puntos con `random`).
- AÑO 200: el celular queda en el suelo, semienterrado (máscara de tierra que sube 30 % del cuerpo); el vidrio sigue entero.
- AÑO 1.000: solo asoma un rectángulo oscuro de vidrio con un destello especular que cruza en f960–990.

**Cable y cargador** (`Charger`)
- AÑO 1: plástico opaco. AÑO 10: se agrieta (trazos finos). AÑO 50: el forro se parte y asoma cobre. AÑO 200: cobre en verdigris, tramos desaparecidos (el trazo se fragmenta con `strokeDasharray`). AÑO 1.000: no queda.

**Velador** (`Lamp`)
- AÑO 0: encendido, luz cálida, la tela translúcida.
- AÑO 1: tela manchada (2–3 manchas irregulares). AÑO 10: tela rasgada.
- AÑO 30–50: cae de costado (rotación de 70° con `spring({damping: 14, stiffness: 140, mass: 0.8})` que se dispara al cruzar el año 35; sonido de golpe). La tela desaparece.
- AÑO 50–200: base metálica se oxida (lampMetal → rust con manchas que crecen). AÑO 1.000: no queda.

**Libro** (`Book`)
- AÑO 1: papel amarillea (paper → old), el canto se ondula (path con ondas de amplitud creciente).
- AÑO 10: se hincha por humedad (escala Y 1,25, tapa curvada).
- AÑO 30–50: se deshace en láminas (se separa en 5 franjas que se hunden y desvanecen). AÑO 50: no queda.

**Botella PET** (`Bottle`)
- AÑO 0: medio llena. AÑO 1: un cuarto (evaporación). AÑO 10: vacía, con condensación seca.
- AÑO 50: descolorida (opacidad del plástico baja, tono amarillento leve).
- AÑO 200: deformada (path de la silueta con abolladuras), caída en el suelo.
- AÑO 1.000: no queda (desaparece en AÑO 500–900 en fundido lento). Etiqueta «PET · ~450 años» aparece al empezar la lectura de AÑO 1.000 para explicar por qué ya no está.

**Mesa de luz** (`Nightstand`)
- AÑO 1: polvo. AÑO 10: el laminado se levanta en las esquinas (triángulos que se curvan) y aparece aglomerado.
- AÑO 30–50: se hincha y colapsa: la tapa se inclina, las caras laterales se separan (cada cara de la caja CSS 3D rota y cae con spring), los objetos bajan con ella. Etiqueta «aglomerado · se deshace».
- AÑO 50–200: los restos se cubren de musgo y desaparecen bajo la tierra.

**Cuarto** (`Room`)
- Pared: AÑO 1 mancha de humedad que crece desde el techo; AÑO 8 el vidrio de la ventana se rompe (fragmentos SVG que caen en 10 frames, sonido de vidrio) — etiqueta «ventana · rota»; AÑO 10 la enredadera entra por la ventana (path dibujado con `strokeDashoffset`, hojas que aparecen escalonadas); AÑO 30–50 la pared se raja (grietas dibujadas) y cae por partes (paneles que se separan hacia atrás y se desvanecen), dejando ver cielo; AÑO 200 ya no hay pared.
- Piso: se cubre de musgo (AÑO 20+), luego tierra y pasto (AÑO 100+). El pasto son 300 briznas SVG con altura y balanceo por `random` y `sin(frame)`; crecen con `year`.
- AÑO 1.000: montículo de tierra con pasto y 12 flores silvestres simples; el fragmento de vidrio asoma cerca del centro (550, 1080).

### 6.3 Gancho y textos

- Gancho f12–f80: «Lo dejás cargando.» / «Nunca volvés.» Barlow 600, 64 px, bone, centrado en y 1250, palabra por palabra (6 frames por palabra, sube 24 px + opacidad, `Easing.out(Easing.cubic)`). Sale en 8 frames.
- Etiquetas de desaparición (`DecayLabel`): Plex Mono 500, 30 px, ash, apiladas hacia arriba desde (100, 1300) con −46 px. Entran en 8 frames, duran 45, salen en 8. Máximo 3. Formato «objeto · estado».

| Inicio | Etiqueta |
| --- | --- |
| f100 | luz · cortada (nadie paga) |
| f115 | pantalla · apagada |
| f235 | papel · amarillea |
| f250 | tela · se mancha |
| f385 | ventana · rota |
| f400 | batería de litio · puede hincharse |
| f415 | libro · se hincha |
| f565 | aglomerado · se deshace |
| f580 | libro · desapareció |
| f595 | tela · desapareció |
| f745 | madera · desapareció |
| f760 | cobre del cable · verde |
| f775 | PET · deformado, entero |
| f925 | aluminio · 200 a 500 años |
| f940 | PET · ~450 años |

### 6.4 Revelación y carta

- f1000–1060: único movimiento intencional de cámara: acercamiento 1,00 → 1,14 hacia el fragmento de vidrio (`Easing.bezier(0.45, 0, 0.2, 1)`), el resto se oscurece al 60 %.
- f990: destello especular cruza el vidrio (gradiente diagonal, 24 frames).
- f1060: carta (`LastStandingCard`): panel ink 78 %, 820 × 420, radio 18, centro (540, 1150). «ÚLTIMO EN PIE» Plex Mono 700 28 px ámbar, tracking +12 % · «el vidrio de la pantalla» Barlow 600 88 px bone · «~1.000.000 de años» Plex Mono 500 40 px bone · «simulación · estimaciones» Plex Mono 22 px bone 60 %. Entra con escala 0,96 → 1 y opacidad en 10 frames.
- f1100: debajo del panel, «La foto, no.» Barlow 600 52 px bone. Al mismo tiempo, sobre el vidrio, aparece durante 20 frames un fantasma al 12 % de la ilustración del perro y se desvanece (lo único emotivo del video, contenido).
- f1155: corte seco al frame 0.

## 7. Datos: `src/videos/03-1000-anos/v2/episodes/celular.decay.ts`

Fuente de verdad de etiquetas con cifra. Solo estas tres:

| Etiqueta | Cifra | Fuente |
| --- | --- | --- |
| aluminio · 200 a 500 años | 200–500 años (latas, intemperie) | Milton Keynes Council, «Litter breakdown times» |
| PET · ~450 años | 450 años | Milton Keynes Council; SurferToday |
| ~1.000.000 de años (vidrio) | 1.000.000 de años | South Carolina DNR, «How Long Does It Take» |

Agregá una `nota`: el vidrio de los celulares es aluminosilicato templado, no vidrio de botella; la carta usa la cifra general de vidrio y «estimaciones» cubre la simplificación. Las curvas de deterioro de los demás objetos son de proceso, ilustrativas, y deben estar documentadas como tales en comentarios.

Fuentes:
- https://dnr.sc.gov/up2u/decompose.html
- https://www.milton-keynes.gov.uk/sites/default/files/2022-02/Litter%20breakdown%20poster%20PAA.pdf
- https://www.surfertoday.com/environment/the-estimated-decomposition-rates-of-common-marine-debris-items

## 8. Cámara y curvas

- Cámara = contenedor con `perspective: 1800px`, origen (540, 1020), igual que en `DecoyShort`.
- Keyframes (con clamp, `Easing.bezier(0.45, 0, 0.2, 1)`):

| Frames | Escala | rotateX | Nota |
| --- | --- | --- | --- |
| 0 → 80 | 1,00 → 1,02 | 6° | Leve acercamiento durante el gancho |
| 80 → 920 | 1,02 → 0,98 | 6° → 3° | Se aleja muy despacio mientras el cuarto se abre |
| 1000 → 1060 | → 1,14 | → 8° | Acercamiento al vidrio |
| 1155 | valores del frame 0 | 6° | Corte |

- Deriva constante sumada: x = 3·sin(2π·f/150), y = 2·sin(2π·f/240). Ambos períodos dividen 1.200.
- Caídas (velador, caras de la mesa, fragmentos): `spring({damping: 14, stiffness: 140, mass: 0.8})`.
- Reacomodos: `spring({damping: 200})`. Salidas: `Easing.in(Easing.cubic)`, 10–15 frames.
- Los eventos de deterioro que no son caídas no usan springs: dependen de `year`, para que corran con el tiempo.

## 9. Audio (sintetizado por código, sin licencias)

Script nuevo `scripts/gen-sfx-1000-anos-v2.mjs` (copiá el enfoque de `gen-sfx.mjs`): WAV 48 kHz mono, 16 bits, semilla fija → `public/videos/03-1000-anos/v2/sfx/`.

| Archivo | Frame(s) | Receta | Volumen |
| --- | --- | --- | --- |
| tick.wav | 0, 30, 60 | Seno 2 kHz + ruido, 12 ms, caída exponencial | 0,40 |
| charger-hum.wav | 0–90 | Seno 100 + 200 Hz, fade out 3 frames en f90 | 0,06 |
| buzz.wav | 45 | Seno 160 Hz modulado a 30 Hz, 250 ms | 0,30 |
| power-off.wav | 88 | Clic eléctrico + caída de tono 2 kHz → 200 Hz en 120 ms | 0,25 |
| timewarp.wav | cada salto (80, 200, 350, 530, 710, 890) | Barrido de ruido filtrado 200 Hz → 3 kHz, 1 s, con tren de clics que acelera | 0,22 |
| odometer.wav | final de cada salto (100, 230, 380, 560, 740, 920) | Tres clics mecánicos separados 25 ms | 0,35 |
| glass-break.wav | cuando `year` cruza 8 | Ráfaga de ruido agudo + 6 tintineos senoidales 3–6 kHz con semilla | 0,30 |
| lamp-fall.wav | cuando `year` cruza 35 | Seno 90 Hz caída 150 ms + clic metálico | 0,35 |
| room.wav | 90–380 | Ruido rosa pasabajos 300 Hz | 0,04 |
| wind.wav | 380–1155 | Ruido rosa pasabanda 200–1.200 Hz, modulación lenta, sube en AÑO 200 | 0,05 → 0,10 |
| rain.wav | durante AÑO 30–60 | Ruido blanco pasaaltos 2 kHz granulado | 0,08 |
| insects.wav | 740–920 | Pulsos de seno 4–5 kHz irregulares | 0,04 |
| glint.wav | 990 | Seno 3 kHz con brillo, 300 ms | 0,15 |
| reveal.wav | 1060 | Seno 55 + 110 Hz, ataque 200 ms, caída 1,8 s | 0,40 |

Los frames de `glass-break` y `lamp-fall` los calcula `timeline.ts` a partir de `yearAt()` (no a mano). Fades de 2–5 ms en extremos. Verificá cada archivo con su forma de onda en PNG. Mezcla: ≈ −14 LUFS integrados, pico real ≤ −1 dBTP. Sin música.

## 10. Arquitectura del código

```
src/
  Root.tsx                                (agregar <Composition id="MilAnosCelularV2" .../>)
  ultimo-en-pie/
    UltimoEnPie.tsx                       plantilla: Backdrop → Camera(Room + Props) → Atmosphere → UI → AudioLayer
    timeline.ts                           hitos, yearAt(frame), saltos, eventos derivados
    decay.ts                              curvas de deterioro por material (funciones puras de year)
    theme.ts                              paleta, fuentes, layout, zona segura
    episodes/
      celular.ts                          props del episodio: objetos, etiquetas, ganador, cifra, gancho, origen del zoom
      celular.decay.ts                    cifras con fuente (sección 7)
  components/ultimo-en-pie/
    camera/Camera.tsx
    scene/Backdrop.tsx  scene/Room.tsx  scene/Ground.tsx  scene/Vine.tsx  scene/Grass.tsx
    props/Phone.tsx  props/DogScreen.tsx  props/Charger.tsx  props/Lamp.tsx  props/Book.tsx  props/Bottle.tsx  props/Nightstand.tsx
    fx/Light.tsx  fx/Atmosphere.tsx  fx/DustLayer.tsx  fx/Rain.tsx  fx/TimeFlicker.tsx
    ui/OdometerCounter.tsx  ui/TimeBar.tsx  ui/DecayLabel.tsx  ui/HookText.tsx  ui/LastStandingCard.tsx
    audio/AudioLayer.tsx
    debug/SafeZoneOverlay.tsx  debug/YearReadout.tsx
scripts/
  gen-sfx-ultimo.mjs
public/videos/03-1000-anos/v2/sfx/
```

Reglas:
- Animación solo con `useCurrentFrame()`, `interpolate()` (siempre `extrapolateLeft/Right: 'clamp'`), `spring()` y `<Sequence>`. Prohibido: `transition`, `@keyframes`, `requestAnimationFrame`, `Date`, `Math.random()`. Azar con `random('semilla')`.
- Cada objeto es una función pura de `year` (y de `frame` solo para micro-movimiento: vibración, balanceo de pasto, respiración de luz). Así cualquier frame se puede renderizar aislado.
- **Plantilla reutilizable:** `UltimoEnPie` no sabe que hay un celular. Recibe una lista de props de escena desde `episodes/*.ts`. Los componentes de objetos son parametrizables (colores, tamaños, curvas) para reutilizarlos en otros lugares (cocina, aula).
- Props con zod: `showSafeZones` (false), `showYear` (false, muestra `YearReadout` para depurar).
- TypeScript estricto, sin `any`. Código en inglés; textos en pantalla en español.
- Ningún número mágico de frame fuera de `timeline.ts`; ningún color ni fuente fuera de `theme.ts`.
- Rendimiento: el pasto (300 briznas) y las partículas en un solo `<svg>` cada uno; si el render de un frame supera 1,5 s, reducí a 180 briznas y avisame.

## 11. Vista previa

- Remotion Studio sin errores ni advertencias.
- `npx remotion still` en `out/ultimo-en-pie/stills/`, con y sin `showSafeZones`: 0, 45, 92, 150, 215, 300, 365, 450, 545, 640, 725, 820, 905, 980, 1030, 1080, 1120, 1160, 1199.
- Hoja de contactos `out/ultimo-en-pie/stills/contact-sheet.png`.
- **Mirá cada imagen** y corregí hasta que pase la sección 12. Prestá atención especial a que los objetos se reconozcan como lo que son a 360 px de ancho.

## 12. Control de calidad

| Prueba | Criterio |
| --- | --- |
| Reconocimiento | En la hoja reducida a 360 px se identifican celular, cable, velador, libro, botella y mesa de luz en el frame 0 |
| Continuidad del deterioro | Entre frames consecutivos ningún objeto cambia de golpe salvo caídas, rotura de vidrio y apagado; revisá pares 199/200, 529/530, 709/710 |
| Storyboard | Cada evento de las secciones 5 y 6 en su frame (±2) |
| Zona segura | Ningún texto fuera de x 80–940, y 240–1420, incluido el acercamiento |
| Legibilidad móvil | Contador, etiquetas y carta legibles a 360 px; ningún texto menor a 20 px |
| Contraste | Texto/fondo ≥ 4,5:1 calculado sobre la zona real; si no da, sombra o velo local |
| Coherencia estética | Mismo lenguaje de materiales que `DecoyShort` (sombras, grano, foco); un solo acento ámbar; dos familias tipográficas |
| Loop | Frame 1199 vs frame 0: diferencia mínima (compará con script) |
| Rigor | Solo las tres cifras con fuente; «simulación · estimaciones» visible; sin personas ni texto de interfaz en la pantalla |
| Audio | Sin clipping; loudness según sección 9; efectos en su frame |
| Render | H.264, 1080 × 1920, 30 fps, 1.200 frames, 40,0 s (`npx remotion ffprobe`) |

## 13. Render final

`npx remotion render MilAnosCelularV2 out/ultimo-en-pie/celular_v1.mp4 --codec=h264 --crf=18`. Verificá con ffprobe y loudness.

## 14. Informe final

1. Rutas absolutas del MP4 y de la hoja de contactos.
2. Estado: **terminado** o **borrador** (y por qué).
3. Tabla de la sección 12 con resultado por prueba.
4. Desvíos respecto de este documento y su motivo.
5. Qué tengo que escuchar y qué tengo que mirar yo.
6. Cómo crear el próximo episodio con la plantilla (qué archivo nuevo, qué componentes reutilizar, qué objetos faltarían).
7. Paquetes instalados (si te autoricé alguno).

## 15. Texto para publicar (no lo publiques vos)

- Título: «Lo dejás cargando y nunca volvés. ¿Qué queda? · año 0 → 1.000»
- Descripción: «Simulación animada. Los tiempos de descomposición son estimaciones publicadas; fuentes en el comentario fijado. ¿Qué lugar dejamos abandonado en el próximo?»
- Comentario fijado: las tres fuentes + «El vidrio de tu celular dura más que vos, que la casa y que la botella. La foto, no.»
