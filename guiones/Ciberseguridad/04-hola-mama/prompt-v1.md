# PROMPT MAESTRO — Canal nuevo «Ciberseguridad» · Serie «Anatomía de una estafa» · Episodio 04 «Hola ma, número nuevo» (Remotion)

Sos el desarrollador y animador a cargo de **arrancar un canal nuevo** dentro del repo `animacion-en-proceso` y construir su primer Short. Es un canal distinto de GiroDato y de MilAños: estética, tipografías, paleta, sonido y voz propios. Lo único que se comparte es la **infraestructura** (zona segura, sistema de subtítulos, QA, scripts de voz y stills). Este documento tiene todas las decisiones; no dependas de conversaciones anteriores. El trabajo termina cuando pasa el QA de la sección 12 y yo apruebo el render, no cuando compila.

Además del Short, dejás una **plantilla de serie** (`AnatomiaEstafa`) en la que cada episodio nuevo sea un archivo de datos y una sola pieza visual propia.

## 0. Reglas de trabajo (obligatorias)

1. Leé primero `CLAUDE.md`, `BIBLIOTECA.md`, `guiones/README.md` y `guiones/APRENDIZAJES.md`, y seguí sus reglas (ramas, `videosPrueba/`, nada en `out/`, `src/canal/zonaSegura.ts` como única fuente de verdad, `npm run qa:subs` con 0 fallas). Si una regla de **estética** de esos archivos contradice este documento, gana este documento (esas reglas son de GiroDato). Las reglas de **zona segura, subtítulos y QA** de esos archivos ganan siempre.
2. Rama nueva `canal/ciberseguridad-04-hola-mama` desde `main`. Si `main` no tiene el sistema de subtítulos nuevo (vive en `fix/subtitulos-canal`), frená y preguntame desde qué rama salir. Sin merge a `main` hasta que yo apruebe.
3. **No instales nada sin consultarme.** Una sola lista (paquete, para qué, tamaño). Versiones alineadas a 4.0.541 con `npx remotion add`.
4. **ElevenLabs:** autorizado solo con `scripts/gen-voice.mjs` y los límites de la sección 9. La clave, solo por variable de entorno; nunca la imprimas ni la copies. No uses el conector MCP de ElevenLabs.
5. **Nada destructivo.** No toques `src/videos/01-*`, `02-*`, `03-*`, ni Tomi, ni los escenarios de GiroDato. Si algo de `src/canal/` necesita una variante, agregale una prop con valor por defecto que deje idénticos los videos existentes (comprobalo con `scripts/qa-frame-diff.mjs` sobre `EfectoSenueloTomiV2` y `GiroDatoStroopV2`, frames 0, mitad y último).
6. Si algo cambia en el código y no fuiste vos, fui yo: no lo pises.
7. Informe honesto: si falta la voz o algo no quedó como se pide, decilo.

## 1. Por qué este canal (contexto para decidir bien; no lo pongas en pantalla)

- Demanda documentada: el FBI (IC3, informe 2025) registró 1.008.597 denuncias y US$20.877 M en pérdidas, +26 % interanual; los mayores de 60 perdieron US$7.700 M. En Argentina, los fraudes en línea son el 63 % de las denuncias por delitos informáticos (UFECI, 2024), y en CABA las modalidades más frecuentes son robo de cuentas de WhatsApp, fraude con billeteras virtuales y suplantación.
- Lo que ya funciona en Shorts: el **scambaiting filmado** (Scammer Payback ~9,4 M de suscriptores; Pleasant Green ~1,5 M) y el formato **«historia por chat»** (conversaciones de texto que se leen en pantalla). Ambos atrapan, pero ninguno explica el mecanismo en 45 segundos de forma que se le pueda mandar a un familiar.
- Nuestra evolución: **historia por chat + autopsia**. El espectador lee la conversación, se congela, **intenta encontrar las señales antes que nosotros**, y después la marcamos con marcador rojo sobre un expediente. Es el mismo principio del señuelo y el Stroop (el espectador lo vive), con un formato que el mercado ya demostró.
- Sponsors naturales: VPN, borrado de datos, gestores de contraseñas y antivirus (NordVPN, Surfshark, Incogni, DeleteMe, Aura, Kaspersky, ESET, Bitdefender ya patrocinan creadores). Las marcas exigen **seguridad de marca**: rigor, cero amarillismo, cero tutoriales para estafar y un segmento patrocinable limpio. Por eso las secciones 2 y 6.6.
- Riesgo de monetización (YouTube, julio de 2026): no se monetiza el contenido genérico de plantilla, el de choque sin resolución, ni las **personas de IA presentadas como expertos humanos** en temas sensibles (finanzas incluidas). Por eso: el narrador es «el canal», sin nombre ni cara de experto; cada episodio tiene una pieza visual propia; y las fuentes son públicas.

