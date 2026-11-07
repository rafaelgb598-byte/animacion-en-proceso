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
- **Para liberar el carril, nada de franjas fijas grandes.** Un mostrador en primer plano fijo (borde en y = 1288) dejaba el QA en 0, pero tapaba ~40 % del cuadro todo el tiempo y el usuario lo descartó en el señuelo. En el Stroop una mesa sí funcionó (ya había mesa). Mejor: encuadrar desde el guion dejando abajo un piso o mostrador que ya sea parte de la escena; si no, preguntar si se permite el cuerpo de Tomi (en el 01 sí: torso y piernas, nunca cara ni manos que gesticulan). *(01, 02)*

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
- **Piezas comunes de la serie en `src/canal/mil-anos/`** (desde el 04): reloj `makeClock` (tramos → años, unidades DÍA/SEMANA/MES/AÑO), contador, barra, etiquetas, carta, gancho palabra por palabra, marcadores 1-2-3, atmósfera, capa de efectos. Reciben el reloj y los textos del episodio por props: un episodio nuevo solo escribe `episodes/<x>.timeline.ts`, `<x>.decay.ts`, `<x>.ts` y su escena. Los componentes de la v4 del celular leían su propio `timeline.ts` y no se podían reutilizar sin copiarlos. *(04 v1)*
- Regla de la serie: «último en pie» = **el último objeto que todavía se reconoce**, no el material con la cifra más alta (por eso la carta del 04 va sin número). *(04)*
- Episodio sin voz: el ritmo lo dan las etiquetas (máx. 3, renglón libre más bajo) y los eventos. Medir los «tramos muertos» comparando fotogramas a 1 s de distancia del MP4: en el 04 v1 el final del año 50 quedó quieto (0,2 %) y se le agregó un evento (la puerta del bajo mesada que cae). *(04 v1)*
- **Mezcla sin silencios muertos:** revisar el RMS por segundo del render crudo. En el 04 v1 había 2 s en −∞ entre la lluvia y el viento, y los ambientes estaban ~35 dB debajo de los golpes (el limitador trabajaba demasiado). El ffmpeg de Remotion no trae `f32le`, `rawvideo`, `volumedetect` ni filtros de dinámica: `scripts/master-audio.mjs` lee un WAV temporal, mide con `loudnorm` y limita en Node. *(04 v1)*
- Noche creíble sin desenfocar el dibujo: escena pintada «a plena luz» + capas de oscuridad (gradiente radial alrededor de la única fuente de luz, máscara para el haz de luna) + tintes en `screen`. *(04 v1)*
- **Lo que el usuario rechazó de la v1 del 04:** escena chica (55 % arriba, piso vacío abajo), putrefacción ilegible en el celular, haz de luna duro y presente de día, etiqueta que spoileaba el ganador («plato en la pileta · entero»), revelación sin acercamiento, «·» colgado en la carta, textos chicos, zumbido tan fuerte como los platos, tramos de solo lluvia y techo más fuerte que los platos. *(04 v1)*
- **Encuadre para el celular:** cámara base ×1,30 (pantalla = s·mundo + t) con acercamientos que interpolan (s, t) hacia un punto de mundo → punto de pantalla. Los objetos clave entre y 450 y 1200; muebles y piso pueden ir bajo el carril de subtítulos, los objetos no. *(04 v2)*
- **Español neutro** para Isaac (acento mexicano): «refrigerador», «plátano», «pan molido», «Coméntalo». *(04 v2)*
- **Voz con el plugin de ElevenLabs** (sin clave en el proyecto; el usuario lo prefiere): una llamada por frase en un mismo flujo, `generations_count` 2 solo en las frases que pesan; el plugin no deja fijar stability/similarity/style (usa los de la voz). Tiempos por palabra con Scribe: 0 créditos si se conecta el nodo de voz, pero **cuesta** (~13–17) si se transcribe un archivo adjuntado por URL (hace falta para elegir una toma específica de un nodo con 2 tomas). Costo real del 04 v2: 473 de voz + 30 de Scribe = 503. *(04 v2)*
- Isaac a 1,0 habla a ~15 caracteres/s, pero «…» y «.» agregan pausas largas (0,4–0,9 s): «El plato, sí. La receta… no.» (28 car.) dura 2,98 s. Medir el fin real de la voz por energía (el MP3 trae silencio al final). *(04 v2)*
- **Mezcla con voz:** compresión leve por frase (3:1 sobre −22 dBFS) + nivelado a −17 dBFS RMS antes del master, así el limitador final casi no trabaja. Verificar «voz sobre efectos» con stems (prop `mezcla`: voz / efectos, render `--codec=wav`): la nota de la carta sin ducking tapaba la frase 9. *(04 v2)*

