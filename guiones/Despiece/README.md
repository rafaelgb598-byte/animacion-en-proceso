# Canal Despiece · «Abrimos las cosas que usás todos los días para ver cómo funcionan por dentro»

Cuenta: `despiece.tv`. **Solo en español rioplatense, con voseo** (nada de versiones EN, `i18n/` ni composiciones `…EN`).
Sin Tomi ni nada de GiroDato (cafetería, mesa, tarjetas). Prioridad YouTube Shorts, después Instagram.

## Fórmula del episodio (≈ 36 s, 34–38 s)
1. **Cuadro 0:** el objeto entero, centrado, con la **línea de corte naranja ya recorriéndolo** (30 %) y la pregunta escrita. Nada quieto.
2. **Antes de 1,5 s:** la línea completa el corte y el objeto se abre en corte transversal (las mitades se separan ~40 px).
3. **Las piezas:** etiquetas que se dibujan solas, una por vez, colgadas de la palabra que las nombra.
4. **El detalle:** `Highlight` sobre una pieza (el resto al 35 %) + cotas.
5. **El truco (punto medio):** zoom suave (1,00 → 1,08) y la explicación del mecanismo.
6. **La revelación:** el mecanismo funciona paso a paso, con un sonido por evento.
7. **El contraejemplo:** qué pasa cuando falla (rojo `#E5484D`, el único otro color).
8. **Frase final + `TeaserChip`** («Próximo despiece: …», solo en pantalla) y **loop**: el objeto se cierra y la línea vuelve a la posición del cuadro 0.

Regla de ritmo: ningún tramo de más de 1 s sin cambios (`node scripts/qa-tramos-muertos.mjs <mp4> <dir>`).
Cada escena se piensa como **módulo** para unirla después en un video largo de 8–12 min con narración nueva.

## Marca (todo vive en `src/canales/despiece/marca/theme.ts`)
| | |
|---|---|
| Estética | Plano técnico vivo, 2,5D (vectorial con profundidad falsa). No competimos en 3D realista. |
| Paleta | azul `#0B2545` (fondo) · papel `#F4EBD9` (piezas y texto) · naranja `#FF6B1A` (**un solo acento**: la línea de corte y lo que toca) · grafito `#2B2B2B` (trazos) · rojo `#E5484D` solo para el error |
| Tipografía | Space Grotesk (títulos y subtítulos) · IBM Plex Mono (etiquetas y cotas). Títulos ≥ 64 px, etiquetas ≥ 36 px. |
| Narración | Matías (`wW8LJCzyKXPO6ftZkssL`, «Matías – Argentine Customer Service»), curiosa, precisa, sin exagerar: «el amigo ingeniero que te desarma la tostadora». Velocidad 1,0, mastering suave. |
| Prohibido | imágenes de IA, logos o marcas reales en los objetos, miedo, salud, política, texto en inglés |

Subtítulos: el sistema compartido (`src/canal/subtitulos/`) con la fuente del canal y **sin palabras en amarillo** (el naranja es de la
línea de corte y el QA solo detecta énfasis amarillo). Rigor: ninguna cifra de memoria; todo número sale de `fuentes.md` o de un script.
Las cotas muestran **niveles del dibujo** (1–9, sin unidad), no medidas reales.

## Dónde está cada cosa
| Qué | Dónde |
|---|---|
| Marca | `src/canales/despiece/marca/` (`theme`, `anim`, `sfx`, `voz`) |
| Motor | `src/canales/despiece/motor/` (`CutLine`, `SectionSplit`, `Callout`, `Dimension`, `Spring`/`Pin`/`Gear`, `Highlight`, `TeaserChip`, `DespieceEpisode`, `HojaContactos`) |
| Episodio | `src/canales/despiece/episodios/<nn>-<objeto>/` (objeto SVG + `data.json` + `timeline.ts` + `script.ts` + la composición) |
| Efectos | `node scripts/gen-sfx-despiece.mjs` → `public/videos/despiece/sfx/` (sintetizados, sin licencias, sin música) |
| Voz | `public/videos/despiece/<nn>/{voz,captions}/` |
| Guion y textos | `guiones/Despiece/<nn>/` (`guion.json`, `fuentes.md`, `publicacion.md`, `ENTREGA.md`) |
| Pruebas | `videosPrueba/Despiece/<nn>-vN.mp4` · QA en `videosPrueba/Despiece/qa/<nn>/` · finales en `videosFinal/Despiece/` |

## Cómo hacer el episodio 02 (sin tocar el motor)
1. Copiar `src/canales/despiece/episodios/01-cerradura/` → `02-<objeto>/`.
2. Reemplazar el **objeto SVG** (`Cerradura.tsx` → `<Objeto>.tsx`): su vista exterior (`exterior` de `SectionSplit`) y su corte (`interior`).
3. Reescribir `data.json` (geometría y valores de las cotas), `script.ts` (bloques de voz y textos en pantalla) y `timeline.ts` (eventos colgados de palabras).
4. Registrar las composiciones en `Root.tsx` (`<Folder name="Despiece">`) y sumarlas a `COMPS` de `scripts/qa-subtitulos.mjs`.
5. Orden: primero `…SinVoz` hasta que pase todo el QA que no depende de la voz → mostrar guion final + caracteres → OK del usuario → voz → sincronizar.

## QA antes de entregar
`npm run qa:subs -- <Comp>` (0 fallas) · `node scripts/qa-tramos-muertos.mjs` (sin tramos quietos, gancho, loop) · `node scripts/qa-contrast.mjs`
(≥ 4,5:1) · hoja de contactos mirada (y a 360 px de ancho) · loudness ≈ −14 LUFS, pico ≤ −1 dBTP · `npx remotion ffprobe` (H.264, 1080 × 1920, 30 fps).