## 2. Rigor y seguridad (no negociable)

1. **Enfoque defensivo.** Se muestra el mecanismo psicológico (urgencia, excusa, confianza prestada, desvío del dinero) y la defensa. Nunca guiones completos y reutilizables, ni pasos técnicos, ni herramientas, ni cómo evitar controles de bancos o plataformas.
2. **Nada real.** Sin marcas, logos ni interfaces copiadas de WhatsApp, bancos o billeteras reales. La app de chat es ficticia («Charla»), el banco es ficticio («Banco Ceibo»), los números y CBU son ficticios y parcialmente enmascarados (`•••• 4821`), los nombres son genéricos. La interfaz se parece a «un chat cualquiera», no a uno identificable.
3. **Etiqueta visible** «RECREACIÓN · CASO ILUSTRATIVO» desde el frame 0 hasta el final (en inglés: «RECREATION · ILLUSTRATIVE CASE»).
4. **Cero cifras en pantalla en este episodio.** Las fuentes van en el comentario fijado (sección 14).
5. **Sin amarillismo:** nada de sangre, calaveras, alarmas rojas parpadeando, «¡CUIDADO!» en mayúsculas gritadas, ni música de terror. Tensión sí; miedo barato no.
6. La narración no se presenta como experta («Soy perito…» prohibido). Habla en nombre del canal: «Desarmemos este mensaje».
7. Agregá a `src/canal/qa/prohibidas.ts` (sin quitar nada) los nombres de bancos, billeteras y apps reales más comunes en Argentina, España, México y EE.UU. (por ejemplo WhatsApp, Mercado Pago, Ualá, Brubank, Santander, BBVA, Galicia, Nación, Zelle, Venmo, PayPal, Bizum). El QA tiene que fallar si aparecen en pantalla. Si prohibidas.ts no admite listas por canal, agregá una prop o un segundo archivo `prohibidas-ciberseguridad.ts` sin romper el QA actual.

## 3. El video

- Canal: `Ciberseguridad` (carpetas que ya existen: `guiones/Ciberseguridad/`, `videosPrueba/Ciberseguridad/`, `videosFinal/Ciberseguridad/`). Nombre público todavía sin decidir; en `theme.ts` dejá `CHANNEL_NAME = "Caso Desarmado"` como nombre de trabajo.
- Número y carpeta: `04-hola-mama` (sigue la numeración del repo).
- Composiciones dentro de `<Folder name="ciberseguridad">`: `EstafaHolaMamaES` (principal) y `EstafaHolaMamaEN` (misma animación, textos y voz en inglés; render solo si alcanza el presupuesto de la sección 9). Más un Still `EstafaHolaMamaHojaContactos`.
- 1080 × 1920, 30 fps, **1.350 frames (45 s)**; se puede ajustar ±60 frames para seguir a la voz real.
- Idioma: español neutro con tú (se comparte en grupos familiares de toda LATAM y España). Inglés: británico/estadounidense neutro.
- Público: 18–60 años, y sobre todo hijos que se lo reenvían a sus padres.
- Un único plano continuo, sin cortes. El último frame es visualmente idéntico al frame 0 (loop).

## 4. Dirección de arte: «Expediente marcado»

Concepto: un celular apoyado sobre un **expediente impreso**, a la luz del día. Un investigador invisible marca la conversación con **marcador rojo y resaltador**, pone sellos y une las señales con flechas. Es lo opuesto a los otros dos canales: **fondo claro** (papel), no mesa oscura. En un feed lleno de fondos negros, un Short claro y limpio se distingue en el primer cuadro.

### 4.1 Paleta (`src/videos/04-hola-mama/theme.ts`; luego se mueve a `src/canales/ciberseguridad/theme.ts`, ver sección 10)

