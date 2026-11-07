# PROMPT — Short «Último en pie» · Episodio 2: «¿Qué queda de tu cocina en 1000 años?» (Remotion)

Sos el desarrollador a cargo del segundo episodio de la serie «Último en pie». El piloto (el celular en la mesa de luz, `03-1000-anos-celular`, versión v4) ya está hecho en este mismo proyecto. Este episodio **reutiliza la plantilla y los componentes de la serie** y agrega una escena nueva: una cocina.

## 0. Reglas

1. **Nada destructivo.** No toques las composiciones del celular ni sus assets. Trabajá en una composición nueva `UltimoEnPieCocina` (o en una rama `short/cocina`).
2. **No instales nada ni uses servicios pagos sin consultarme.** Este episodio no lleva narración ni imágenes generadas por IA: todo es animación por código (SVG/CSS 2.5D), con la misma técnica que el celular y el Short del señuelo.
3. **Ningún número de frame suelto:** todo sale del `timeline` del episodio.
4. **Ningún color ni fuente fuera de `theme.ts`.**
5. **Antes de tocar código**, inspeccioná el proyecto y escribime en 5 líneas cómo está armada la serie: qué componentes reutilizables ya existen (`OdometerCounter`, `TimeBar`, `DecayLabel`, `LastStandingCard`, `Atmosphere`, `AudioLayer`, `theme.ts`, curvas de `decay`), dónde vive el episodio del celular y qué vas a crear nuevo. Esperá mi OK.

## 1. Premisa

- Una cocina de noche. Se corta la luz y nadie vuelve nunca. Un contador corre de AÑO 0 a AÑO 1.000 y el deterioro avanza **de forma continua** sobre cada objeto.
- **Gana el plato que quedó sin lavar en la pileta.** Es el plato de la abuela (flores azules en el borde). Cuando cae la alacena se rompen todos los demás platos; el de la pileta sobrevive porque la bacha de acero lo protege.
- **Remate:** «El plato, sí. La receta, no.» La receta de la abuela, escrita a mano y pegada con un imán en la heladera, se mancha, cae y desaparece.
- **Regla de la serie (nueva, explicitala en el código):** «último en pie» = **el último objeto que todavía se reconoce como lo que era**, no el material con la cifra más alta. Por eso la cerámica gana aunque el vidrio dure más.
- Público: 16–40 años, hispanohablante. Se tiene que entender **sin sonido y sin leer de más**.
- Un único plano, sin cortes salvo el corte de loop. El cambio lo hacen el tiempo, los materiales, la luz y una cámara casi quieta.

### Rigor (no negociable)

- Es una simulación ilustrada. La carta final dice «simulación · estimaciones».
- Solo **cuatro** etiquetas llevan número, todas con fuente (sección 7). El resto describe procesos sin cifras.
- **La cerámica no tiene cifra publicada:** la carta del ganador va **sin número** («sin fecha de vencimiento conocida»).
- Mientras la cocina está cerrada (AÑO 0 a ~AÑO 1) solo hay putrefacción de comida, polvo y manchas. Desde que se rompe la ventana y entra el agua, se aplican las tasas de intemperie.
- Sin personas. La comida es **estilizada, no realista**: moho como manchas suaves redondeadas (blanco verdoso), moscas como puntos de 3 px. Nada de gusanos, carne cruda realista ni líquidos gráficos. Tiene que dar «¡uh!», no asco que haga deslizar.

## 2. Qué cambia respecto del piloto (obligatorio, por la política de contenido repetitivo de YouTube)

La identidad de la serie se mantiene (contador ámbar, barra logarítmica, etiquetas, carta, loop), pero el episodio tiene que verse **distinto** del celular:

- **Noche** en vez de día. La única luz al inicio es la **luz fría de la heladera abierta**, no el velador cálido.
- **Cámara 8–10° más alta**, mirando levemente hacia abajo a la mesada y la pileta (en el celular era altura de ojos).
- **Apertura con apuesta** (los números 1, 2 y 3 sobre tres objetos), que el piloto no tenía.
- **Remate con objeto emocional distinto** (la receta escrita a mano, no una foto).

## 3. Escena y objetos

Plano fijo vertical 1080×1920. De izquierda a derecha y de abajo hacia arriba:

