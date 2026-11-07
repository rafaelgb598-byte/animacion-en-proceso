# PROMPT — Revisión v2 del Short «Último en pie» · Episodio 2: la cocina (Remotion)

Sos el desarrollador del Short `04-1000-anos-cocina`, que ya está hecho (v1, 40 s, 1.200 frames, composición `UltimoEnPieCocina`). **No lo rehagas:** aplicá solo los cambios de este documento y renderizá una v2. Hay tres objetivos: que el video se lea en el celular (encuadre y tamaños), que no tenga spoilers ni tramos muertos, y sumar la **narración con la voz «Isaac» de ElevenLabs**.

## 0. Reglas

1. Nada destructivo: trabajá en `UltimoEnPieCocinaV2` (o en una rama `short/cocina-v2`). No borres la v1 ni sus assets, y no toques las composiciones del celular.
2. **La voz gasta créditos de ElevenLabs:** antes de generar audio, mostrame cómo pensás generarlo (herramienta, voz, modelo, cantidad de tomas) y esperá mi OK. Si no hay manera de usar ElevenLabs desde el proyecto, frená y avisame: te paso los audios yo.
3. Ningún número de frame suelto (todo en `cocina.timeline.ts`); ningún color ni fuente fuera de `theme.ts`.
4. Antes de tocar código, escribime en 5 líneas qué vas a cambiar y en qué archivos.

## 1. Diagnóstico de la v1 (hoja de contactos + audio medido)

**Lo que está bien y no se toca:** loop (diferencia media entre el frame 0 y el 1199: 0,45/255), loudness (−14,2 LUFS, −1,2 dBTP), contador y barra, la caída de la alacena con los platos rotos, la receta que cae, el techo que se derrumba, el pasto y la tierra, el remate palabra por palabra.

**Problemas, por prioridad:**

1. **Encuadre:** la escena ocupa el 55 % superior y del 45 % de abajo queda piso vacío (y ≈ 1100–1920). Los objetos que importan (banana, tupper, lata, plato) se ven chiquitos en el celular.
2. **La putrefacción no se ve:** en SEMANA 1 y MES 3 la banana negra y el moho del tupper miden pocos píxeles. El momento visceral, que es el gancho de los primeros 10 s, no llega.
3. **El haz de luz de luna** es un trapecio blanco de bordes duros y muy brillante que cruza toda la cocina (heladera incluida) y **sigue ahí a pleno día**, incluso con el techo caído (AÑO 50). Distrae y se ve como un error.
4. **Spoiler:** la etiqueta «plato en la pileta · entero» (f510) revela el ganador a los 17 s y mata la apuesta 1-2-3.
5. **La revelación no tiene acercamiento:** f930 y f1000 tienen el mismo encuadre y el plato mide unos 240 px de ancho. Además, en AÑO 1.000 la bacha con el plato queda **flotando a la altura de la mesada** por encima del suelo, no semienterrada.
6. **La carta tiene un salto de línea roto:** «cerámica ·» queda sola en un renglón y «sin fecha de vencimiento conocida» pasa al siguiente.
7. **Textos chicos:** el gancho «Se corta la luz.», «¿Cuál queda en pie? 1, 2 o 3» y los marcadores 1-2-3 son chicos para el celular, y la apuesta dura ~1,7 s.
8. **El fantasma de la receta** casi no se ve (se pierde por el tamaño del plato).
9. **Audio:**
   - El zumbido de la heladera (f0–f40 y f1170–f1199) está a ≈ −7,5 dB RMS: es tan fuerte como el choque de los platos. Tiene que ser fondo.
   - Hay dos tramos planos de solo lluvia, a −30 dB y sin eventos: **f315–f420 (3,5 s)** y **f505–f590 (2,8 s)**.
   - El derrumbe del techo (f667, ≈ −7 dB) suena **más fuerte que la caída de los platos** (f457, ≈ −9,6 dB). El clímax sonoro tiene que ser el de los platos.

## 2. Cambios visuales

### 2.1 Encuadre (el cambio más importante)