| Token | Hex | Uso |
| --- | --- | --- |
| paper | #EEEAE0 | Expediente (fondo) |
| paperShade | #DDD7C9 | Sombras del papel, renglones |
| grid | #CFC8B8 | Cuadrícula de 40 px al 35 % |
| ink | #15171B | Texto del expediente |
| inkSoft | #5B5F66 | Metadatos |
| phoneBody | #1B1D22 | Celular |
| screenBg | #F7F8FA | Fondo del chat |
| bubbleThem | #FFFFFF | Burbuja del otro, borde #E1E3E8 |
| bubbleMe | #DCE8F5 | Burbuja propia (azul grisáceo, no el verde de ninguna app real) |
| marker | #D7261E | **Solo** las señales: círculos, flechas, numeración, sello |
| highlight | #FFE45C al 70 % | Resaltador sobre la frase exacta de cada señal |
| safe | #1F7A4D | **Solo** la defensa (tilde y sello final) |

Regla de color: el rojo aparece únicamente cuando se marca una señal; el verde, únicamente en la defensa. Contraste de todo texto ≥ 4,5:1 (calculalo).

### 4.2 Tipografía (`@remotion/google-fonts`; ninguna se usa en GiroDato ni en MilAños)

- **Archivo** 800 (ancho condensado si está disponible): titulares del expediente («CASO 04», «SEÑAL 2/4», «LA DEFENSA»).
- **DM Sans** 500/700: interfaz del chat.
- **DM Mono** 500: metadatos del expediente (fecha, hora, «RECREACIÓN · CASO ILUSTRATIVO»).
- **Permanent Marker**: anotaciones a mano del investigador (máximo 4 palabras por anotación).

Ningún color ni fuente se escribe fuera de `theme.ts`.

### 4.3 Materiales y luz

- Papel: color `paper` + textura `feTurbulence` estática (semilla fija, opacidad 0,06) + cuadrícula fina + una mancha de café muy tenue (un solo detalle de vida, abajo a la izquierda).
- Luz: de día, suave, desde arriba a la izquierda. Sombra del celular `0 30px 60px rgba(0,0,0,.18), 0 6px 14px rgba(0,0,0,.12)`. Sin grano animado fuerte (opacidad 0,02 como máximo): el canal se ve limpio.
- Encabezado del expediente, impreso en el papel, arriba: «CASO 04 · "NÚMERO NUEVO"» (Archivo 800) y debajo, en DM Mono, «RECREACIÓN · CASO ILUSTRATIVO». Clip de metal sujetando la hoja (SVG) arriba a la derecha.
- Celular: vector propio (bisel de 18 px, radio 64, isla superior genérica), 640 × 1240 px en pantalla, ligeramente rotado −2°. Barra superior genérica con hora «9:41», sin íconos de marcas.
- Chat «Charla»: cabecera con avatar gris genérico y el contacto «+54 9 11 •••• 4821» (en la versión EN: «+44 7••• ••4821»). Sin tildes de leído de ninguna app real; usá un punto gris «visto».
- Marcador rojo: trazos SVG con borde irregular (path con ruido de semilla fija), dibujados con `strokeDashoffset`, grosor 9 px, extremos redondeados. Círculos que no cierran perfecto. Resaltador: rectángulo con bordes irregulares que se «pinta» de izquierda a derecha detrás de la frase exacta.
- Sellos: «CASO DESARMADO» en verde `safe`, rotado −6°, borde doble, textura de tinta con huecos (máscara de ruido).

## 5. Layout (lienzo 1080 × 1920, todo dentro de `src/canal/zonaSegura.ts`)

- Importá `ZONA`, `CENTRO_X`, `ANCHO_TEXTO_MAX` y `CARRIL` de `src/canal/zonaSegura.ts`. Nada clave fuera de la zona. **El carril de subtítulos (y 1300–1536, x 168–912) queda libre siempre**: el celular y las anotaciones se ubican arriba de él.
- Encabezado del expediente: y 250–330, alineado a `ZONA.left`.
- Celular: centro x 470, de y 360 a ~1280 (escalalo para que no entre en el carril; si no entra, achicalo, no muevas el subtítulo).
- Anotaciones a mano: en el margen derecho del papel (x 720–900) o sobre el celular, sin tapar la frase marcada.
- Contador de señales «SEÑALES 0/4 → 4/4»: arriba a la derecha, debajo del clip (x 700–900, y 260).
- Segmento de patrocinio (sección 6.6): una ficha que entra sobre el papel en la parte superior, nunca sobre el chat ni el carril.

