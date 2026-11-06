# Aprendizajes del canal

Lo que fuimos aprendiendo video a video. Leer antes de escribir un guion; sumar lo nuevo al cerrar cada video
(una línea por aprendizaje, con el video de origen). Las reglas fijas están en `CLAUDE.md`; acá va el porqué y los detalles.

## Para todos los canales

- **Gancho = pregunta directa en el fotograma 0**, escrita y narrada a la vez. Plantear una situación («Lo dejás cargando. Nunca volvés.») no alcanza: el espectador no sabe por qué quedarse. *(03 V2 → V3)*
- **El objeto protagonista, grande.** Si ocupa ~20 % del ancho o hay cielo vacío > 50 % del cuadro, se pierde la historia. *(03 V2)*
- **Alternar planos** (general + detalle del objeto en cada tramo). Un solo encuadre 40 s se siente «una imagen animada». *(03 V2)*
- **El momento más fuerte necesita tiempo** (≥ 2,5 s y con voz). Un derrumbe de 0,25 s nadie lo ve. *(03 V2)*
- **Texto en pantalla ≥ 56 px** en 1080 de ancho, una indicación por vez. Mono de 30 px queda ilegible en el teléfono. *(03 V2)*
- **Jerarquía de lectura:** título/contador arriba, subtítulo en el carril fijo abajo, como mucho una indicación junto al objeto. *(03 V2)*
- **Plantar y pagar:** lo que el remate usa («la foto») se nombra antes («la foto sigue ahí adentro»). *(03 V3)*
- **El loop tiene que cerrar la idea**, no solo empalmar el fotograma: terminar en el plano del inicio con una frase que vuelva a la pregunta. *(03 V2 → V3)*
- **Rigor:** nada de cifras sin fuente («~1.000.000 de años»); mejor una frase cualitativa verificable. Citar el estudio en pantalla como «Huber et al. · 1982» (nunca el tercer apellido). *(01, 03)*
- **Cierre útil > golpe triste:** «Tus recuerdos, solo si tienen copia» deja algo para hacer. *(03 V3)*
- **No mezclar escalas** (contador «1.000 años» y voz «un millón»). *(03 V2)*

- **Subtítulos: el QA no puede aprobarse a sí mismo.** En 01 y 02 los subtítulos quedaban corridos (centro x ≈ 485, no 540), pisaban el cuerpo de Tomi, se cortaban a mitad de frase («AHORA MIRÁ LO QUE»), dejaban palabras sueltas («MÁS!»), pintaban de amarillo palabras sin peso («POR») y cambiaban de altura entre escenas. El QA pasaba igual porque usaba la misma caja (subestimada) que el sistema y no miraba centrado, cortes ni resaltado. Regla nueva: carril fijo (base y = 1500, centro 540, ≤ 720 px), páginas por frase, amarillo solo para la palabra clave, y `npm run qa:subs` que mide los píxeles del render (0 fallas). *(01, 02)*

## Voz (ElevenLabs)

- Voz del canal: **Isaac – Friendly Young Male** `QmPfzE500cXXHM9uQKGc`. Misma voz y modelo entre versiones para que el timbre empate.
- **Velocidad natural 1,0.** La voz acelerada sonó forzada (Stroop `-v2-voz-acelerada`, descartada). *(02)*
- `eleven_multilingual_v2` + mastering suave (`normalize-voice.mjs --drive 6`). `eleven_v4` acepta etiquetas ([curious], [pause]) para tono y pausas. *(01, 02)*
- **Ahorrar créditos:** reutilizar tomas de versiones anteriores (V3 de 1000 años reutilizó 5 de la V2: 0 créditos) y editar pausas por código en vez de regenerar. Guardar siempre la toma cruda en `voz-original/`. *(03)*
- La voz entra **durante** el final de una transición, no después: si no, el ritmo queda «salto, frase, silencio». *(03 V2)*
- Costos de referencia: ~1 crédito por carácter; un Short de 45 s ≈ 400–950 créditos de voz.

## GiroDato (Tomi)

- Fórmula que funcionó: **pregunta/desafío → el espectador participa → giro («nunca cambió») → nombre del efecto + dato con fuente → ejemplo cotidiano → pregunta final que invita a repetir.** *(01, 02)*
- Interactivos: **la regla se enseña con un ejemplo y cuenta regresiva antes de jugar**; tiempo real para responder (decir «amarillo» lleva ~0,6 s → 1,2–1,4 s por tarjeta, el nivel rápido baja a ~0,9 s). Arrancar sin explicar (`-v3-inicio-rapido`) no funcionó. *(02)*
- Comparación clave (precios, tarjetas) grande y centrada en la zona segura. *(01, 02)*

## MilAños (sin Tomi)

- Estructura: pregunta → «se corta la luz» → épocas con contador (1, 10, 50, 200, 1.000 años) → lo que queda → **lo que desapareció antes (giro)** → cierre que vuelve a la pregunta. *(03 V3)*
- Se conserva: contador de años con rueda y barra logarítmica, la luz que cuenta el tiempo (velador → ventana → exterior), deterioro continuo en función de `year`. *(03)*
- Efectos sintetizados por código (sin licencias) + un **motivo sonoro** para el objeto clave; ambientes con fundidos cruzados, ducking al 40 % bajo la voz. *(03)*

## Ciberseguridad («Anatomía de una estafa»)

- **El texto pide más tiempo del que da el cronograma:** a ~15 caracteres/s, los 677 caracteres del 01 ES son ~45 s de voz en un video de 40 s. Contar caracteres por bloque ANTES de fijar frames y colgar todo `timeline.ts` del inicio de cada bloque de voz. *(01 v1)*
- **Teléfono 2.5D con burbujas de 40 px:** con el carril de subtítulos libre a escala 1,06, el teléfono no puede pasar de ~580 × 900; renglones de burbuja escritos a mano (≤ 17 caracteres) y la hora en el mismo renglón para que entren dos mensajes. *(01 v1)*
- **Mesa a 52°:** el texto del teléfono acostado se achata (se lee poco); lo que se lee en la autopsia son los marcadores y los subtítulos. Los marcadores de pie sobre la mesa se ven de canto con cámara cenital: se levantan al subir a la defensa. *(01 v1)*
- `<Freeze>` dentro de un `<Still>` no pasa del frame 0: la hoja de contactos va como `Composition` y se renderiza con `remotion still`. *(01 v1)*
- `fontStretch` no condensa Archivo variable cargada con `loadVariableFont`: usar `fontVariationSettings: "'wdth' 75"`. *(01 v1)*
- Lista de marcas reales «solo pantalla» (`PROHIBIDAS_PANTALLA`): la voz puede decir «WhatsApp», la imagen no; el QA la busca como palabra entera para no confundir «Plin» con «disciplina». *(01 v1)*

## Otro

- (Todavía sin videos.)
