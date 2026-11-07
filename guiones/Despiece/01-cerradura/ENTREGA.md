# Despiece 01 · Cerradura · ENTREGA (borrador sin voz)

## 1. Rutas
- **MP4 (sin voz):** `videosPrueba/Despiece/01-cerradura-sin-voz-v2.mp4` (37,4 s) · anterior `…-sin-voz-v1.mp4` (tenía un tramo quieto en f97–127).
- **Hoja de contactos:** `videosPrueba/Despiece/qa/01-cerradura/hoja-v2.png` (queda en la compu: `qa/` no se sube) · prueba a 360 px: `qa/01-cerradura/celular-360.png`.
- **Rama:** `canales/despiece` (sin mergear a `main`). Último commit: ver `git log -1 canales/despiece`.
- **Archivos nuevos:**
  - Marca: `src/canales/despiece/marca/{theme,anim,sfx,voz}.ts`
  - Motor: `src/canales/despiece/motor/{CutLine,SectionSplit,Callout,Dimension,Mecanica,Highlight,TeaserChip,DespieceEpisode,HojaContactos}.tsx`, `geom.ts`, `index.ts`
  - Episodio: `src/canales/despiece/episodios/01-cerradura/{Cerradura.tsx,CerraduraEpisode.tsx,timeline.ts,script.ts,data.json,vozReal.json}`
  - Mano a Mano: `src/canales/mano-a-mano/README.md`, `guiones/ManoAMano/_banco-de-ideas.md`
  - Guiones: `guiones/Despiece/{README.md,_banco-de-ideas.md}`, `guiones/Despiece/01-cerradura/{guion.json,fuentes.md,publicacion.md,ENTREGA.md}`
  - Scripts: `scripts/gen-sfx-despiece.mjs`, `scripts/qa-tramos-muertos.mjs`
  - Recursos: `public/videos/despiece/sfx/*.wav` (10 efectos sintetizados), `public/videos/despiece/01-cerradura/{voz,captions}/` (vacías)
  - Carpetas vacías: `videosPrueba/ManoAMano/`, `videosFinal/{Despiece,ManoAMano}/`
- **Archivos existentes tocados (solo agregados):** `src/Root.tsx` (`<Folder name="Despiece">`), `CLAUDE.md` (sección + línea de `videosFinal/`), `guiones/README.md` (filas), `BIBLIOTECA.md` (sección), `guiones/APRENDIZAJES.md` (sección Despiece), `scripts/qa-subtitulos.mjs` (2 entradas en `COMPS`; ver desvíos).

## 2. Estado: **BORRADOR**
Falta la voz (frenado a propósito: regla 0.4, espera tu OK). Sin voz no se pueden cerrar Sincronía ni Audio, y `DespieceCerradura` hoy
renderiza igual que el borrador. También falta la ficha técnica de un fabricante en `fuentes.md`.

## 3. Control de calidad (sobre `DespieceCerraduraSinVoz` v2)
| Prueba | Resultado |
|---|---|
| Gancho | ✅ movimiento f0→f10 (la línea de corte avanza; 0,27 % de píxeles) · primer cambio de estado grande en **f36** (< f45) |
| Tramos muertos | ✅ ninguno: mínimo 0,62 % de cambio a 1 s (umbral 0,5 %) · la v1 tenía uno (f97–127), corregido |
| Rigor | ✅ mecanismo según Wikipedia (fuentes.md) · sin cifras con unidad; «3 6 2 7 4» son niveles del dibujo · ⚠️ falta la fuente de fabricante |
| Texto | ✅ contraste calculado: papel 12,99:1, naranja 5,40:1 · títulos 84 px, etiquetas 42 px, valores 52–112 px · dentro de la zona segura · no repite la voz palabra por palabra |
| Subtítulos | ✅ `npm run qa:subs -- DespieceCerraduraSinVoz`: **0 fallas**, 17 páginas, fuente Space Grotesk (con voz real hay que repetirlo sobre `DespieceCerradura`) |
| Legibilidad en celular | ✅ fotogramas a 360 px de ancho: etiquetas legibles (con 38 px quedaban justas → 42 px) |
| Idioma | ✅ todo en español (pantalla, voz y subtítulos) |
| Coherencia | ✅ un acento naranja (línea de corte, «TU», lo que la línea toca), rojo solo en la columna que falla, dos familias, trazos de `STROKE` |
| Loop | ✅ último fotograma vs f0: 0,09 % de diferencia |
| Sincronía | ⏳ pendiente de la voz real (los eventos ya están colgados de las palabras) |
| Audio | ⏳ el borrador (solo efectos y ambiente) mide −23,1 LUFS y −6,1 dBTP, sin clipping; el mastering a −14 LUFS / ≤ −1 dBTP va con la voz (`master-audio.mjs`). Ojo: el comando del arranque necesita `-vn` con el ffmpeg de Remotion |
| Render | ✅ H.264, 1080 × 1920, 30 fps (ffprobe) |
| Modularidad | ✅ el episodio solo usa el motor por props; el 02 cambia el objeto SVG, `data.json`, `timeline.ts` y `script.ts` (+ registrar la composición) |

