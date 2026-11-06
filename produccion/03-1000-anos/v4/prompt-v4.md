# PROMPT — Revisión v4 del Short «1000 años: el celular» (Remotion)

Sos el desarrollador a cargo del Short `03-1000-anos-celular` que ya está hecho (v3, 45 s, 1.350 frames). No lo rehagas: aplicá **solo** los cambios de este documento sobre el proyecto existente y renderizá una v4. El objetivo es mejorar la retención de los primeros segundos, eliminar tramos muertos, ordenar el texto y agregar la firma de la serie.

## 0. Reglas

1. Nada destructivo: trabajá en una copia de la composición (`...CelularV4`) o en una rama `short/celular-v4`. No borres la v3 ni sus assets.
2. No instales nada ni uses servicios pagos sin consultarme. Si hay voz (ElevenLabs) y algún cambio obliga a regenerar una frase, frená y avisame antes.
3. Ningún número de frame suelto: todo en el `timeline` del proyecto.
4. Antes de tocar código, inspeccioná el proyecto y escribime en 5 líneas cómo está armado (composición, timeline, capas de texto, audio, si hay narración) y qué vas a cambiar.

## 1. Diagnóstico de la v3 (lo que vi en la hoja de contactos)

- **f0–f80 (2,7 s) es una imagen quieta:** celular centrado, pregunta arriba, nada se mueve. Es el mayor riesgo: en Shorts se decide en el primer segundo.
- **AÑO 10 (≈ s 13–15):** dos segundos de vista lateral con una barra negra sobre fondo liso (batería hinchada). Tramo visualmente muerto.
- **Texto duplicado:** en muchos momentos hay subtítulo + etiqueta con flecha diciendo lo mismo («PET: deformado, entero» + «La botella, deformada…»). Los subtítulos son chicos para celular.
- **Falta la firma de la serie:** no aparece la carta «ÚLTIMO EN PIE» con el ganador y su cifra. Es lo que hace reconocible el canal.
- **Después del clímax (AÑO 1.000, ≈ s 33) siguen ~10 s** (vuelta al escritorio, pixelado de la memoria). La idea es buena pero larga: el espectador ya recibió la recompensa.
- **Falta la invitación a comentar** (el próximo lugar), que es el motor de la serie.
- Audio: −15,3 LUFS integrados y −0,8 dBTP de pico real. El pico pasa el límite.
- La pregunta del inicio queda arriba de y 240 (borde de la zona segura).

## 2. Cambios

### 2.1 Gancho (f0–f45): movimiento desde el frame 0

- El frame 0 ya muestra el contador **«AÑO 0»** (ámbar, misma posición que en el resto del video) y la barra de tiempo.
- La pregunta entra **palabra por palabra desde f0** (4 frames por palabra), no estática. Bajala para que quede entera dentro de y 240–1420. Texto: «¿Qué queda de tu celular en mil años?» (más corto que el actual; si hay narración y la frase hablada es distinta, mantené la hablada y solo ajustá el texto si coincide).
- f6: vibración del celular (±3 px, 8 frames) + sonido de vibración.
- f8–f40: acercamiento lento de cámara 1,00 → 1,04.
- **El primer cambio visible ocurre antes de f45** (se corta la luz / el contador rueda a «DÍA 1»). Acortá todo el tramo previo para que así sea. Si la narración actual empieza más tarde, adelantala; no la aceleres.

### 2.2 Tramo de AÑO 10: sin vista lateral muerta

- Eliminá la vista lateral de la batería o reducila a **≤ 0,8 s**.
- Preferido: mostrar la hinchazón en el plano general (el vidrio se levanta 3–4° en un borde con una línea de luz) mientras la ventana se rompe. Así pasan dos cosas en pantalla a la vez.

### 2.3 Un solo sistema de texto por momento