- Escalá **toda la escena** (no la interfaz) a ≈ 1,30 con el ancla en la pileta, para que la mesada quede en y ≈ 1000–1100 y el piso visible arranque en y ≈ 1250. Los objetos clave tienen que quedar entre y 450 y 1200.
- Verificá que nada importante quede detrás de la interfaz de YouTube: abajo a la derecha (botones, x > 900 e y > 1100) y abajo del todo (título, y > 1500).
- Reubicá la heladera y la alacena para que sigan entrando completas o cortadas a propósito por el borde (la heladera puede quedar cortada a la izquierda).

### 2.2 Putrefacción legible (f120–f270)

- Segundo movimiento de cámara permitido: **acercamiento 1,00 → 1,22 hacia el interior de la heladera** en f125–f150 (`Easing.inOut(Easing.cubic)`), se mantiene durante SEMANA 1 y vuelve a 1,00 en f255–f280.
- Durante ese acercamiento: la banana pasa de amarilla a manchada y a negra; en el tupper crecen 5–7 manchas de moho que se expanden (círculos suaves superpuestos, `mold`); el cartón de leche se hincha visiblemente (abomba sus caras ±6 %); 4–6 moscas (puntos de 3 px) con trayectorias en `random('mosca-i')`.
- Sigue siendo estilizado: nada de gusanos ni líquidos realistas.

### 2.3 Haz de luna

- Bordes suaves (máscara con degradado o desenfoque ≥ 40 px) y opacidad máxima de 0,18.
- No cruza la heladera: recortalo para que caiga sobre la mesada y el piso.
- **Se apaga cuando cae el techo** (f660–f690) y no vuelve. Desde ahí la luz es de día, difusa y verdosa.

### 2.4 Apuesta 1-2-3 (f60–f135)

- Marcadores de 84 px (borde bone de 4 px, número en Plex Mono 700 de 44 px), con un pulso de escala 1 → 1,08 → 1 al entrar.
- Texto «¿Cuál queda en pie?» en Barlow 600 de 72 px y debajo «1 · 2 · 3» en Plex Mono 700 de 56 px.
- Dura hasta **f135** (2,5 s en total). El contador sigue en AÑO 0 hasta f135.

### 2.5 Sin spoiler

- **Eliminá la etiqueta «plato en la pileta · entero».** El plato de la pileta tiene que verse entero, pero sin que se nombre: es el espectador el que se tiene que dar cuenta.

### 2.6 Etiquetas

Con narración, las etiquetas de proceso repiten lo que dice la voz. **Dejá solo las 4 etiquetas con cifra** (banana, cartón de leche, lata de conserva, botella PET), a 40 px, en (100, 430), debajo de la barra de tiempo, para que no choquen con los subtítulos. Borrá las demás («luz · cortada», «leche · se hincha», «tupper · moho», «ventana · rota», «receta · se mancha», «alacena · se vino abajo», «8 platos · rotos», «techo · cayó», «receta · desapareció», «heladera · óxido y tierra»).

### 2.7 AÑO 1.000 y revelación

- Los restos de la mesada y la bacha **bajan al nivel del suelo** entre AÑO 200 y AÑO 1.000 (se hunden ~180 px y la tierra los cubre). En AÑO 1.000 el plato queda **semienterrado**: un tercio tapado por tierra y pasto, con el borde azul bien visible.
- f930–f985: acercamiento **1,00 → 1,65** hacia el plato (`Easing.bezier(0.45, 0, 0.2, 1)`). Al llegar, el plato tiene que medir al menos 520 px de ancho y quedar centrado en x 540, y ≈ 820, arriba de la carta. Revisá la zona segura con el acercamiento aplicado.
- f970: destello especular sobre el esmalte (como en la v1).
- f1000: reaparece el marcador «2» sobre el plato durante 15 frames.

### 2.8 Carta (f990–f1065)

- Dejá dos renglones limpios: «cerámica» y abajo «sin fecha de vencimiento conocida». Sin «·» colgado.
- Duración: 2,5 s (termina en f1065).

### 2.9 Remate (f1065–f1170)

- «El plato, sí. La receta, no.» en Barlow 600 de 72 px.
- El fantasma de la receta (Caveat) sube al **30 %** de opacidad, del ancho del plato ya agrandado, y se desvanece en 30 frames, sincronizado con «La receta… no».
- f1130–f1170: «¿Qué comida tuya aguanta más? Comentalo.» en Barlow 600 de 60 px.