## 6. Guion y cronograma (fuente de verdad para `timeline.ts`; los textos viven en `episodes/hola-mama.ts`)

### 6.1 Estructura

| Frames | Bloque | Imagen | Voz (ES) |
| --- | --- | --- | --- |
| 0–75 | Gancho | Frame ya compuesto: celular sobre el expediente con la notificación del primer mensaje. El celular vibra en f6. Contador «SEÑALES 0/4» | «Este mensaje sigue vaciando cuentas. ¿Encontrás el truco antes que yo?» |
| 75–480 | El chat | La conversación se escribe en vivo (burbuja de «escribiendo…» antes de cada mensaje del otro). Tiempos de la 6.2 | Sin voz: el espectador lee. Solo sonidos de mensaje |
| 480–570 | Modo detective | Todo se congela. Sobre el papel, en Archivo: «PAUSA. ¿CUÁNTAS VISTE?». Un reloj de arena de 3 s (anillo que se vacía) | «Pausa. ¿Cuántas señales viste?» |
| 570–1020 | Autopsia | El chat vuelve a cada mensaje clave (scroll suave); para cada señal: resaltador sobre la frase → círculo rojo → número → anotación a mano → contador sube. En la señal 4, el dinero «se va» (6.3) | Texto de la 6.4 |
| 1020–1170 | La defensa | La conversación termina con la respuesta segura (6.2, mensaje 9), tilde verde, sello «CASO DESARMADO» | «La defensa: llamá al número viejo o pedí una videollamada. Y preguntá algo que solo él sepa.» |
| 1170–1350 | Cierre y loop | «Mandáselo a quien lo necesite.» en Archivo; en la zona de subtítulos, DM Mono: «Comentá: ¿en qué mensaje te diste cuenta?». Las marcas se borran (el marcador se «despinta» al revés), el chat vuelve al primer mensaje, el contador a 0/4 y la notificación reaparece igual que en f0 | «Mandáselo a quien lo necesite.» |

### 6.2 La conversación (`episodes/hola-mama.ts`, como datos)

Español (con «tú» en la narración; los mensajes imitan cómo escribe la gente, sin faltas grotescas):

| # | Quién | Texto | Entra (frame) |
| --- | --- | --- | --- |
| 1 | Desconocido | Hola ma, se me cayó el celu y perdí todo. Este es mi número nuevo, guardalo | 75 (notificación ya visible desde f0) |
| 2 | Mamá | ¿Juli? ¿Estás bien? | 150 |
| 3 | Desconocido | Sí ma, todo bien, uso este por ahora | 195 |
| 4 | Desconocido | Una pregunta, tengo que pagar algo hoy y la app del banco no me anda en este teléfono | 255 |
| 5 | Desconocido | ¿Me lo transferís vos y mañana te lo devuelvo? Es urgente, vence hoy | 330 |
| 6 | Mamá | ¿Cuánto es? | 390 |
| 7 | Desconocido | Pasáselo a esta cuenta que es de un amigo: Banco Ceibo •••• 4821 | 420 |
| 8 | — | (congelado en el mensaje 7) | 480 |
| 9 | Mamá (defensa) | Te llamo al número viejo y lo hablamos | 1035 |
| 10 | Desconocido | (aparece «escribiendo…» dos veces y desaparece; el contacto queda en «visto» y nunca responde) | 1065–1140 |

Inglés (para `EstafaHolaMamaEN`): «Hi Mum, dropped my phone and lost everything. This is my new number, save it» · «Jules? Are you ok?» · «Yeah all good, using this one for now» · «Quick question, I need to pay something today and my banking app won't work on this phone» · «Can you send it for me and I'll pay you back tomorrow? It's urgent, it's due today» · «How much?» · «Send it to my friend's account: Ceibo Bank •••• 4821» · defensa: «I'll call your old number and we'll sort it».

Duración de lectura: cada mensaje queda visible al menos `max(45, 3 × palabras)` frames antes de que el siguiente lo empuje. Si no entra en 75–480, alargá el bloque (y corré lo que sigue), nunca aceleres la lectura.

