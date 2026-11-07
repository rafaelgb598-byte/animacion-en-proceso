# Despiece 01 · Cerradura · ENTREGA (v5: viralidad + voz)

**✅ FINAL (2026-11-07):** el usuario aprobó la v2 con voz. Está en `videosFinal/Despiece/01-cerradura.mp4`; las pruebas quedan en `videosPrueba/Despiece/`.

## Rutas
- **MP4 final:** `videosFinal/Despiece/01-cerradura.mp4` (era `videosPrueba/Despiece/01-cerradura-v2.mp4`) · 29,8 s.
  `…-v1.mp4` es el primer render con voz y tenía dos tramos al límite (26,1 s y 28,1 s), que se corrigieron en la v2.
- **MP4 sin voz:** `videosPrueba/Despiece/01-cerradura-sin-voz-v3.mp4` (32,5 s, ritmo planificado; antes de la voz).
- **Hoja de contactos:** `videosPrueba/Despiece/qa/01-cerradura/hoja-voz-v1.png` · gancho a 360 px: `qa/01-cerradura/celular-360-gancho.png`
  (borradas al quedar final; se regeneran con `npx remotion still DespieceCerraduraHojaContactos …`).
- **Rama:** `canales/despiece` (sin mergear a `main`).

## Control de calidad (sobre `01-cerradura-v2.mp4` / `DespieceCerradura`)
| Prueba | Resultado |
|---|---|
| Cuadro 0 | ✅ la llave grande y centrada con 3 6 2 7 4 en naranja sobre sus dientes y «Tu llave tiene una contraseña»; a 360 px de ancho se reconoce la llave y se leen los números |
| Primer cambio | ✅ primer cambio grande en **f7** (la línea barre y aparece la cerradura); f0→f10: 21,8 % de píxeles |
| Duración | ✅ **29,8 s** (894 frames) |
| Tramos muertos | ✅ ninguno: mínimo 0,86 % de cambio a 1 s (umbral 0,5 %); cada 1–3 s hay un evento |
| Giro | ✅ vista de frente: la boca con la llave adentro gira 90° con flecha naranja, clac y sacudón (ver nota en «qué mirar») |
| Loop | ✅ último fotograma = f0: `qa-frame-diff` 0,02/255 de diferencia media, 0,00 % de píxeles > 40. Audio: la última palabra termina ≈ 0,9 s antes del final y la frase 1 arranca en f3 (pausa ≈ 1 s, como las de la toma original) |
| Sincronía | ✅ los eventos salen de los tiempos de Scribe: destello en «línea», giro completo en «gira» (clac 1 frame antes), rojo en «corrida», rebote y bzz en «gira» → 0 a 1 frame de su palabra |
| Subtítulos | ✅ `npm run qa:subs -- DespieceCerradura`: **0 fallas**, 17 páginas, Space Grotesk |
| Loudness | ✅ **−14,2 LUFS** integrados, pico real **−1,4 dBTP** (medido sobre el MP4 final) |
| Rigor | ✅ mecanismo según `fuentes.md`; 3 6 2 7 4 son niveles ilustrativos; la voz no dice ninguna cifra |
| Texto | ✅ contraste papel 12,99:1, naranja 5,40:1 · títulos 84 px, rótulos 42 px · dentro de la zona segura · no repite la voz palabra por palabra |
| Idioma | ✅ todo en español rioplatense |
| Coherencia | ✅ naranja = línea de corte, la contraseña y lo que la línea toca; rojo solo en la columna que falla; dos familias tipográficas |
| Render | ✅ H.264, 1080 × 1920, 30 fps, AAC 48 kHz |
| Modularidad | ✅ el motor solo cambió para ser más genérico (ids únicos de `clipPath` y `duck` para el ducking); el episodio 2 sigue siendo objeto SVG + `data.json` + `timeline.ts` + `script.ts` |

## Voz
- **1 toma** con el guion completo (no hizo falta otra): Matías `wW8LJCzyKXPO6ftZkssL`, `eleven_multilingual_v2`, ajustes por defecto, velocidad 1,0.
  **448 créditos** (de un presupuesto de ≈ 1.500). Scribe para los tiempos por palabra: 0 créditos.
- Por qué esa toma: la transcripción coincide palabra por palabra con el guion, sin silencios internos > 0,8 s, y las pausas marcadas («…», «:»)
  quedaron donde van. La toma dura 32,3 s; cortada por frase con `scripts/voz-despiece.mjs` (pausas de ≈ 0,3 s entre frases) son 26,8 s de voz.
- Original: `guiones/Despiece/01-cerradura/voz-original/toma1.{mp3,words.json}` · bloques masterizados: `public/videos/despiece/01-cerradura/voz/`
  · tiempos: `public/videos/despiece/01-cerradura/captions/voz.json` y `src/canales/despiece/episodios/01-cerradura/vozReal.json`.

## Cambios al guion (respecto del v5)
- Frase 3: «el cilindro **está trabado por** columnas de pernos» → «el cilindro **lo traban** columnas de pernos» (más corta, igual sentido).
- Frase 4: «y cada corte, a una altura distinta» → «y cada corte, **a otra altura**».
- Frases 6 y 7 van en una sola línea de la toma («…esta línea… el cilindro gira») y se separan al cortar.
- Las frases 1 y 10 (las del loop) quedaron igual.

## Desvíos
- **Centrado:** el conjunto (cerradura + llave) se centra en **x = 480** (el centro de la zona segura 60–900), no en 540: agrandado un 12 %
  ocupa 71–889 px; centrado en 540 se pasaría de x = 900. Se acortó la cabeza de la llave para que entre.
- **Vista de frente del giro:** la cabeza de la llave se dibuja como una paleta con agujero (icónica) para que se lea como llave; vista de canto real sería una línea.
- **«Mirá»:** la apertura tiene que pasar antes de f12, así que en «Mirá» las mitades del corte se separan y vuelven (y hay un golpe de cámara).
- Los dos tramos al límite del v2 (13,9 s y 34,6 s) ya no existen: el tramo de rótulos se eliminó y el final tiene los saltos de los números.
- Subtítulos sin palabra en amarillo (el naranja es el único acento y el QA solo detecta amarillo).

## Qué tenés que mirar y escuchar
- **Escuchar entero** `01-cerradura-v2.mp4`: yo no puedo escuchar audio, así que verifiqué la voz por la transcripción (coincide entera), los niveles y la
  ausencia de silencios largos, pero no el tono. Fijate si Matías suena natural y si las pausas acortadas no suenan cortadas.
- Los efectos: whoosh, tics crecientes, clac fuerte y bzz (todos sintetizados por código). Fijate si el clac se siente «satisfactorio».
- El cuadro 0 como portada, y si la vista de frente del giro se entiende.
- El loop: ponelo en repetición y escuchá si la frase final empalma con la primera.
