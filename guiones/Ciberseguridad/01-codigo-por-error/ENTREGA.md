# ENTREGA · Ciberseguridad 01 «Te mandé un código por error» — ✅ FINAL (ES y EN)

Todo en `main` (la rama `canal/ciberseguridad-01-codigo-por-error` se mezcló y se borró).

## Estado
**✅ FINAL** — aprobado por el usuario a la primera (ES v4 y EN v2).

## Archivos
- **Finales:** `videosFinal/Ciberseguridad/01-codigo-por-error-es.mp4` (era la `es-v4`) y `videosFinal/Ciberseguridad/01-codigo-por-error-en.mp4` (era la `en-v2`).
- Pruebas que quedan en `videosPrueba/Ciberseguridad/` (para borrar a mano si no sirven): `-es-v1/v2-borrador-sin-voz` (sin voz) y `-es-v3` / `-en-v1` (con voz, mezcla a −11 LUFS: muy fuerte).
- Stills, hojas de contactos y reportes de QA (`videosPrueba/Ciberseguridad/qa/01-codigo-por-error/`): borrados al quedar final, como pide `CLAUDE.md`. Los resultados quedan en la tabla de abajo y se regeneran con `npm run qa:subs -- EstafaCodigoES` / `EstafaCodigoEN`.
- Voz: tomas crudas y tiempos de Scribe en `guiones/Ciberseguridad/01-codigo-por-error/voz-original/`; bloques masterizados en `public/videos/ciberseguridad/01-codigo-por-error/voz/{es,en}/`; captions en `…/captions/{es,en}.json`.

## Duración (decidido con el usuario: alargar en vez de recortar el guion)
| | Voz | Video |
|---|---|---|
| ES | 48,8 s | 1.683 frames · 56,1 s |
| EN | 42,9 s | 1.505 frames · 50,2 s |
Con patrocinio activo: +60 frames.

## QA (sección 13)
| Prueba | ES | EN |
|---|---|---|
| Gancho | ✔ pregunta y opciones desde f0; movimiento en todos los frames | ✔ |
| Storyboard | ✔ cada evento colgado de su palabra en la voz real (0 frames de desfase por construcción; el bloque arranca con su imagen) | ✔ |
| Subtítulos (`npm run qa:subs`) | ✔ **0 fallas** (26 páginas, voz real) | ✔ **0 fallas** (25 páginas) |
| Zona segura | ✔ stills con guías (incluido el empuje a 1,06; el teléfono del ladrón se corrió para quedar en x ≤ 900) | ✔ |
| Legibilidad | ✔ burbujas 40 px en vertical; ⚠ teléfono acostado a 52° (ver desvíos) | ✔ / ⚠ |
| Contraste | ✔ ≥ 4,5:1 en todos los pares calculados | ✔ |
| Rigor | ✔ `fuentes.md` completo; «RECREACIÓN» siempre; sin «ve tus chats» ni «tiene tus contactos» | ✔ |
| Marcas | ✔ app propia; lista «solo pantalla» sin hallazgos | ✔ |
| Idiomas | ✔ sin textos cruzados ni desbordes | ✔ |
| Otros canales | ✔ GiroDato y MilAños idénticos (0,00) | — |
| Loop | ✔ f0 vs f1682: 0,10/255 (solo el grano) | ✔ f0 vs f1504: 0,10/255 |
| Sponsor | ✔ apagado = idéntico al default | — |
| Audio | ✔ −14,2 LUFS integrados · pico real −3,5 dBTP (voz a 0,71 en la mezcla); efectos en su frame por construcción | ✔ −14,3 LUFS · −4,1 dBTP |
| Render | ✔ H.264 1080 × 1920, 30 fps, 1.683 frames, 56,1 s (`ffprobe`) | ✔ 1.505 frames, 50,2 s |

## Voz
- **Donovan** `DMyrgzQFny3JI1Y1paM5`, `eleven_multilingual_v2`, ajustes por defecto, velocidad 1,0. Generada con el **plugin de ElevenLabs** (flow `tjn7Rc6azwKZ5qKlCB3O`), no con `gen-voice.mjs` (no había `.env`): una toma por idioma con todo el guion.
- Tiempos por palabra: **Scribe** (0 créditos). Las dos transcripciones coinciden palabra por palabra con el guion; sin silencios internos > 0,8 s.
- Mastering: `normalize-voice.mjs --drive 6` sobre la toma entera; corte en 12 bloques con `scripts/voz-ciberseguridad.mjs`.
- **Créditos: ES 688 + EN 703 = 1.391 de 3.000.** Bloques regenerados: ninguno.
- `gen-voice.mjs --voice-env` aprobado y en el repo, sin usar en este episodio.

## Desvíos
1. Duración 56 s (ES) / 50 s (EN) en vez de 40 ± 3 (decidido con el usuario).
2. Voz por el plugin con una toma por idioma (sin `previous_text`/`next_text`; la toma entera da la continuidad).
3. La pregunta y las opciones del gancho se ven desde el frame 0 (regla permanente de `CLAUDE.md`).
4. Teléfono 580 × 900 (no «llena la pantalla»): con burbujas de 40 px y el carril libre a escala 1,06 no entraba más grande.
5. Vidrio esmerilado sin desenfoque (textura opaca): «dibujo siempre nítido».
6. Los marcadores se levantan al subir la cámara a la defensa, no al final: con cámara cenital se ven de canto.
7. Interruptor y candado sincronizados a «activa» y «no les alcanza» (no a frames fijos).
8. En la defensa, el teléfono del ladrón muestra solo el candado.
9. Subtítulos en Archivo 900 (prop `fuente`) y énfasis en amarillo evidencia (prop nueva `colorEnfasis`).
10. El texto del teléfono acostado (autopsia) se achata por la perspectiva: ahí se leen los marcadores y los subtítulos.

## Comparación con WhatsApp (marcas)
Fondo de chat liso y oscuro (sin empapelado), burbujas gris azulado (ningún verde), «leído» con dos rombos (no la doble tilde azul),
cabecera sin botones de llamada ni video, barra de mensaje con flecha (sin micrófono ni clip), tipografía Archivo, SMS genérico con un globo dibujado. Ningún logo ni nombre de app en pantalla.

## Qué tenés que mirar / escuchar
- Escuchar: «código», «verificación», «contagia» (ES) y «two-step», «rewind» (EN); que el tono suene calmo, no alarmista.
- Mirar: la autopsia (marcadores y teléfono del ladrón) y la defensa; el corte entre bloques (pausas de ~0,3 s).

## Paquetes instalados
Ninguno.
