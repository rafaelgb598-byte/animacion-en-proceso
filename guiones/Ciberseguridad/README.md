# Canal Ciberseguridad · «Caso Desarmado» (nombre de trabajo) · Serie «Anatomía de una estafa»

**Promesa:** «Estafas reales, desarmadas pieza por pieza, para que no te pase a ti ni a tu familia.»
Bilingüe desde el día 1 (ES neutro con tuteo + EN), pensado para sponsors de seguridad: sin morbo, sin gritos, sin miedo barato.

## Los 3 actos (firma de la serie)
1. **La trampa:** el espectador la vive en primera persona, en su propio teléfono (pregunta directa + opciones desde el frame 0).
2. **La autopsia:** rebobinado (contador hacia atrás, la pantalla retrocede) → el teléfono se acuesta en la «mesa de evidencia» y aparecen los **marcadores amarillos numerados** junto a cada señal de manipulación.
3. **La defensa:** una acción concreta de 1 paso. Cierre con «CASO #00N →» y loop al frame 0.

## Regla de color
Amarillo `evidence` = evidencia (solo marcadores y su línea guía) · rojo `danger` = daño (solo el momento de la pérdida) · turquesa `safe` = defensa.
Nunca dos a la vez en el mismo plano, salvo la transición de daño a defensa. Todo color y fuente vive en `src/canales/ciberseguridad/marca/theme.ts`.

## Marcadores
Tent triangular 120 × 150 (CSS 3D, de pie sobre la mesa), número Space Mono 700 72 px, caen con `spring({damping: 14, stiffness: 140, mass: 0.8})`
y tiran una línea guía de 3 px hasta lo que señalan; la frase marcada se subraya en amarillo. Se levantan cuando la cámara sube a la defensa.

## Reglas fijas
- App de chat **genérica y propia** (`marca/chat/`): nada de logos, verdes ni burbujas de apps o bancos reales. Las marcas reales solo se dicen en la voz.
  El QA (`npm run qa:subs`) lo controla con la lista «solo pantalla» `PROHIBIDAS_PANTALLA.ciberseguridad` (`src/canal/qa/prohibidas.ts`).
- Etiqueta «RECREACIÓN» todo el video. Enfoque defensivo: nunca el paso a paso del estafador.
- Cada frase de la voz con su fuente en `fuentes.md`. Datos personales ficticios.
- Voz propia del canal (Donovan, `ELEVENLABS_VOICE_ID_CIBER`), nunca la de otro canal.

## Dónde está cada cosa
| Qué | Dónde |
|---|---|
| Marca + plantilla | `src/canales/ciberseguridad/marca/` (`theme`, `anim`, `camara`, `canal` (CHANNEL_NAME), `AnatomiaEstafa.tsx`, `chat/*`, marcadores, ficha, grafo, rebobinado, sponsor) |
| Episodio | `src/canales/ciberseguridad/episodios/<nn>/` (`index.tsx`, `timeline.ts`, `escena.ts`, `i18n/{es,en}.ts`, `vozReal.ts`) |
| Recursos | `public/videos/ciberseguridad/<nn>/{voz,captions}/` · efectos de la serie `public/videos/ciberseguridad/sfx/` (`scripts/gen-sfx-ciberseguridad.mjs`) |
| Guion y textos | `guiones/Ciberseguridad/<nn>/` (`guion.json`, `fuentes.md`, `publicacion.md`, `ENTREGA.md`, `voz-lineas-{es,en}.json`) |
| Pruebas | `videosPrueba/Ciberseguridad/<nn>-<lang>-vN.mp4` · QA en `videosPrueba/Ciberseguridad/qa/<nn>/` |

## Cómo crear el episodio 02 («Hola, cambié de número»)
1. Copiar `src/canales/ciberseguridad/episodios/01-codigo-por-error/` → `02-numero-nuevo/`.
2. Reescribir `i18n/es.ts` y `i18n/en.ts` (mensajes, marcadores, voz, énfasis) y `escena.ts` (mensajes, objetivos de los marcadores, segundo teléfono, grafo, defensa).
3. Ajustar `timeline.ts` (frames con nombre) a la voz real. La plantilla `AnatomiaEstafa` no se toca.
4. Si el mecanismo necesita una pieza visual propia (p. ej. el dinero que se va a una cuenta de tercero), es **un** componente nuevo en la carpeta del episodio.
5. Registrar `EstafaNumeroES/EN` en `Root.tsx` (`<Folder name="ciberseguridad">`) y sumarlas a `COMPS` de `scripts/qa-subtitulos.mjs`.
6. `node scripts/voz-lineas-ciberseguridad.mjs 02-numero-nuevo` → voz → `npm run qa:subs` (0 fallas) → render.

El plan viejo `04-hola-mama/prompt-v1.md` (numerado 04 por error) es ahora el **episodio 02**: hay que adaptarlo a esta plantilla
(oscura, marcadores amarillos, Archivo + Space Mono) en vez del «expediente claro» que proponía.

## Ideas de episodios con la misma plantilla (no producidas)
- El paquete «retenido en aduana» que pide pagar una tasa por link (marcadores: remitente, link acortado, monto chico, plazo).
- La llamada con la voz clonada de un familiar pidiendo plata (marcadores: número desconocido, urgencia, «no le digas a nadie»; defensa: palabra clave familiar).
- El falso soporte del banco que pide el código «para cancelar una compra» (marcadores: «te llamamos nosotros», código que llega en vivo).
- La oferta de trabajo «likeando videos» que termina en pedir una inversión (marcadores: pago chico inicial, grupo de chat «de inversores», «nivel VIP»).
- El QR pegado encima del original en un parquímetro o restaurante (marcadores: sticker, dominio raro, pago que no coincide).
- El vendedor de Marketplace que manda un «comprobante» falso y pide devolver la diferencia.
