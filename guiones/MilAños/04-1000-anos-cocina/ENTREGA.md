# 1000 años · Cocina v1 — Entrega

- **Prueba:** `videosPrueba/MilAños/04-1000-anos-cocina-v1.mp4`. H.264, 1080 × 1920, 30 fps, 1.200 frames, 40,0 s. Audio a −14,2 LUFS, −1,2 dBTP.
- **Render crudo (sin masterizar):** `videosPrueba/MilAños/qa/04-1000-anos-cocina/04-1000-anos-cocina-v1-raw.mp4`.
- **Hoja de contactos:** `videosPrueba/MilAños/qa/04-1000-anos-cocina/hoja-de-contactos.png` (y `-zonas.png`, con zonas seguras y año). Stills sueltos en `stills/` y `stills-zonas/`. Comparación con el piloto: `f0-celular-vs-cocina.png`. Formas de onda: `sfx-ondas/` y `mezcla-onda/`.
- **Composición:** `MilAnosCocinaV1` (`src/videos/04-1000-anos-cocina/`), en la carpeta «1000-anos» de `Root.tsx`. El celular no se tocó.
- **Créditos:** 0 (sin voz ni imágenes generadas). **Paquetes instalados:** ninguno.

## QA (sección 10 del prompt)

| Prueba | Resultado |
| --- | --- |
| Gancho | ✅ La luz parpadea en f7, f18 y f29 y se apaga en f40; el texto entra desde f0 |
| Apuesta | ✅ Los marcadores 1, 2 y 3 se leen en la hoja a 360 px |
| Tramos muertos | ✅ corregido: f765–f810 quedaba quieto (0,2 %); se agregó la puerta del bajo mesada que cae en f782. El resto de las ventanas de 1 s cambia ≥ 1 % (la carta está exenta) |
| Diferencia con el piloto | ✅ f0 de noche, con luz fría y cámara alta, contra el f0 diurno del celular |
| Asco controlado | ✅ Moho como manchas redondeadas, moscas de 3 px, sin gusanos ni carne |
| Texto | ✅ Todo ≥ 24 px y dentro de x 80–940, y 240–1420 (también con el acercamiento). Contraste medido: de 7,4:1 a 16,4:1 |
| Coherencia | ✅ Ámbar solo en el contador, la barra y «ÚLTIMO»; Caveat solo en la receta y su fantasma |
| Rigor | ✅ Solo las 4 cifras, con fuente en `cocina.decay.ts`; carta sin número; «simulación · estimaciones» |
| Carta | ✅ 3,3 s (f990–f1088) con «el plato que no lavaste» |
| Final | ✅ Remate, fantasma de la receta y pregunta; frame 1199 = frame 0 (diferencia 0,00/255) |
| Piloto intacto | ✅ 3 stills de `MilAnosCelularV4` (f0, f500, f940) idénticos antes y después (0,00/255) |
| Audio | ✅ −14,2 LUFS, −1,2 dBTP, sin silencios muertos |
| Render | ✅ H.264, 1080 × 1920, 30 fps, 1.200 frames, 40,0 s (ffprobe) |

## Desvíos respecto del prompt (y por qué)

- **Rutas y nombres según `CLAUDE.md`:**
  - Código en `src/videos/04-1000-anos-cocina/` y piezas comunes de la serie en `src/canal/mil-anos/`, en lugar de `src/ultimo-en-pie/` y `src/components/`.
  - Composición `MilAnosCocinaV1` en lugar de `UltimoEnPieCocina`.
  - Renders en `videosPrueba/MilAños/` en lugar de `out/`.
  - Todo en `main`, sin rama.
- **«Reutilizar sin modificar» no era posible:** los componentes del celular v4 leen su propio `timeline.ts` y `theme.ts`. Se copiaron a `src/canal/mil-anos/` con el reloj, los textos y las medidas por props. `DecayLabel` y `HookText` vienen de la v2, porque la v4 ya no los usaba.
- **Objetos:** reciben `year` y además `frame`, que se usa solo para micro-movimiento (moscas, lluvia, hojas, pasto). Los eventos (ventana, alacena, receta, techo, puertas) también dependen de `year`: el timeline fija el frame de cada uno y `cocina.decay.ts` lo convierte en años.
- **Tokens:**
  - El `ink` de la receta se llama `recipeInk`, para no pisar el `ink` de la carta.
  - Se agregaron materiales que no estaban en la tabla (madera, mesada, piso, cielo, tierra, etc.), en `theme.ts` → `M`.
- **Carta:**
  - El pie va a 24 px y no a 22, por la regla «todo ≥ 24 px».
  - La cifra va en dos líneas («cerámica ·» / «sin fecha de vencimiento conocida»), porque en una línea no entra en 820 px.
  - Dura 98 frames (f990–f1088) porque sale en f1080–f1088, como pide 6.5.
- **Receta:** el título va en dos renglones y los renglones son más cortos, para que entren en el papel con letra de 24 px o más.
- **Pregunta final:** apoyada en y = 1420 (base de la zona segura del prompt), como en el celular v4.
- **Sonido:**
  - El viento entra cuando cae el techo (f670), no en f810.
  - Hay un ambiente de cuarto en f600–f700, para no dejar 2 s de silencio absoluto.
  - Se agregó el golpe de la puerta del bajo mesada (f792).
- **Evento nuevo:** la puerta del bajo mesada que cae en f782 (tramo muerto).

## Qué tiene que mirar y escuchar el usuario

- Escuchar el corte del zumbido en f40 (1,3 s), la caída de la alacena y de los platos (f450–f480, 15–16 s) y la nota grave de la carta (f990, 33 s).
- El limitador trabaja bastante (≈ 29 % del tiempo) para llegar a −14 LUFS, sobre todo en el zumbido del gancho: confirmar que no se oye «apretado».
- Si el plato en el año 1.000 se lee bien como protagonista a tamaño de celular.