- **Heladera** (izquierda, puerta abierta hacia la cámara): luz interior fría. Adentro: **cartón de leche**, **tupper con comida**, **banana** en un estante. En la puerta: **receta escrita a mano** («Milanesas de la abuela», 5–6 renglones) sostenida con un **imán** redondo.
- **Mesada** (centro-abajo): **lata de conserva** (hojalata, etiqueta genérica sin marca) y **botella PET** de agua.
- **Pileta / bacha de acero** (centro-derecha): adentro, **el plato de la abuela** con restos de salsa. Borde con flores azules simples (vector original).
- **Alacena superior** (arriba-derecha): puerta entreabierta, **8 platos blancos** apilados.
- **Ventana** sobre la pileta (de noche al principio).
- **Pared con azulejos** y **piso**.

Cada objeto es un componente SVG/CSS que recibe una sola prop: `year` (número continuo). Toda su apariencia sale de funciones de deterioro en `cocina.decay.ts`.

### Curvas de deterioro (proceso)

| Objeto | Deterioro |
| --- | --- |
| Luz de la heladera | Encendida → parpadea (f3–f40) → se apaga. A partir de ahí, luz de luna azulada por la ventana |
| Banana | Manchas marrones en DÍA 1–3 → negra en SEMANA 1 → se encoge → desaparece hacia SEMANA 6 |
| Tupper | Moho que crece en manchas desde SEMANA 1; la comida se hunde. El plástico queda opaco y se fragmenta en AÑO 200+ |
| Cartón de leche | Se hincha en SEMANA 1 → se ablanda → se deshace hacia MES 3 |
| Receta | Amarillea → se mancha con la humedad (AÑO 1) → se despega del imán y cae (AÑO 10) → desaparece (AÑO 15–20). El imán queda en la puerta |
| Ventana | Se rompe en AÑO 1: entran la lluvia y las hojas |
| Alacena | Se hincha (aglomerado) → **cae en AÑO 10**: los 8 platos blancos se rompen en el piso (fragmentos) |
| Plato de la pileta | Polvo → manchas → musgo encima desde AÑO 50 → semienterrado en AÑO 1.000, **entero**; el borde azul sigue visible |
| Lata de conserva | Óxido naranja desde AÑO 2 → perforada hacia AÑO 50 → desaparece después |
| Botella PET | Opaca → quebradiza → fragmentada en AÑO 200–450 (no desaparece: se rompe en pedazos) |
| Heladera | Óxido en bisagras (AÑO 5) → caja oxidada sin puerta (AÑO 50) → restos cubiertos de tierra (AÑO 1.000) |
| Bacha de acero | Opaca → óxido superficial → semienterrada, sigue «protegiendo» el plato |
| Techo y paredes | Manchas → grietas → **cae el techo en AÑO 50** → AÑO 200: solo restos de pared con enredadera |
| Piso | Polvo → hojas → musgo (AÑO 20+) → tierra y pasto (AÑO 100+) |

## 4. Dirección de arte

- Mismo lenguaje del canal: fondo oscuro, materiales táctiles, sombras creíbles, grano, viñeta. Sobrio y premium. Nada de neón, glitch, emojis ni transiciones de plantilla.
- **Tokens nuevos en `theme.ts`** (agregalos, no cambies los de la serie):

| Token | Hex | Uso |
| --- | --- | --- |
| fridgeLight | #CFE6F2 | Luz interior de la heladera |
| moonLight | #8FA7C4 | Luz de luna por la ventana |
| tile | #D9D4C7 → old #9E978A | Azulejos |
| steel | #A7ADB4 → dull #6F757C | Bacha y heladera |
| rust | #8A4B2A | Óxido (si ya existe, reutilizalo) |
| plateWhite | #F1EEE8 | Platos y el ganador |
| plateBlue | #3E6FA8 | Flores del borde del ganador |
| mold | #C9D6B8 / #8FA27A | Moho |
| banana | #E8C547 → #2B2116 | Banana fresca → negra |
| sauce | #8C3B24 | Restos en el plato |
| ink | #2B3A55 | Tinta de la receta |

- Los tokens de interfaz de la serie no se tocan: `bone` #F2EEE6, `amber` #E0A33B (**solo** el contador, el punto de la barra y «ÚLTIMO»), `ash` #B8B4AA, `ink` #0B0C0E del panel de la carta.
- **Tipografía:** IBM Plex Mono (contador, barra, etiquetas, pie de la carta) + Barlow Condensed 600 (gancho, ganador, remate). **Excepción:** la letra de la receta es parte del objeto, no de la interfaz: usá **Caveat** (Google Fonts) solo dentro del componente de la receta y del fantasma final. Si `@remotion/google-fonts` no está instalado, frená y preguntame.

## 5. Timeline (40 s · 30 fps · 1.200 frames)

El tiempo no corre lineal: frena en cada hito para que se lean las etiquetas y acelera entre hitos con el rodillo del odómetro, el parpadeo día/noche y un barrido de sonido (igual que en el celular).