### 2.10 Gancho (f0–f60)

- «Se corta la luz.» y «Nadie vuelve.» a **84 px**. Como ahora hay voz, el gancho se muestra como subtítulo sincronizado con la narración (ver 3.3), con el mismo estilo y tamaño.

## 3. Narración — voz «Isaac» (ElevenLabs)

### 3.1 Guion y tiempos

Voseo rioplatense, tono grave y calmo, sin dramatizar. Densidad máxima de ~3 palabras por segundo (ya está calculada). **Generá cada frase por separado** y ubicala en su frame; **no aceleres** el audio para que entre: si una frase no entra, avisame y la acorto yo.

| # | Desde | Hasta | Texto | Qué pasa en pantalla |
| --- | --- | --- | --- | --- |
| 1 | f2 | f66 | «Se corta la luz. Nadie vuelve.» | La luz de la heladera parpadea y se apaga |
| 2 | f70 | f130 | «¿Qué queda en pie?» | Marcadores 1-2-3 |
| 3 | f140 | f265 | «A la semana, tu heladera ya tiene nuevos dueños.» | Acercamiento a la heladera: moho, moscas, banana negra |
| 4 | f285 | f410 | «Al año, se rompe la ventana. La receta empieza a borrarse.» | Ventana rota, lluvia, la receta se mancha |
| 5 | f470 | f590 | «A los diez, cae la alacena. Ocho platos. Todos… menos uno.» | Después del choque de los platos (la voz entra cuando termina el ruido) |
| 6 | f620 | f800 | «A los cincuenta, la lata está perforada. Y el techo… ya no está.» | Lata oxidada; cae el techo en f667 |
| 7 | f830 | f905 | «El plástico no desaparece: se fragmenta.» | La botella PET se rompe en pedazos |
| 8 | f910 | f985 | «Mil años después, lo último que se reconoce…» | Empieza el acercamiento al plato |
| 9 | f995 | f1060 | «…es el plato que no lavaste.» | Carta |
| 10 | f1070 | f1125 | «El plato, sí. La receta… no.» | Remate + fantasma |
| 11 | f1132 | f1168 | «¿Qué comida tuya aguanta más?» | Pregunta |

### 3.2 Generación

- Voz: **«Isaac»** (si hay más de una con ese nombre en la cuenta, mostrame las opciones). Modelo multilingüe con español; punto de partida: stability ≈ 0,45, similarity ≈ 0,75, style ≈ 0,15. Si el resultado suena con acento neutro y no rioplatense, avisame antes de seguir.
- Pedí 2 tomas de la frase 1 y de la 10 (son las que más pesan) y una del resto.
- Guardá los audios en `public/ultimo-en-pie/cocina/voz/` y sus tiempos de palabra (timestamps) en `episodios/cocina/voz-timestamps.json`.

### 3.3 Subtítulos

- Usá el sistema de subtítulos del canal si ya existe en el proyecto (el de `prompt-subtitulos-qa.md`). Si no: 56–62 px, peso 700–800, contorno o caja oscura con contraste ≥ 4,5:1, centrados en y ≈ 1300, máximo 2 líneas y 4 palabras por página, palabra activa al 100 % y el resto al 60 %.
- Las frases 1 y 10 se muestran con el estilo grande del gancho y del remate (2.9 y 2.10), no como subtítulo chico.
- Regla de la serie: nunca subtítulo + etiqueta diciendo lo mismo.

## 4. Sonido