### 6.3 Las cuatro señales (orden, frase exacta marcada y anotación a mano)

| Señal | Mensaje | Frase resaltada | Anotación (Permanent Marker) | Voz (ES) |
| --- | --- | --- | --- | --- |
| 1 | 1 | «número nuevo» + «perdí todo» | «excusa antes de que preguntes» → resumida a «¿por qué tan rápido?» si no entra en 4 palabras | «Uno: te da la excusa antes de que preguntes. La duda queda resuelta antes de aparecer.» |
| 2 | 2 | «¿Juli?» | «el nombre lo pusiste vos» | «Dos: nunca dijo su nombre. Se lo diste vos.» |
| 3 | 4 y 5 | «no me anda» + «vence hoy» | «excusa + apuro» | «Tres: urgencia, y con la excusa técnica incluida.» |
| 4 | 7 | «de un amigo» | «¿por qué no la suya?» | «Cuatro, el truco: la cuenta de otra persona. Si fuera tu hija, ¿por qué no la suya?» |

En la señal 4: una flecha roja sale del mensaje 7 hacia el margen del papel, donde aparece una ficha DM Mono «DESTINO: CUENTA DE TERCERO» y un billete simple (vector, sin diseño de ninguna moneda real) que se desliza por la flecha y se pierde detrás del borde. Sonido grave corto. Es la pieza visual propia de este episodio (sección 10, regla de episodio).

### 6.4 Inicios de frase planificados (para `timeline.ts`)

«Este mensaje» f8 · «¿Encontrás el truco» f40 · «Pausa» f485 · «¿Cuántas señales» f505 · «Uno» f575 · «Dos» f690 · «Tres» f780 · «Cuatro, el truco» f870 · «Si fuera tu hija» f940 · «La defensa» f1025 · «llamá al número viejo» f1050 · «Y preguntá algo» f1110 · «Mandáselo» f1180.

**La imagen sigue a la voz:** con la alineación real de ElevenLabs, si un evento visual queda a más de 6 frames de su palabra, ajustá `timeline.ts`, no el audio.

### 6.5 Cámara

Un contenedor con `perspective: 2000px`, origen en el centro del celular. Keyframes con `Easing.bezier(0.45, 0, 0.2, 1)` y clamp:

| Frames | Escala | X / Y | Nota |
| --- | --- | --- | --- |
| 0 → 75 | 1,00 → 1,03 | 0 | Leve acercamiento en el gancho |
| 480 → 500 | → 1,06 | 0 | El congelado «aprieta» |
| 570 → 1020 | 1,06 → 1,10 en cada señal y vuelta a 1,06 | Encuadra la frase marcada | Un acercamiento suave por señal, 20 frames |
| 1020 → 1060 | → 1,00 | 0 | Defensa en plano general |
| 1300 → 1349 | → valores del frame 0 | 0 | Loop |

Deriva constante: x = 2·sin(2π·f/150), y = 1,5·sin(2π·f/270). Ambos períodos dividen 1.350.

Curvas: burbujas que entran `spring({damping: 18, stiffness: 160, mass: 0.7})`; reacomodos `spring({damping: 200})`; salidas `Easing.in(Easing.cubic)` 10–12 frames; trazos de marcador 12–16 frames con `Easing.out(Easing.quad)` (rápido, como una mano). Nada lineal salvo el reloj de arena.

### 6.6 Segmento patrocinable (preparado, apagado)

- Prop zod `sponsor: { name: string; line: string; } | null`, default `null`.
- Cuando no es `null`, entre la defensa y el cierre (f1140–1200) entra una ficha «Este caso llega gracias a {name}» + `line` (máx. 60 caracteres) en el tercio superior del papel, en el mismo estilo del expediente (no un banner). Con `null` no aparece nada y el cronograma no cambia.
- Renderizá un still de prueba con `sponsor: { name: "Marca Ejemplo", line: "Texto de ejemplo del patrocinador" }` para que vea cómo queda. No uses marcas reales.

## 7. Subtítulos

