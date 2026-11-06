# Short final — Efecto señuelo · plan de producción

## Guion definitivo (narración continua, voz Isaac `QmPfzE500cXXHM9uQKGc`)

Texto exacto que se envía a ElevenLabs: [`guion.txt`](guion.txt) — 733 caracteres (689 hablados, 116 palabras).
Duración estimada: 46–53 s. Si la toma real supera 55 s, se recorta primero el ejemplo de cine/suscripciones.

Cambios respecto del guion base (precisión y ritmo):
- "agrego **un** mediano" y pausas escritas (`…`, `<break>`) para la suspensión antes de la revelación.
- "demostraron" → "**mostraron** que sumar una tercera opción, menos atractiva, puede cambiar lo que elegimos" (más fiel: el estudio documenta un efecto, no una ley universal).
- Año escrito en palabras ("mil novecientos ochenta y dos") para que la voz no lo lea como número suelto.
- "El truco **es simple**:" mantiene el ritmo sin afirmar intención de las cafeterías.

## Modelo de voz

`eleven_multilingual_v2` con el endpoint **with-timestamps** (mismo costo):
- el más estable y natural en español latinoamericano con voces de la biblioteca;
- respeta pausas `<break time="…"/>` (v3 no las admite);
- devuelve el tiempo de cada carácter → subtítulos sincronizados con las palabras reales, sin pagar transcripción aparte.
Ajustes iniciales: stability 0.42 · similarity 0.8 · style 0.35 · speaker boost.

## Storyboard (se reajusta a la duración real del audio)

| # | Frase | Imagen |
|---|---|---|
| 1 | "Elegí uno. Rápido." | Fotograma 0: plano medio, Tomi frente a CHICO US$3 y GRANDE US$7; título "¿CHICO O GRANDE?". Mira un vaso y el otro. |
| 2 | "¿Chico… o grande?" | Detalle de los dos precios → primer plano de su duda (mano al mentón). |
| 3 | "…agrego un mediano…" | Cae el mediano US$6,50 (pop + contacto). Cejas arriba, giro de cabeza, mira las tres opciones. |
| 4 | "De repente… ganga. ¡50 centavos!" | Detalle M vs L; un "+US$0,50" de tiza une los precios. Señala; duda → interés. |
| 5 | "Pero el precio… nunca cambió." | Va a agarrar el grande, se congela. Primer plano. El cartel $7 se ilumina: el número no se mueve; antes/después lado a lado. |
| 6 | "Cambió contra qué lo comparás." | La "regla" de comparación se desliza del chico al mediano. |
| 7 | "Esto se llama efecto señuelo." | Cambio de contexto: pizarra de la cafetería se vuelve el escenario de la explicación. Tomi como "profesor" con un puntero. |
| 8 | "En 1982, Joel Huber y sus colegas…" | Ficha de estudio estilo fichero: "Huber et al. · 1982 · Journal of Consumer Research". Tres "tarjetas" de opciones con el señuelo resaltado. |
| 9 | "…entradas de cine o suscripciones." | Dos mini-viñetas rápidas (combo de pochoclos / 3 planes de suscripción) con el mismo patrón visual. |
| 10 | "El truco… parezca mucho mejor." | Vuelta a la cafetería; el mediano "empuja" visualmente al grande. |
| 11 | "Ahora tapá el mediano." | Tomi tapa el mediano con una servilleta. |
| 12 | "¿Seguís queriendo el grande?" | Mismo encuadre del fotograma 0 (CHICO US$3 / GRANDE US$7), Tomi duda → loop. |

## Mapa de efectos (ElevenLabs Sound Effects, sin música)

| Archivo | Uso | Duración |
|---|---|---|
| `sfx/pasos.mp3` | pasos en piso de madera (entrada / paso al vaso) | 2.0 s |
| `sfx/vaso-apoyo.mp3` | vaso de papel apoyado en el mostrador (aparición del mediano, agarres) | 1.0 s |
| `sfx/pop-aparicion.mp3` | "pop" cartoon suave de aparición del mediano | 1.0 s |
| `sfx/whoosh.mp3` | giros de cabeza y transiciones de escena | 1.0 s |
| `sfx/tic-precio.mp3` | tic/chime corto al resaltar precios y el +US$0,50 | 1.0 s |
| `sfx/sorpresa.mp3` | reacción de sorpresa cartoon sutil | 1.0 s |
| `sfx/revelacion.mp3` | golpe grave + "respiración" de suspenso para "nunca cambió" | 2.0 s |
| `sfx/servilleta.mp3` | servilleta de papel que cubre el vaso | 1.5 s |

Total ≈ 10.5 s de audio generado, cada efecto reutilizable.