## 4. Fuentes (resumen)
Wikipedia «Pin tumbler lock», sección *Design*: carcasa fija + rotor que gira; pernos de largo variable + contrapernos + resortes; la línea de
corte entre rotor y carcasa; sin llave los pernos la cruzan; con la llave correcta cada unión cae justo en ella; con otra llave no gira
(*Vulnerabilities*: una columna mal ubicada impide abrir). Dice «típicamente cinco o seis» pernos en general, no en cerraduras domésticas:
por eso la voz no menciona cuántas hay.

## 5. Voz
Todavía no se generó: **0 créditos**. Propuesta: Matías `wW8LJCzyKXPO6ftZkssL`, `eleven_multilingual_v2`, velocidad 1,0, 449 caracteres (≈ 449 créditos).

## 6. Episodio 2
Copiar `episodios/01-cerradura/` y cambiar: el objeto SVG (`Cerradura.tsx` → `<Objeto>.tsx`), `data.json`, `timeline.ts`, `script.ts`.
`CerraduraEpisode.tsx` solo cambia de nombre e importa el objeto nuevo. El motor no se toca.

## 7. Desvíos
- **Guion recortado** de ≈ 95 a 82 palabras (449 caracteres): el borrador daba ≈ 39 s de voz.
- **Las columnas suben juntas** cuando entra la llave (es lo físico: se apoyan en los dientes), y después **se encienden de a una** (5 tics de 0,8 s). El arranque pedía que subieran de a una.
- **Sin palabras en amarillo** en los subtítulos: el naranja es el único acento y el QA solo detecta el amarillo.
- **Etiquetas en 42 px** (el arranque pedía ≥ 24; `APRENDIZAJES.md` pide ≥ 56 para el texto principal: los títulos van en 84 px).
- `scripts/qa-subtitulos.mjs` es un archivo existente: le agregué 2 entradas en `COMPS` (sin eso, `npm run qa:subs -- DespieceCerradura` no corre). Es lo mismo que pide `guiones/Ciberseguridad/README.md` para cada episodio.
- **Zona segura:** uso `src/canal/zonaSegura.ts` para las guías, no el `SafeZoneOverlay` de MilAños (tiene otros límites: 80–940, 240–1420).
- `vozReal.json` en la carpeta del episodio (vacío hasta generar la voz): es un dato generado, no un archivo más para el episodio 2.

## 8. Qué tenés que mirar y escuchar
- El borrador `01-cerradura-sin-voz-v2.mp4`, de punta a punta: el ritmo, si se entiende el mecanismo y si la cerradura se ve lo bastante grande (ocupa ~60 % del ancho).
- La vista exterior del cuadro 0 (cilindro en 3/4): si te convence como «objeto entero».
- Los efectos (tics, clac, rebote): son sintetizados.
- El guion final (abajo y en `guion.json`) antes de darme el OK para la voz.

## 9. Aprendizajes
Sumados en `guiones/APRENDIZAJES.md` § Despiece.