- Usá el sistema compartido `src/canal/subtitulos/` (paginación por frase, medida real, carril fijo), pasándole por props el **estilo de este canal**: DM Sans 700 (o Archivo 800 si mide mejor), 66 px, tinta `ink` sobre una banda de papel `paperShade` al 92 % con radio 14 (en vez de contorno), palabra que suena al 100 % y el resto al 70 %. Énfasis (máx. 1 por página) en `marker`: `truco`, `señales`, `nombre`, `urgencia`, `amigo`, `defensa`.
- Si `Subtitulos.tsx` no acepta estilos por props, agregalos con valores por defecto que dejen GiroDato idéntico (verificalo con `qa-frame-diff`).
- **Ocultos** entre f75 y f480 (el espectador lee el chat) y de f1170 al final (el texto ya está en pantalla).
- Fuente de tiempos: la alineación de ElevenLabs. Los subtítulos muestran el texto escrito, no el deletreado.

## 8. Sonido (sintetizado por código o de `public/biblioteca/`, sin licencias nuevas)

Script nuevo `scripts/gen-sfx-ciberseguridad.mjs` (WAV 48 kHz mono, 16 bits, semilla fija) → `public/videos/04-hola-mama/sfx/`. Antes de sintetizar algo, revisá si `public/biblioteca/catalogo.json` ya tiene uno que sirva; si lo usás, citá el archivo en el informe.

| Archivo | Frame(s) | Receta | Volumen |
| --- | --- | --- | --- |
| vibrate.wav | 6 (y 1300 para el loop) | Seno 170 Hz modulado a 25 Hz, dos pulsos de 120 ms | 0,30 |
| msg-in.wav | entrada de cada mensaje del otro | Dos senos 880 + 1320 Hz, 70 ms, caída rápida (genérico, no el de ninguna app) | 0,25 |
| msg-out.wav | mensajes de Mamá | Seno 660 Hz, 50 ms | 0,20 |
| typing.wav | durante cada «escribiendo…» | Clics suaves aleatorios con semilla, 0,6 s | 0,08 |
| freeze.wav | 480 | Golpe sordo 70 Hz + corte del ambiente | 0,35 |
| tick.wav | 495–570 | Tic de reloj cada 15 frames | 0,25 |
| marker.wav | cada trazo de marcador | Ruido rosa pasabanda 2–5 kHz con envolvente de trazo, 0,35 s | 0,22 |
| highlight.wav | cada resaltado | Ruido más blando, 0,4 s | 0,15 |
| count.wav | cada vez que sube el contador | Clic de sello pequeño | 0,30 |
| money-gone.wav | señal 4 | Seno 110 → 55 Hz en 400 ms | 0,30 |
| stamp.wav | sello «CASO DESARMADO» | Golpe 90 Hz + ruido corto | 0,40 |
| room.wav | 0–1350 | Ambiente de oficina de día: ruido rosa pasabajos 500 Hz, loop exacto de 45 s | 0,04 |

Fades de 2–5 ms en extremos. Verificá cada efecto con `scripts/qa-wave-png.mjs`. Sin música en esta versión.

Mezcla: voz al frente. Medí el MP4: `npx remotion ffmpeg -i <mp4> -af loudnorm=print_format=summary -f null -`. Objetivo ≈ −14 LUFS integrados, pico real ≤ −1 dBTP.

## 9. Voz

- Reutilizá `scripts/gen-voice.mjs` y `scripts/normalize-voice.mjs` (mismos parámetros que el repo: `eleven_multilingual_v2`, velocidad 1,0, `--drive 6`), con salida en `public/videos/04-hola-mama/voz/{es,en}/` y su manifiesto y caché.
- **Voz propia del canal:** no uses la de GiroDato (Isaac). Leé `ELEVENLABS_VOICE_ID_CIBER` del entorno. Si no existe, **frená y pedímela** (te voy a dar una voz serena, de 30–45 años, cercana, no de locutor de noticias).
- Una petición por bloque de voz, con `previous_text` y `next_text`.
- **Presupuesto: 2.500 caracteres en total** (ES + EN, reintentos incluidos). Generá primero ES; EN solo si quedan caracteres. Ante 401, 402, 403 o 429, frená y avisame. Máximo 2 reintentos por bloque.
- No podés escuchar: verificá con la alineación que estén todas las palabras en orden y que no haya silencios internos > 0,8 s. En el informe, pedime que escuche «encontrás», «señales», «Juli», «mandáselo».

## 10. Arquitectura