## Ciberseguridad («Anatomía de una estafa»)

- **El 01 se aprobó a la primera** (ES y EN). Lo que funcionó: 3 actos (trampa en primera persona → rebobinado y autopsia con marcadores amarillos numerados → defensa de 1 paso), paleta oscura con regla de color estricta, app de chat propia, cámara 2.5D con la mesa de evidencia y cada evento visual colgado de la palabra que lo nombra en la voz real. Partir de esta plantilla y de este flujo de voz para el 02. *(01)*

- **El texto pide más tiempo del que da el cronograma:** a ~15 caracteres/s, los 677 caracteres del 01 ES son ~45 s de voz en un video de 40 s. Contar caracteres por bloque ANTES de fijar frames y colgar todo `timeline.ts` del inicio de cada bloque de voz. *(01 v1)*
- **Teléfono 2.5D con burbujas de 40 px:** con el carril de subtítulos libre a escala 1,06, el teléfono no puede pasar de ~580 × 900; renglones de burbuja escritos a mano (≤ 17 caracteres) y la hora en el mismo renglón para que entren dos mensajes. *(01 v1)*
- **Mesa a 52°:** el texto del teléfono acostado se achata (se lee poco); lo que se lee en la autopsia son los marcadores y los subtítulos. Los marcadores de pie sobre la mesa se ven de canto con cámara cenital: se levantan al subir a la defensa. *(01 v1)*
- `<Freeze>` dentro de un `<Still>` no pasa del frame 0: la hoja de contactos va como `Composition` y se renderiza con `remotion still`. *(01 v1)*
- `fontStretch` no condensa Archivo variable cargada con `loadVariableFont`: usar `fontVariationSettings: "'wdth' 75"`. *(01 v1)*
- **Voz con el plugin de ElevenLabs** (sin `.env`): una toma por idioma con todo el guion (da continuidad natural, en vez de `previous_text`), `generations_count: 1`, y Scribe (0 créditos) para los tiempos por palabra; `scripts/voz-ciberseguridad.mjs` masteriza la toma entera y la corta en bloques. Costo real: ~1 crédito por carácter (ES 688, EN 703). *(01)*
- **Medida real de Donovan a 1,0:** ES ≈ 13,9 caracteres/s, EN ≈ 16,1. El mismo guion dura 48,8 s en ES y 42,9 s en EN: cada idioma necesita su propio timeline (eventos colgados de la palabra que los nombra). Con los silencios (acción, rebobinado, loop) el 01 quedó en 56 s ES / 50 s EN. *(01)*
- El ffmpeg que trae Remotion no tiene `afade` ni filtros de dinámica: los fundidos y el limitador se hacen en Node. *(01)*
- Lista de marcas reales «solo pantalla» (`PROHIBIDAS_PANTALLA`): la voz puede decir «WhatsApp», la imagen no; el QA la busca como palabra entera para no confundir «Plin» con «disciplina». *(01 v1)*

## Despiece (objetos por dentro, solo ES)