| Tramo | Frames | Año en pantalla | Qué pasa |
| --- | --- | --- | --- |
| Gancho | f0–f60 | AÑO 0 | Ver 6.1 |
| Apuesta | f60–f120 | AÑO 0 → DÍA 1 | Ver 6.2 |
| Comida | f120–f270 | DÍA 1 → SEMANA 1 → MES 3 | Banana negra, moho en el tupper, moscas, el cartón se hincha y se deshace |
| Ventana | f270–f420 | AÑO 1 | Se rompe la ventana, entra lluvia; la receta se mancha |
| Alacena | f420–f600 | AÑO 10 | **Cae la alacena y se rompen los 8 platos** (el momento más fuerte del video, con sonido); la receta cae y queda en el agua del piso. El plato de la pileta, entero |
| Techo | f600–f810 | AÑO 50 | La lata se perfora, cae el techo, entra luz de día verdosa, musgo; la heladera es una caja oxidada |
| Tierra | f810–f990 | AÑO 200 → AÑO 1.000 | El PET se fragmenta, todo se vuelve tierra y pasto; la cámara se acerca al borde azul que asoma |
| Carta | f990–f1080 | AÑO 1.000 | Ver 6.4 |
| Remate | f1080–f1170 | AÑO 1.000 | Ver 6.5 |
| Loop | f1170–f1199 | AÑO 0 | Corte seco al estado del frame 0 |

Regla de ritmo: **ningún tramo de más de 1 s sin un cambio visible** (salvo la carta), y en los primeros 10 s un cambio cada ~2 s.

## 6. Detalle de momentos

### 6.1 Gancho (f0–f60)

- El frame 0 ya muestra el contador **«AÑO 0»** (ámbar, posición de la serie) y la barra de tiempo.
- f0: cocina de noche con la heladera abierta iluminando todo; zumbido del motor de la heladera.
- f3–f40: la luz de la heladera **parpadea** (3 parpadeos irregulares) y en f40 **se apaga** de golpe: el zumbido se corta y queda silencio con un tic de reloj. Ese silencio es el gancho sonoro.
- Texto palabra por palabra desde f0 (4 frames por palabra, sube 24 px + opacidad, `Easing.out(Easing.cubic)`), Barlow 600, 64 px, bone, centrado dentro de y 240–1420: «Se corta la luz.» (f0) / «Nadie vuelve.» (f42). Sale en 8 frames.
- f8–f50: acercamiento lento de cámara 1,00 → 1,04.

### 6.2 Apuesta (f60–f120)

- Aparecen tres marcadores numerados (círculo de 64 px con borde bone de 3 px y número en Plex Mono 700, **no ámbar**) sobre: **1 · la lata de conserva**, **2 · el plato de la pileta**, **3 · la botella PET**. Entran escalonados cada 6 frames.
- Texto: «¿Cuál queda en pie? 1, 2 o 3» (Barlow 600, 56 px, bone). Sale en f112 junto con los marcadores.
- En f120 arranca el contador.

### 6.3 Etiquetas (`DecayLabel`)

Reutilizá el componente del piloto: Plex Mono 500, **36 px** (más grande que en el piloto, para celular), ash, apiladas hacia arriba desde (100, 1300). Entran en 8 frames, duran 45, salen en 8. Máximo 3 a la vez. Formato «objeto · estado». Como no hay narración, este es el único sistema de texto durante el desarrollo.

| Inicio | Etiqueta |
| --- | --- |
| f122 | luz · cortada (nadie paga) |
| f150 | leche · se hincha |
| f180 | tupper · moho |
| f210 | banana · 2 a 6 semanas |
| f250 | cartón de leche · ~3 meses |
| f290 | ventana · rota |
| f320 | receta · se mancha |
| f450 | alacena · se vino abajo |
| f480 | 8 platos · rotos |
| f510 | plato en la pileta · entero |
| f640 | lata de conserva · ~50 años |
| f670 | techo · cayó |
| f700 | receta · desapareció |
| f840 | botella PET · ~450 años, en pedazos |
| f880 | heladera · óxido y tierra |

### 6.4 Revelación y carta (f960–f1080)