```
src/
  canales/ciberseguridad/            identidad del canal (compartida por todos sus episodios)
    theme.ts                         paleta, fuentes, tamaños, layout, CHANNEL_NAME
    AnatomiaEstafa.tsx               plantilla: Paper → Camera(Phone + Annotations + EpisodeSetPiece) → Overlays → Subtitulos → Audio
    componentes/
      paper/Paper.tsx  paper/CaseHeader.tsx  paper/Clip.tsx
      phone/Phone.tsx  phone/ChatApp.tsx  phone/Bubble.tsx  phone/TypingIndicator.tsx  phone/Notification.tsx
      marker/MarkerCircle.tsx  marker/MarkerArrow.tsx  marker/Highlighter.tsx  marker/HandNote.tsx  marker/Stamp.tsx
      ui/SignalCounter.tsx  ui/DetectiveTimer.tsx  ui/CaseTag.tsx  ui/SponsorCard.tsx  ui/EndCard.tsx
      audio/AudioLayer.tsx
      debug/SafeZoneOverlay.tsx (o reutilizá el de src/canal/ si existe)
    lib/ anim.ts  chatLayout.ts      (posición de burbujas, scroll y tiempos de lectura)
  videos/04-hola-mama/
    EstafaHolaMama.tsx               ES y EN a partir de los mismos datos
    timeline.ts                      todos los frames como constantes con nombre
    episodes/hola-mama.ts            mensajes ES/EN, señales, frases a resaltar, anotaciones, voz, énfasis, fuentes
    setpiece/MoneyLeak.tsx           la pieza visual propia del episodio (6.3)
scripts/gen-sfx-ciberseguridad.mjs
public/videos/04-hola-mama/{voz,sfx}/
guiones/Ciberseguridad/04-hola-mama/  guion.md, este prompt, ENTREGA.md
```

Reglas:
- `src/canales/ciberseguridad/` no importa nada de `src/videos/` ni de los escenarios o personajes de GiroDato. Sí puede importar `src/canal/zonaSegura.ts`, `src/canal/subtitulos/` y `src/canal/qa/`.
- **Regla de episodio (contra el contenido «de plantilla»):** la plantilla da identidad (papel, celular, marcador, contador, sellos, sonido, loop). Cada episodio **debe** aportar una pieza visual propia en `setpiece/` que muestre su mecanismo (acá, la fuga del dinero) y su propia investigación en `episodes/*.ts` (`fuentes: {titulo, url, fecha}[]`, obligatorio). Si `fuentes` está vacío, el render falla con un error claro.
- Animación solo con `useCurrentFrame()`, `interpolate()` con clamp, `spring()` y `<Sequence>`. Prohibido `transition`, `@keyframes`, `requestAnimationFrame`, `Date`, `Math.random()` (usá `random('semilla')`).
- Props con zod: `lang: "es" | "en"`, `showSafeZones`, `sponsor`, `capa: "todo" | "subtitulos" | "escena"` (para el QA de subtítulos, igual que en GiroDato).
- TypeScript estricto, sin `any`. Código en inglés; textos en pantalla en el idioma del episodio. Ningún frame mágico fuera de `timeline.ts`; ningún color ni fuente fuera de `theme.ts`.

## 11. Vista previa

- Studio sin errores ni advertencias.
- Stills con `npx remotion still` en `videosPrueba/Ciberseguridad/qa/04-hola-mama/stills/`, con y sin `showSafeZones`: 0, 40, 160, 270, 430, 500, 600, 700, 800, 900, 960, 1050, 1150, 1200, 1300, 1349. Más uno con `sponsor` activo (f1170) y uno en EN (f900).
- Hoja de contactos `EstafaHolaMamaHojaContactos`.
- **Mirá cada imagen** y corregí hasta que pase la sección 12. Prestá atención a que el chat se lea a 360 px de ancho y a que la frase marcada sea legible bajo el resaltador.

## 12. Control de calidad

