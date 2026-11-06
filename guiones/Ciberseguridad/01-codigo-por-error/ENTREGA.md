# ENTREGA · Ciberseguridad 01 «Te mandé un código por error» — **BORRADOR SIN VOZ**

Rama `canal/ciberseguridad-01-codigo-por-error` (sale de `fix/subtitulos-canal`, porque `main` no tiene el sistema de subtítulos nuevo). Sin push ni merge.

## Estado
**Borrador.** Falta la voz (no tengo la ruta del `.env`), y por eso faltan también: los tiempos reales en `timeline.ts`, el render EN, el loudness con la voz y la revisión de oído.
Todo lo visual, los efectos, el QA de subtítulos (con tiempos planificados) y la no regresión están hechos.

## Archivos
- Render: `videosPrueba/Ciberseguridad/01-codigo-por-error-es-v2-borrador-sin-voz.mp4` (la v1 quedó antes de los últimos arreglos: hora de la burbuja enviada y teléfono del ladrón dentro de x ≤ 900) (H.264 1080 × 1920, 30 fps, 1.200 frames, 40,0 s; con efectos y ambiente, sin voz).
- Hojas de contactos: `videosPrueba/Ciberseguridad/qa/01-codigo-por-error/hoja-contactos-{es,en}.png`.
- QA de subtítulos: `videosPrueba/Ciberseguridad/qa/01-codigo-por-error/subtitulos-{es,en}/reporte.md`.
- Stills con zonas seguras: `…/qa/01-codigo-por-error/zonas/{es,en}/`. Efectos: `…/sfx-ondas/`. No regresión: `…/no-regresion/`.

## QA (sección 13)
| Prueba | ES | EN |
|---|---|---|
| Gancho | ✔ pregunta y opciones visibles desde f0 (antes de f60); la cámara se mueve todos los frames | ✔ |
| Storyboard | ⏳ eventos en sus frames planificados; falta ajustarlos a la voz real | ⏳ |
| Subtítulos (`npm run qa:subs`) | ✔ 0 fallas (tiempos planificados) | ✔ 0 fallas (tiempos planificados) |
| Zona segura | ✔ medido en los stills `zonas/` (incluido el empuje a 1,06) | ✔ |
| Legibilidad | ✔ en vertical (40 px en burbujas); ⚠ el teléfono acostado a 52° achata el texto (ver desvíos) | ✔ / ⚠ igual |
| Contraste | ✔ ≥ 4,5:1 en todos los pares calculados (la hora de la burbuja enviada se subió de 3,8 a ~6:1) | ✔ |
| Rigor | ✔ cada frase con fila en `fuentes.md`; «RECREACIÓN» siempre visible; sin «ve tus chats» ni «tiene tus contactos» | ✔ |
| Marcas | ✔ app propia (ver comparación abajo); la lista «solo pantalla» pasa | ✔ |
| Idiomas | ✔ sin textos cruzados; EN entra en las burbujas | ✔ |
| Otros canales | ✔ `EfectoSenueloTomiV2`, `GiroDatoStroopV2`, `MilAnosCelularV3` en f0/300/600: diferencia 0,00 | — |
| Loop | ✔ f0 vs f1199: 0,10/255 (solo el grano) | ✔ 0,10/255 |
| Sponsor | ✔ `activo: false` idéntico al default (0,00); muestra en `sponsor-muestra/` | — |
| Audio | ⏳ sin voz: efectos sin recorte (pico −1 dBFS cada uno); loudness de la mezcla pendiente | ⏳ |
| Render | ✔ ES borrador verificado con `ffprobe` | ⏳ sin render |

## Comparación con WhatsApp (marcas)
Fondo de chat liso y oscuro (sin el empapelado de dibujos), burbujas gris azulado `#1F2630` / `#2B3A4D` (ningún verde), «leído» con dos rombos (no la doble tilde azul),
cabecera sin botones de llamada ni de video (solo atrás, avatar con inicial y menú), barra de mensaje con flecha (no micrófono ni clip),
tipografía Archivo, SMS genérico «Mensajes» con un globo dibujado. Ningún logo ni nombre de app en pantalla.

## Voz (pendiente)
- Voz del canal: **Donovan** `DMyrgzQFny3JI1Y1paM5` (por `ELEVENLABS_VOICE_ID_CIBER`), `eleven_multilingual_v2`, velocidad 1,0, `--drive 6`.
- Caracteres a enviar: ES 677 + EN 692 = **1.369** (presupuesto 3.000). Gastados: **0**.
- `scripts/gen-voice.mjs` tiene la opción nueva `--voice-env` (default `ELEVENLABS_VOICE_ID`, GiroDato igual) — **falta tu OK al diff antes de usarla**.

## Desvíos
1. Rama base `fix/subtitulos-canal` en vez de `main` (decidido con el usuario).
2. La pregunta y las opciones del gancho se ven desde el frame 0 (regla permanente de `CLAUDE.md`), no recién en f60.
3. Teléfono 580 × 900 (no «llena la pantalla»): con burbujas de 40 px y el carril de subtítulos libre a escala 1,06 no entraba más grande. La cámara sube 60 px en el empuje a 1,06.
4. Vidrio esmerilado **sin desenfoque** (textura de ruido opaca): regla permanente «dibujo siempre nítido».
5. Los marcadores se levantan al subir la cámara a la defensa (f760), no en f1110: con la cámara cenital se ven de canto y tapaban el teléfono vertical.
6. Interruptor a f840 (no f800), alineado con «y activa la verificación».
7. En la defensa, el teléfono del ladrón muestra solo el candado (sin textos chicos).
8. Subtítulos con Archivo 900 (la familia del canal) por la prop `fuente` del sistema compartido; el énfasis en `evidence` por la prop nueva `colorEnfasis`.
9. El texto del teléfono acostado (autopsia) queda achatado por la perspectiva de 52°: el tamaño de letra cumple, pero la altura visible baja a ~20 px. Lo legible ahí son los marcadores y los subtítulos.
10. **Riesgo de duración:** a ritmo natural el texto pide ~45 s de voz y el video dura 40 s (±3 s permitidos). Con la voz real voy a ver cuánto sobra; si no entra, hay que recortar texto o alargar el video (decisión tuya).

## Qué tenés que mirar / escuchar
- Mirar: el borrador ES y las dos hojas de contactos (sobre todo la autopsia f320–600 y la defensa f760–900).
- Escuchar (cuando haya voz): «código», «verificación», «contagia» (ES) y «two-step», «rewind» (EN).

## Paquetes instalados
Ninguno.