- f960–f1000: único movimiento intencional de cámara: acercamiento 1,00 → 1,14 hacia el plato semienterrado (`Easing.bezier(0.45, 0, 0.2, 1)`); el resto se oscurece al 60 %. f970: destello especular cruza el esmalte (gradiente diagonal, 24 frames).
- f990–f1080 (3 s): carta `LastStandingCard` reutilizada: panel ink al 78 %, 820 × 420, radio 18, centro (540, 1150).
  - «ÚLTIMO EN PIE» — Plex Mono 700, 28 px, ámbar, tracking +12 %
  - «el plato que no lavaste» — Barlow 600, 80 px, bone (si no entra en 2 líneas, bajá a 72 px)
  - «cerámica · sin fecha de vencimiento conocida» — Plex Mono 500, 34 px, bone
  - «simulación · estimaciones» — Plex Mono 22 px, bone al 60 %
  - Entrada: escala 0,96 → 1 + opacidad en 10 frames. Nota grave de 2 s (55 + 110 Hz).
- Si en el gancho el marcador «2» estaba sobre el plato, en f1000 reaparece un instante (12 frames) el «2» sobre el plato: le cierra la apuesta a quien acertó.

### 6.5 Remate y pregunta (f1080–f1170)

- f1080: la carta sale (8 frames). Debajo del plato aparece «El plato, sí. La receta, no.» (Barlow 600, 64 px, bone) durante 1,5 s.
- Al mismo tiempo, sobre el plato aparece durante 24 frames un **fantasma de la receta** al 12 %: dos renglones en Caveat («Milanesas de la abuela» / «pan rallado, huevo, perejil…»), que se desvanece. Es lo único emotivo del video: contenido.
- f1125–f1170: en la zona de subtítulos, sin emojis: «¿Qué comida de tu heladera aguanta más? Comentalo.» (Barlow 600, 52 px).
- f1170: corte seco al estado de AÑO 0. **El frame 1199 tiene que ser visualmente idéntico al frame 0** (compará con un script).

## 7. Datos: `src/ultimo-en-pie/episodes/cocina.decay.ts`

Fuente de verdad de las etiquetas con cifra. **Solo estas cuatro:**

| Etiqueta | Cifra | Fuente |
| --- | --- | --- |
| banana · 2 a 6 semanas | 2–6 semanas (cáscara de banana) | NOAA Marine Debris Program, «Marine Debris Match Up» |
| cartón de leche · ~3 meses | ~3 meses | NOAA Marine Debris Program, «Marine Debris Match Up» |
| lata de conserva · ~50 años | ~50 años (lata de hojalata) | NOAA Marine Debris Program, «Marine Debris Match Up» |
| botella PET · ~450 años, en pedazos | ~450 años; se fragmenta, no desaparece | NOAA; Milton Keynes Council (la misma cifra que usa el episodio del celular) |

Agregá una `nota` en el archivo: «Último en pie = último objeto reconocible. La cerámica no tiene cifra publicada de descomposición; por eso la carta no lleva número.» Las curvas de los demás objetos son de proceso, ilustrativas, y tienen que estar documentadas como tales en comentarios.

## 8. Sonido (sintetizado, sin música)

Generalo con el mismo script de efectos del piloto (o extendelo):

- f0–f40: zumbido de la heladera (motor grave ~100 Hz + armónicos) → **corte seco** en f40 + tic de reloj.
- f150–f260: zumbido de moscas (ruido filtrado con modulación, muy bajo).
- f290: vidrio de la ventana que se rompe + lluvia de fondo hasta f600.
- **f450: la alacena cae y los platos se rompen** (golpe grave + 8 tintineos cerámicos escalonados con `random('plato-i')`). Es el pico del video, pero respetá el pico real.
- f670: derrumbe del techo (ruido grave filtrado).
- f810 en adelante: viento + insectos.
- Clic de odómetro cada vez que el contador cambia de unidad; barrido en cada aceleración.
- f990: nota grave 55 + 110 Hz.
- Mezcla final: ≈ −14 LUFS integrados, pico real ≤ −1 dBTP. Medí con `npx remotion ffmpeg -i <mp4> -af loudnorm=print_format=summary -f null -`.

No podés escuchar: verificá cada efecto con su forma de onda en PNG y comprobá duración y pico. En el informe, pedime que escuche el corte del zumbido, la caída de los platos y la nota final.

## 9. Arquitectura

```
src/
  Root.tsx                                (agregar <Composition id="UltimoEnPieCocina" .../>)
  ultimo-en-pie/
    episodes/cocina.ts                    props del episodio (gancho, apuesta, etiquetas, ganador, remate, pregunta, origen del zoom)
    episodes/cocina.decay.ts              cifras con fuente + curvas de proceso
    episodes/cocina.timeline.ts           tramos y eventos de la sección 5
  components/ultimo-en-pie/kitchen/
    KitchenScene.tsx  Fridge.tsx  Recipe.tsx  Sink.tsx  GrandmaPlate.tsx
    Cupboard.tsx  BrokenPlates.tsx  FoodItems.tsx  CannedTin.tsx  KitchenWindow.tsx
    GuessMarkers.tsx                      marcadores 1-2-3 (reutilizable para próximos episodios)
```