| Prueba | Criterio |
| --- | --- |
| Subtítulos | `npm run qa:subs -- EstafaHolaMamaES` con 0 fallas (y `EN` si se renderiza) |
| Carril libre | Ningún píxel del celular, anotaciones ni fichas en y 1300–1536, x 168–912 mientras hay subtítulos |
| Zona segura | Nada clave fuera de `ZONA`, incluido el acercamiento a 1,10 |
| Prohibidas | Ningún nombre de banco, billetera o app real en pantalla ni en el texto de voz |
| Legibilidad del chat | Hoja reducida a 360 px: cada mensaje se lee; ningún texto < 28 px en el lienzo |
| Tiempo de lectura | Cada mensaje visible ≥ `max(45, 3 × palabras)` frames (calculalo con un script) |
| Contraste | ≥ 4,5:1 en todos los textos, incluido el texto bajo el resaltador y el sello |
| Coherencia | Un solo rojo (señales), un solo verde (defensa), cuatro familias tipográficas, nada de la estética de GiroDato o MilAños |
| No regresión | `EfectoSenueloTomiV2` y `GiroDatoStroopV2` idénticos en frames 0, mitad y último (`qa-frame-diff`) |
| Loop | Frame 1349 vs frame 0: diferencia mínima (script) |
| Sincronía | Eventos a ±3 frames de su palabra; efectos en su frame |
| Rigor | «RECREACIÓN · CASO ILUSTRATIVO» visible todo el video; `fuentes` no vacío; sin cifras en pantalla |
| Audio | Sin clipping; loudness según la sección 8 |
| Render | H.264, 1080 × 1920, 30 fps, duración final verificada con `npx remotion ffprobe` |

## 13. Render

- `npx remotion render EstafaHolaMamaES videosPrueba/Ciberseguridad/04-hola-mama-es-v1.mp4 --gl=angle` (siguiente número libre; no sobrescribas).
- EN, si hay voz: `.../04-hola-mama-en-v1.mp4`.
- Sin voz: `-BORRADOR-SIN-VOZ` en el nombre.
- Nada a `videosFinal/` hasta que yo lo diga.

## 14. Documentación y texto para publicar (no publiques nada)

- `guiones/Ciberseguridad/04-hola-mama/`: `guion.md` (ES y EN), `ENTREGA.md`.
- `guiones/README.md`: fila nueva del 04 en el índice («🧪 v1 en prueba»), canal Ciberseguridad.
- `guiones/APRENDIZAJES.md`: una entrada con lo que aprendiste al crear la plantilla.
- `BIBLIOTECA.md`: sección corta «Canal Ciberseguridad» con cómo crear un episodio nuevo (archivo de datos + setpiece + fuentes).
- `CLAUDE.md`: una línea que diga que el canal Ciberseguridad tiene su identidad en `src/canales/ciberseguridad/` y que sus reglas de seguridad están en la sección 2 de este prompt. Mostrame cada cambio de documentación como diff.
- Texto para publicar (dejalo en `ENTREGA.md`):
  - Título ES: «Este mensaje sigue vaciando cuentas (el truco es la señal 4)». EN: «The "Hi Mum" text that keeps working (the trick is sign 4)».
  - Descripción ES: «Desarmamos la estafa del "número nuevo" en 4 señales. Conversación recreada con fines ilustrativos; nombres, números y bancos son ficticios. Si te pasó, avisá a tu banco y denunciá. Fuentes en el comentario fijado.»
  - Comentario fijado: «¿En qué mensaje te diste cuenta? Fuentes: FBI IC3, Internet Crime Report 2025 (ic3.gov) · Ministerio Público Fiscal, UFECI · FTC Consumer Alerts (consumer.ftc.gov).» Antes de entregar, verificá que esos enlaces existan y anotá la fecha de consulta en `fuentes`.
  - Recordatorio: marcar «contenido alterado o sintético» al subir.

## 15. Informe final

1. Rutas de los MP4, la hoja de contactos y los reportes de QA.
2. Estado: **terminado** o **borrador**, y por qué.
3. Tabla de la sección 12 con el resultado de cada prueba.
4. Qué reutilizaste de `src/canal/` y qué props agregaste (con la prueba de no regresión).
5. Desvíos respecto de este documento y su motivo.
6. Voz: id, modelo, ajustes, bloques regenerados y caracteres consumidos.
7. Qué tengo que mirar y escuchar yo.
8. Cómo crear el episodio 05 con la plantilla: qué archivos nuevos y qué setpiece haría falta. Proponé tres episodios siguientes con su pieza visual propia (por ejemplo: el código de 6 dígitos que te piden «por error»; el aviso de paquete retenido; la llamada con la voz clonada de un familiar).
9. Paquetes instalados (si te autoricé alguno).