- **El 01 se aprobó como final con la primera versión con voz (v2, 29,8 s).** Lo que funcionó: la revelación del final como gancho (la llave con su «contraseña»), nombrar piezas solo en la acción, el giro de frente con clac y tics crecientes, «¿Cuál abre?» y el loop exacto al cuadro 0. Total: 448 créditos (1 toma). Partir de este episodio y de este flujo de voz para el 02. *(01 final)*

- **El borrador del arranque no entraba:** ~540 caracteres ≈ 39 s de voz a 14 c/s, en un video de 36 s con acciones sin voz (giro, rebote). Se recortó a 449 caracteres (82 palabras) antes de animar; contar caracteres ANTES de fijar frames sigue siendo la regla. *(01 sin voz)*
- **`<Subtitulos>` dibuja SVG:** va dentro de un `<svg width=1080 height=1920>`; dentro de un div sale como texto suelto arriba a la izquierda. *(01 sin voz)*
- **El naranja no sirve de énfasis:** el QA de subtítulos solo detecta énfasis amarillo; con un solo acento de marca, Despiece va sin palabras resaltadas. *(01 sin voz)*
- **Mecanismo físico de verdad, por código:** los pernos se apoyan en el perfil de la llave (`min(reposo, canto)`) en cada fotograma, así la entrada de la llave, la llave mal cortada y el giro (lo de adentro del rotor se aplasta con cos θ) salen solos y son correctos. Que las columnas «suban de a una» no es físico (al entrar la llave suben todas juntas): se resolvió con un barrido de luces, una por columna. *(01 sin voz)*
- **Tramo muerto encontrado por medición:** f97–127 (0,34 % de cambio a 1 s) entre que la llave llega y la pregunta se va; se estiró la entrada de la llave. `scripts/qa-tramos-muertos.mjs` lo mide sobre el MP4 (también el gancho f0→f10 y el loop). *(01 sin voz)*
- Etiquetas en Plex Mono 42 px: a 360 px de ancho se leen; 38 px quedaban justas. *(01 sin voz)*
- **Gancho = la revelación del final** (v5): la llave con su «contraseña» 3 6 2 7 4 en el cuadro 0, y la línea abre la cerradura antes de f12. El v2 tenía el primer segundo casi quieto y un cilindro cerrado que no se reconocía como cerradura. *(01 v5)*
- **Sin tramo de «clase»:** las piezas se nombran mientras pasa la acción (3 rótulos, en la palabra). Se cortaron 7 s de rótulos uno por uno. *(01 v5)*
- **El giro se entiende de frente**, no de costado (de costado el rotor queda como un bloque rayado): corte → vista de frente en 6 frames, 90°, clac fuerte y sacudón de 4 px. Los tics crecen (tono y volumen) hasta el clac. *(01 v5)*
- **«¿Cuál abre?»** con dos llaves casi iguales numeradas, para sumar comentarios (comentario fijado: «¿Cuál era la que abría, la 1 o la 2?»). *(01 v5)*
- **Matías a velocidad 1,0 ≈ 13,8 caracteres/s** (440 caracteres = 32,3 s en una toma). Para un Short de 28–31 s con acciones sin voz: una toma entera + Scribe y cortar por frase con pausas de ≈ 0,3 s (`scripts/voz-despiece.mjs`) dejó 26,8 s de voz sin regenerar. 1 toma = 448 créditos. *(01 v5)*
- **Hoja de contactos y `clipPath`:** con varios fotogramas en el mismo documento, los ids se pisan (todos usaban el `clipPath` del primero). Ids con `useId()`. *(01 v5)*
- **Los dos tramos quietos aparecieron recién con la voz:** el final (código + chip) y «Tu llave no es una llave». Se resolvieron con los números del código saltando de a uno (con un tic) y un acercamiento lento; medir `qa-tramos-muertos` también sobre el MP4 con voz. *(01 v5)*
- **Loop exacto:** las rampas del cierre tienen que terminar en `DURACION - 1` (no en `DURACION`), así el último fotograma es igual al f0 (diferencia 0,00 %). *(01 v5)*

## Otro

- (Todavía sin videos.)