- Reutilizá sin modificar: `OdometerCounter`, `TimeBar`, `DecayLabel`, `LastStandingCard`, `HookText`, `Atmosphere`, `AudioLayer`, `SafeZoneOverlay`. Si alguno necesita una prop nueva, agregala de forma opcional y verificá que el celular siga renderizando igual.
- Reutilizá del celular lo que sirva para objetos (PET, vidrio, metal oxidado, musgo, pasto, tierra) en vez de dibujarlo de nuevo.
- Animación solo con `useCurrentFrame()`, `interpolate()` (siempre con `extrapolateLeft/Right: 'clamp'`), `spring()` y `<Sequence>`. Prohibido: `transition`, `@keyframes`, `requestAnimationFrame`, `Date`, `Math.random()`. Azar con `random('semilla')`.
- TypeScript estricto, sin `any`. Código en inglés; textos en pantalla en español neutro. Props validadas con zod (`showSafeZones`, por defecto `false`).

## 10. Vista previa y control de calidad

Renderizá stills en `out/ultimo-en-pie/cocina/stills/` a 0, 15, 30, 45, 60, 90, 120, 180, 250, 300, 450, 480, 520, 650, 700, 850, 960, 1000, 1050, 1100, 1150, 1170, 1199, con y sin `showSafeZones`. Armá una hoja de contactos y **mirala** antes de dar por terminado.

| Prueba | Criterio |
| --- | --- |
| Gancho | Movimiento visible en f0–f10; la luz se apaga antes de f45 |
| Apuesta | Los tres marcadores son legibles en la hoja reducida a 360 px |
| Tramos muertos | Ningún tramo de más de 1 s sin cambio visible (salvo la carta) |
| Diferencia con el piloto | Noche, luz fría, cámara más alta: ponés el still f0 al lado del f0 del celular y se distinguen al instante |
| Asco controlado | Comida estilizada; sin gusanos ni carne realista |
| Texto | Todo ≥ 24 px; contraste ≥ 4,5:1 medido sobre la zona real; dentro de x 80–940, y 240–1420 (incluido el acercamiento final) |
| Coherencia | Ámbar solo en el contador, la barra y «ÚLTIMO»; Caveat solo dentro de la receta y el fantasma |
| Rigor | Solo las 4 cifras de la sección 7, con fuente en `cocina.decay.ts`; la carta sin número; aparece «simulación · estimaciones» |
| Carta | 3 s, con «el plato que no lavaste» |
| Final | Aparecen el remate, el fantasma de la receta y la pregunta; frame 1199 = frame 0 (comparado con script) |
| Piloto intacto | La composición del celular renderiza igual que antes (compará 3 stills) |
| Audio | ≤ −1 dBTP, ≈ −14 LUFS, sin clipping |
| Render | H.264, 1080 × 1920, 30 fps, 1.200 frames, 40,0 s (verificá con `npx remotion ffprobe`) |

## 11. Render

`npx remotion render UltimoEnPieCocina out/ultimo-en-pie/cocina_v1.mp4 --codec=h264 --crf=18`

## 12. Informe final

1. Rutas del MP4 y de la hoja de contactos.
2. Tabla de la sección 10 con resultado por prueba (aprobado / corregido / pendiente).
3. Componentes reutilizados y componentes nuevos.
4. Desvíos respecto de este documento y su motivo.
5. Qué tengo que mirar y escuchar yo.
6. Paquetes instalados (si te autoricé alguno).

## 13. Texto para publicar (no lo publiques vos)

- **Título:** «¿Qué queda de tu cocina en 1000 años? (no es lo que pensás)»
- **Descripción:** «Se corta la luz y nadie vuelve. Simulación animada: los tiempos de descomposición son estimaciones publicadas; fuentes en el comentario fijado. ¿Qué comida de tu heladera aguanta más?»
- **Comentario fijado:** «Fuentes: NOAA Marine Debris Program (banana, cartón de leche, lata, PET) y Milton Keynes Council (PET). En la serie gana el último objeto que todavía se reconoce como lo que era. La cerámica no tiene una cifra publicada, pero es de lo que más encuentran los arqueólogos. ¿Acertaste: 1, 2 o 3?»
  - **Pendiente antes de publicar (lo hago yo, no Claude Code):** conseguir una fuente de museo o universidad sobre la cerámica como hallazgo arqueológico más común y agregarla al fijado.
- **Al subir:** agregalo a la serie «Último en pie» (temporada 1) y subí miniatura propia (el still de f1000). Etiqueta de IA: «No».
