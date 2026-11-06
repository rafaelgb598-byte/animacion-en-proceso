# Short final — Efecto señuelo · entrega

**Archivo:** `out/efecto-senuelo-final.mp4` (`C:\Users\Rafae\Desktop\hola\out\efecto-senuelo-final.mp4`)
**Composición:** `EfectoSenueloFinal` · 1080×1920 · 30 fps · **46,40 s** (1392 fotogramas) · H.264 + AAC 48 kHz · sin música.

## Voz
- ElevenLabs, voz **Isaac – Friendly Young Male**, Voice ID **`QmPfzE500cXXHM9uQKGc`** (es, acento mexicano), confirmado en la biblioteca.
- Modelo `eleven_v4`: admite etiquetas de interpretación ([curious], [softly], [pause]) para controlar tono y pausas.
- Una sola toma, 45,32 s. Archivo: `public/videos/01-efecto-senuelo/voz/narracion-isaac.mp3`.
- Tiempos por palabra (ElevenLabs Scribe, 0 créditos): `public/videos/01-efecto-senuelo/voz/palabras.json` → `src/videos/01-efecto-senuelo/short-final/words.ts`.

## Guion definitivo (lo que dice la voz)
Elegí uno. Rápido.
¿Chico por tres dólares… o grande por siete?
Ahora mirá lo que pasa si agrego un mediano… a seis con cincuenta.
De repente, el grande parece una ganga. ¡Son solo cincuenta centavos más!
Pero el precio del grande… nunca cambió.
Cambió contra qué lo comparás.
Esto se llama efecto señuelo.
En 1982, Joel Huber y sus colegas mostraron que sumar una tercera opción, menos atractiva, puede cambiar lo que elegimos.
Y no pasa solo con cafés: también puede aparecer al comparar entradas de cine o suscripciones.
El truco es simple: la opción del medio hace que otra parezca mucho mejor.
Ahora tapá el mediano.
¿Seguís queriendo el grande?

(La referencia aparece en pantalla como «Huber et al. · 1982 · *Journal of Consumer Research*».)

## Efectos (ElevenLabs Sound Effects, `public/short-final/sfx/`)
| Archivo | Uso |
|---|---|
| `pasos.mp3` | pasos hacia el mediano y de vuelta |
| `vaso-apoyo.mp3` | el mediano toca el mostrador; el vaso vuelve a su lugar |
| `pop-aparicion.mp3` | aparición del mediano y de la opción señuelo en el pizarrón |
| `whoosh.mp3` | giro de cabeza y transiciones café ↔ pizarrón |
| `tic-precio.mp3` | resaltado de cada precio, del +US$0,50 y de la cita |
| `sorpresa.mp3` | "¡Son solo cincuenta centavos más!" |
| `revelacion.mp3` | "…nunca cambió." |
| `servilleta.mp3` | tapa el mediano |

## Créditos ElevenLabs consumidos
Narración 768 · 8 efectos × ~17 = 136 · transcripción 0 → **≈ 904 créditos** (≈ US$0,18).

## Reutilizable para próximos Shorts
- `src/canal/personaje/` — personaje articulado, expresiones, manos, `feet.ts` (pies plantados con IK).
- `src/short-final/timing.ts` — patrón de mapa de tiempos a partir de palabras reales.
- `src/short-final/Overlays.tsx` — subtítulos sincronizados (2 líneas, palabras clave, zona segura) y título de gancho.
- `src/short-final/BoardScene.tsx` — escena de explicación en pizarrón con tiza animada.
- `src/scenes/inspect/` — grilla de fotogramas y diagnóstico de animación.