| Evento | Frame | Cambio |
| --- | --- | --- |
| Zumbido de la heladera | f0–f40 y f1170–f1199 | Bajalo a ≈ −24 dB RMS (que se sienta, pero que no tape la voz). El corte en f40 sigue seco |
| Tic de reloj | desde f42 | Igual; que baje a −30 dB cuando entra la voz |
| Moscas | f140–f265 | Subilas un poco durante el acercamiento (≈ −26 dB) |
| Ventana | f290 | Vidrio que se rompe, igual |
| Tramo plano f315–f420 | — | Lluvia + **2 goteos** sobre metal (f340 y f385) + crujido de papel cuando se mancha la receta (f360) |
| **Platos** | f450–f470 | **Pico del video:** golpe grave de la alacena + 8 tintineos cerámicos escalonados. Tiene que ser lo más fuerte de todo el audio salvo la nota de la carta |
| Tramo plano f505–f590 | — | Un último plato que gira en el piso y se detiene (f505–f540, «moneda que gira») + goteo. Ese sonido sostiene «Todos… menos uno» |
| Techo | f667 | Bajalo ≈ 4 dB respecto de la v1 para que quede por debajo de los platos |
| Ducking | siempre | Con voz activa, todo el resto baja 8 dB (sidechain o automatización de volumen) |
| Nota grave de la carta | f990 | Igual |
| Remate | f1070–f1168 | Silencio casi total + viento muy bajo; la voz tiene que quedar sola |

- Mezcla final: ≈ −14 LUFS integrados, pico real ≤ −1 dBTP, **voz ≈ 8–10 dB por encima de los efectos** en los tramos con narración.
- No podés escuchar: generá la curva de energía por cuarto de segundo (RMS en dB) como hice yo y verificá que el pico esté en f450–f470 (o en la nota de f990), que no haya tramos de más de 1,5 s planos sin voz y que el zumbido quede por debajo de −20 dB.

## 5. Control de calidad

Stills en `out/ultimo-en-pie/cocina-v2/stills/` en 0, 30, 60, 100, 135, 180, 230, 300, 400, 460, 520, 650, 700, 850, 930, 960, 1000, 1040, 1080, 1110, 1150, 1199, con y sin zonas seguras. Hoja de contactos al lado de la de la v1. **Mirala.**

| Prueba | Criterio |
| --- | --- |
| Encuadre | Piso vacío ≤ 25 % del alto; objetos clave entre y 450 y 1200 |
| Putrefacción | En la hoja reducida a 360 px de ancho se distinguen la banana negra y el moho |
| Haz de luna | Bordes suaves, opacidad ≤ 0,18, ausente desde f690 |
| Spoiler | Ningún texto nombra al plato de la pileta antes de f995 |
| Revelación | Plato ≥ 520 px de ancho en f1000, semienterrado, borde azul visible |
| Carta | Dos renglones limpios, 2,5 s |
| Textos | Gancho y remate a 84/72 px; todo ≥ 24 px; contraste ≥ 4,5:1; dentro de x 80–940, y 240–1420 |
| Voz | 11 frases en su frame, sin aceleración, sin cortes de palabra; subtítulos sincronizados (±2 frames) |
| Audio | Pico en los platos o en la nota; zumbido < −20 dB; sin tramos planos > 1,5 s; −14 LUFS; ≤ −1 dBTP |
| Loop | Frame 1199 = frame 0 (comparado con script) |
| Render | H.264, 1080 × 1920, 30 fps, 1.200 frames, 40,0 s |

## 6. Render

`npx remotion render UltimoEnPieCocinaV2 out/04-1000-anos-cocina-v2.mp4 --codec=h264 --crf=18`

## 7. Informe

1. Ruta del MP4 y de las dos hojas de contactos (v1 y v2).
2. Tabla de la sección 5 con resultado por prueba.
3. Cómo generaste la voz, qué tomas elegiste y cuántos créditos usaste.
4. Curva de energía del audio v2.
5. Desvíos respecto de este documento y su motivo.
6. Qué tengo que escuchar yo: la voz completa (sobre todo las frases 1 y 10), los platos y el plato que gira.

## 8. Texto para publicar (actualizado; no lo publiques vos)

- **Título:** «¿Qué queda de tu cocina en 1000 años? (no es lo que pensás)»
- **Descripción:** «Se corta la luz y nadie vuelve. Simulación animada: los tiempos de descomposición son estimaciones publicadas; fuentes en el comentario fijado. ¿Qué comida tuya aguanta más?»
- **Comentario fijado:** «Fuentes: NOAA Marine Debris Program (banana, cartón de leche, lata, PET) y Milton Keynes Council (PET). En la serie gana el último objeto que todavía se reconoce como lo que era. ¿Acertaste: 1, 2 o 3?» + fuente de cerámica pendiente.
- Etiqueta de IA: «No».