- Regla: si hay subtítulo (narración), **no** hay etiqueta con flecha diciendo lo mismo. Las etiquetas con flecha quedan **solo en la revelación final** (vidrio, metal, plástico).
- Subtítulos: subí el tamaño a 56–62 px en el lienzo de 1080, peso 700–800, contorno o caja oscura con contraste ≥ 4,5:1, centrados en y ≈ 1300, máximo 2 líneas y 4 palabras por página. Palabra activa al 100 %, el resto al 60 %.
- Eliminá cualquier texto menor a 24 px en el lienzo (las etiquetas pequeñas de «representación» pueden quedar a 24 px).

### 2.4 Carta de la serie en la revelación

Cuando la cámara llega al vidrio en AÑO 1.000 y después de las etiquetas vidrio/metal/plástico, mostrá durante **2,5 s** la carta fija de la serie (componente reutilizable `LastStandingCard`, si no existe creala):

- Panel oscuro (#0B0C0E al 78 %), radio 18, ancho 820, centrado en x 540, y ≈ 1150.
- «ÚLTIMO EN PIE» — mono 700, 28 px, ámbar, tracking +12 %.
- «el vidrio de la pantalla» — condensada 600, 88 px, color hueso.
- «~1.000.000 de años» — mono 500, 40 px.
- «simulación · estimaciones» — mono 22 px al 60 %.
- Entrada: escala 0,96 → 1 + opacidad en 10 frames. Sonido grave de 2 s (55 + 110 Hz).

Usá exactamente las fuentes y el ámbar que ya usa el contador del video, para que todo se vea de la misma familia.

### 2.5 Epílogo de la memoria: más corto y con remate

- Comprimí el tramo posterior a la carta (vuelta al celular encendido + pixelado de la foto) de ~10 s a **4–5 s**: aparece el celular con el perro, se pixela en ~2 s, queda negro.
- Sobre el negro: «La foto, no.» (condensada 600, 64 px, hueso) durante 1 s.
- Luego, 1,2 s, en la zona de subtítulos y sin emojis: «¿Qué lugar abandonamos ahora? Comentalo.»
- Último frame idéntico al frame 0 (loop sin costura). Verificalo comparando las dos imágenes con un script.

### 2.6 Duración

Objetivo total: **38–42 s**. Si después de los cambios sobra tiempo, quitalo de las lecturas largas de AÑO 50 y AÑO 200 (las etiquetas repetidas de «La mesa se deshace» y «PET: deformado» ocupan varios segundos iguales).

### 2.7 Audio

- Pico real ≤ −1 dBTP, loudness integrado ≈ −14 LUFS. Medí con `npx remotion ffmpeg -i <mp4> -af loudnorm=print_format=summary -f null -`.
- Sumá un «clic» de odómetro cada vez que el contador cambia de unidad (día → semana → año) si no existe.
- Si hay narración, que ningún efecto la tape.

## 3. Control de calidad

Renderizá fotogramas en `out/v4/stills/` a 0, 0,5 s, 1 s, 1,5 s y luego cada 2 s hasta el final; armá una hoja de contactos y **mirala** antes de dar por terminado.

| Prueba | Criterio |
| --- | --- |
| Gancho | Hay movimiento visible en f0–f10 y un cambio de estado antes de f45 |
| Tramos muertos | Ningún tramo de más de 1 s sin cambio visible (salvo la carta) |
| Texto | Nunca subtítulo + etiqueta diciendo lo mismo; todo texto ≥ 24 px; contraste ≥ 4,5:1; dentro de x 80–940, y 240–1420 |
| Carta | Aparece 2,5 s con el ganador y «simulación · estimaciones» |
| Final | «La foto, no.» y la pregunta de comentarios aparecen; frame final = frame 0 |
| Duración | 38–42 s, 30 fps, 1080 × 1920, H.264 |
| Audio | ≤ −1 dBTP, ≈ −14 LUFS, sin clipping |

## 4. Render

`npx remotion render <id-v4> out/03-1000-anos-celular-v4.mp4 --codec=h264 --crf=18`

## 5. Informe

1. Ruta del MP4 y de la hoja de contactos.
2. Tabla de la sección 3 con resultado por prueba.
3. Duración final y qué tramos recortaste.
4. Si tocaste la narración y por qué.
5. Qué tengo que mirar y escuchar yo.
