# PROMPT MAESTRO — Canal Ciberseguridad «Caso Desarmado» · Serie «Anatomía de una estafa» · Episodio 01 «Te mandé un código por error» (Remotion)

Sos el desarrollador y animador a cargo de **arrancar un canal nuevo** dentro del repo `animacion-en-proceso` y de construir su **primer Short**. No es un episodio de GiroDato ni de MilAños: es otra marca, con identidad propia, igual que MilAños fue un canal nuevo con todo nuevo. Nombre de trabajo del canal: `CHANNEL_NAME = "Caso Desarmado"` (sin verificar disponibilidad; que viva en una sola constante). Este documento tiene todas las decisiones; no dependas de conversaciones anteriores. El trabajo termina cuando pasa el control de calidad de la sección 13 y yo apruebo el render, no cuando compila.

## 0. Reglas de trabajo (obligatorias)

1. **Leé primero** `CLAUDE.md`, `BIBLIOTECA.md`, `guiones/README.md` y `guiones/APRENDIZAJES.md`, y seguí sus reglas (ramas, `videosPrueba/`, nada en `out/`, Remotion 4.0.541 fijado, `npx remotion add`). Si algo de estética de esos archivos choca con este documento, **gana este documento solo para este canal**: lo de GiroDato y MilAños no se toca.
2. **Ya existe un plan anterior** del canal: `guiones/Ciberseguridad/04-hola-mama/prompt-v1.md` (numerado 04 por error). Leelo y aprovechá lo que no contradiga este documento (app y banco ficticios, etiqueta «RECREACIÓN», marcas reales como prohibidas). **Este documento lo reemplaza:** la serie arranca en el **01**. No borres ese archivo; en `guiones/README.md` dejá anotado que «Hola ma, número nuevo» pasa a ser el episodio **02** de la serie y que su prompt hay que adaptarlo a la plantilla de este episodio.
3. Rama nueva `canal/ciberseguridad-01-codigo-por-error` (desde `main`; la rama actual es `fix/subtitulos-canal`: no trabajes sobre ella ni la mezcles). Sin merge a `main` ni push hasta que yo apruebe.
4. **Nada destructivo.** No modifiques nada de GiroDato ni de MilAños. Lo compartido del repo (`src/canal/`: subtítulos, `zonaSegura.ts`, QA, `scripts/`) se **importa**; si necesitás una variante, agregá props con valores por defecto que dejen los otros canales renderizando idéntico (comprobalo con `scripts/qa-frame-diff.mjs` sobre 3 fotogramas de cada uno).
5. **Sin servicios pagos** salvo la API de ElevenLabs para la voz, con los límites de la sección 9 (esto es mi autorización explícita para gastar ese presupuesto, y solo ese). La clave se lee solo de la variable de entorno; nunca la imprimas ni la copies.
6. **No instales nada sin consultarme.** Una sola lista consolidada (paquete, para qué, tamaño) y esperá mi OK.
7. Si algo cambia en el código y no fuiste vos, fui yo: no lo pises.
8. **Informe honesto.** Si falta la voz o algo no quedó como se pide, decilo. Nunca presentes un borrador como terminado.

## 1. Paso 1 — Inspección

1. Cargá el plugin `remotion-best-practices` si está disponible.
2. Estudiá **cómo está armado MilAños** (`src/videos/03-1000-anos/final/`, su `theme.ts` propio, `<Folder name="1000-anos">` en `Root.tsx`, `guiones/MilAños/`, `public/videos/03-1000-anos/`, `videosPrueba/MilAños/`). **Ese es el modelo de «canal nuevo» con identidad propia.** Dos diferencias a propósito: este canal **sí usa** los subtítulos compartidos de `src/canal/subtitulos/` (MilAños trae los suyos), y su marca vive en una carpeta de canal reutilizable por toda la serie (sección 2), no dentro de un video.
3. Ubicá lo compartido: `src/canal/zonaSegura.ts`, `src/canal/subtitulos/`, `src/canal/qa/prohibidas.ts`, `public/biblioteca/` (+ `catalogo.json`), y los scripts `gen-voice.mjs`, `normalize-voice.mjs`, `stills.mjs`, `qa-subtitulos.mjs`, `qa-contrast`, `qa-frame-diff.mjs`, `qa-mascara`, `qa-wave-png`, `lib/png.mjs`, `tests/`.
4. Voz: el `.env` **no está en la raíz del repo**. Preguntame dónde está antes de generar la voz. Verificá, sin mostrar valores, `ELEVENLABS_API_KEY` y `ELEVENLABS_VOICE_ID_CIBER` (voz propia del canal, distinta de Isaac; opcional `ELEVENLABS_VOICE_ID_CIBER_EN` si quiero otra voz para inglés; si no existe, se usa la misma con `eleven_multilingual_v2`). Si falta `ELEVENLABS_VOICE_ID_CIBER`, frená y pedímela: **no uses la voz de otro canal**.
5. Escribime un resumen breve del plan y de las rutas que vas a crear, y seguí.

## 2. Nombres y carpetas (primer video de la serie: **01**, no 04)

La numeración de `src/videos/01…03` es de otros canales. Esta serie numera desde 01 **dentro de su canal**:

- Marca y plantilla del canal (compartidas por todos sus episodios): `src/canales/ciberseguridad/marca/` → `theme.ts`, `anim.ts`, `chat/*`, componentes base, y la plantilla `AnatomiaEstafa.tsx`.
- Episodio: `src/canales/ciberseguridad/episodios/01-codigo-por-error/`.
- Guion: `guiones/Ciberseguridad/01-codigo-por-error/` (`guion.json` con el formato que use el repo, `fuentes.md`, `publicacion.md`, `ENTREGA.md`).
- Recursos: `public/videos/ciberseguridad/01-codigo-por-error/{voz,captions}/`; efectos de la serie en `public/videos/ciberseguridad/sfx/`. Si `public/biblioteca/` ya tiene un efecto que sirve, usalo desde ahí y anotalo.
- `Root.tsx`: `<Folder name="ciberseguridad">` con `EstafaCodigoES`, `EstafaCodigoEN` (misma composición, prop `lang`) y `EstafaCodigoHojaContactos`.
- Pruebas: `videosPrueba/Ciberseguridad/01-codigo-por-error-es-vN.mp4` y `…-en-vN.mp4`, con el siguiente N libre; QA en `videosPrueba/Ciberseguridad/qa/01-codigo-por-error/`. Nada en `out/` ni en `videosFinal/`.
- Si `CLAUDE.md` exige otra ubicación para «tipos de video nuevos», mostrámela antes de crear carpetas.

## 3. El canal (contexto para que tomes buenas decisiones)

- **Promesa:** «Estafas reales, desarmadas pieza por pieza, para que no te pase a ti ni a tu familia.»
- **Formato de la serie (firma):** cada episodio tiene 3 actos: **1) La trampa** — el espectador la vive en primera persona, en su propio teléfono; **2) La autopsia** — rebobinamos y la misma escena se vuelve evidencia, con **marcadores amarillos numerados** (como los de una escena del crimen) sobre cada señal de manipulación; **3) La defensa** — una acción concreta, de 1 paso, que se puede hacer ya. Termina con «CASO #002 →».
- **Bilingüe desde el día 1:** el mismo episodio se renderiza en español neutro (tuteo, para toda LATAM y España) y en inglés. Todos los textos viven en archivos de idioma, nunca en los componentes.
- **Pensado para sponsors de seguridad** (gestores de contraseñas, VPN, borrado de datos): seguro para marcas, sin morbo, sin gritos, sin miedo barato. Dejá preparado un espacio de patrocinio (sección 8) que hoy queda apagado.

## 4. El episodio 01

- Tema: la estafa de los 6 dígitos. Una amiga te escribe: «te mandé un código por error, ¿me lo pasas?». Es el código de registro de **tu** cuenta; si lo das, te la roban. Es universal en el mundo hispano (alertas de Guardia Civil en España; en Argentina, WhatsApp concentra el 31 % de los robos de cuenta y suplantaciones relevados por CertiSur/D'Alessio IROL en 2026).
- 1080 × 1920, 30 fps, **1.200 frames (40 s)**; puede ajustarse ±90 frames para seguir a la voz real (en cada idioma por separado).
- Un solo plano continuo, sin cortes; los cambios los hacen la cámara, el teléfono y los marcadores. El último frame es visualmente idéntico al frame 0 (loop).
- El remate encadena con el episodio 02 («Hola, cambié de número»): lo que hacen con tu cuenta robada es pedirle plata a tus contactos.

### Rigor (no negociable) — `guiones/Ciberseguridad/01-codigo-por-error/fuentes.md`

| Afirmación en el video | Fuente |
| --- | --- |
| El código de 6 dígitos registra la cuenta en otro teléfono; nunca hay que compartirlo, ni con amigos ni familia | WhatsApp, «How to recover a compromised account»: https://faq.whatsapp.com/1131652977717250 |
| Quien te roba la cuenta **no puede leer tus chats anteriores** (están en tu teléfono) | Misma página |
| Al volver a registrarte con un código nuevo, se cierran las demás sesiones | Misma página |
| Con la verificación en dos pasos activada, registrar tu número pide además tu PIN/contraseña | https://faq.whatsapp.com/1234181997583400 y https://faq.whatsapp.com/506595211487528 |
| Si el ladrón activó la verificación en dos pasos, hay que esperar 7 días | https://faq.whatsapp.com/1131652977717250 |
| Mensaje típico «te envié un código de 6 dígitos por error» | Maldita.es (16-ene-2026): https://maldita.es/malditobulo/20260116/codigo-whatsapp-digitos-sms-robo-cuenta/ ; Genbeta / Guardia Civil |

- **No digas** que «ve todos tus chats» ni que «tiene tus contactos»: es falso. Decí que puede escribir **en tus grupos y en tu nombre**.
- Etiqueta «RECREACIÓN» (EN «RECREATION») visible todo el video, arriba a la derecha dentro de la zona segura.
- Enfoque siempre defensivo: se muestra qué te pasa a vos y cómo frenarlo; **nunca** cómo ejecutar la estafa paso a paso desde el lado del estafador (nada de «primero conseguí el número…»). Esto también nos mantiene dentro de la política de contenido peligroso de YouTube.
- **Sin marcas reales en la imagen:** ni logo, ni verde ni burbujas de WhatsApp, ni bancos. La app de chat es **genérica y propia** (sección 5.4). La palabra «WhatsApp» solo aparece en la voz y en el título de publicación.
- Datos personales ficticios: número `+00 000 000 4821`, código `482 913`, contacto «Caro · vóley» (EN «Caro · volleyball»), grupo «Familia 🏠» → usá texto, no emojis del sistema (el render cambia por máquina); dibujá los íconos en SVG.

## 5. Dirección de arte — «Expediente nocturno»

Distinta de GiroDato (mesa cálida + naranja) y de MilAños (ámbar + Plex Mono). Premium, sobria, de documental de investigación. Nada de matrix verde, hackers con capucha, glitch, calaveras, candados rojos de stock ni sirenas.

### 5.1 Concepto

Un teléfono físico (objeto 2.5D, con canto, reflejo y sombra) apoyado sobre una superficie de pizarra oscura, iluminado desde arriba por una luz fría de escritorio. En la autopsia, la cámara baja, el teléfono queda «sobre la mesa de evidencia» y aparecen los **marcadores amarillos numerados** (tents de plástico triangulares en CSS 3D, con número en Space Mono 700) junto a cada mensaje. Esa es la firma visual del canal: cualquier episodio se reconoce por los marcadores.

### 5.2 Paleta (`marca/theme.ts`, ningún color fuera de ahí)

| Token | Hex | Uso |
| --- | --- | --- |
| bg | #0A0D12 | Fondo, viñeta a #000 |
| slate | #161B23 | Superficie bajo el foco |
| slateLit | #222A35 | Centro del foco |
| phoneBody | #111318 | Cuerpo del teléfono |
| screen | #0F1218 | Fondo de la app |
| bubbleIn | #1F2630 | Burbuja recibida |
| bubbleOut | #2B3A4D | Burbuja enviada |
| text | #EEF1F5 | Texto principal |
| muted | #8B95A3 | Hora, metadatos, etiquetas |
| evidence | #FFC21A | **Solo** marcadores y su línea guía |
| danger | #FF4D4D | **Solo** el momento de la pérdida (cuenta tomada) |
| safe | #3FD0C9 | **Solo** la defensa (interruptor activado, sello final) |

Regla de color: amarillo = evidencia, rojo = daño, turquesa = defensa. Nunca dos a la vez en el mismo plano salvo la transición de daño a defensa.

### 5.3 Tipografía (`@remotion/google-fonts`, cargada con `delayRender`)

- **Archivo** 800 (ancho condensado si la fuente lo permite): cabeceras y la pregunta del gancho.
- **Archivo** 400/600: interfaz de la app de chat.
- **Space Mono** 700/400: marcadores, etiquetas forenses, «RECREACIÓN», «CASO #002».
- Subtítulos: el sistema compartido del repo (sección 7). No uses Inter Tight, Instrument Serif, JetBrains Mono, IBM Plex Mono ni Barlow.

### 5.4 La app de chat genérica (`marca/chat/`)

Componentes parametrizados y reutilizables para toda la serie: `Phone`, `StatusBar`, `ChatHeader`, `Bubble` (entrada, salida, «escribiendo…», con hora y doble tilde **propia**, no la de WhatsApp), `SmsNotification`, `CodeChip` (el código con botón «Copiar»), `SettingsRow` + `Toggle`, `SystemBanner` («Tu número se registró en otro teléfono»). Radio de burbuja 26, padding 22/28, texto 40 px dentro del teléfono a escala 1 (que a 360 px de ancho se lea).

### 5.5 Materiales y luz

- Fondo: gradiente radial frío (elipse en 50 % / 30 %, slateLit → bg) + viñeta + grano `feTurbulence` (baseFrequency 0.9, `seed = frame % 30`, opacidad 0,045, overlay).
- Teléfono: cuerpo con canto de 12 px, bisel, reflejo especular diagonal al 10 % que se desplaza con la cámara, sombra `0 50px 90px rgba(0,0,0,.6)`; brillo de pantalla que ilumina levemente la superficie.
- Marcador: tent triangular 120 × 150 px, amarillo con canto más oscuro (#C99600), número negro Space Mono 700 72 px, sombra de contacto; cae con spring y deja una línea guía amarilla de 3 px hasta el mensaje que señala.
- 2.5D solo con CSS 3D (`perspective`, `rotateX/Y`, `translateZ`). Sin Three.js. Sin imágenes ni video generados por IA.

## 6. Guion y cronograma (fuente de verdad para `timeline.ts`)

Frames planificados; con la voz real, ajustá `timeline.ts` (no el audio) si un evento queda a más de 6 frames de su palabra. Columnas ES/EN: texto de voz. En pantalla, todo texto sale de `i18n/es.ts` / `i18n/en.ts`.

| Frames | Imagen | Voz ES | Voz EN |
| --- | --- | --- | --- |
| 0–20 | Plano POV: el teléfono llena la pantalla, ya compuesto (frame 0 = frame final). Llega el SMS «Tu código de registro: 482 913. No lo compartas.» | — | — |
| 20–60 | Entra el chat de «Caro · vóley»: «¡Perdón! Te mandé un código por error 🙈» · «¿Me lo pasas? Es urgente» (dos burbujas, con «escribiendo…» entre ellas) | «Una amiga te pide un código que te llegó por error.» | «A friend asks for a code she sent you by mistake.» |
| 60–110 | Cabecera grande sobre el teléfono: «¿SE LO PASAS?» con dos botones dibujados: PASAR / NO. Un dedo (círculo de toque) duda entre los dos | «¿Se lo pasas?» | «Do you send it?» |
| 110–170 | El dedo toca «Copiar», pega y envía. Burbuja de salida con «482 913». Silencio de 6 frames | — | — |
| 170–230 | `SystemBanner` en **rojo**: «Tu número se registró en otro teléfono». La pantalla se apaga a gris. Sello Space Mono «CUENTA PERDIDA» | «Si se lo pasaste, acabas de entregar tu WhatsApp.» | «If you did, you just handed over your WhatsApp.» |
| 230–270 | **Rebobinado de la serie:** la escena retrocede a velocidad (burbujas que se des-envían, el banner que se va), con un contador de tiempo hacia atrás en Space Mono. La cámara baja y el teléfono se acuesta sobre la mesa de evidencia (rotateX 0° → 52°) | «Rebobinemos.» | «Let's rewind.» |
| 270–380 | **Marcador 1** junto al SMS. A la derecha entra un segundo teléfono, frío y sin rostro, con la pantalla «Ingresa el código de 6 dígitos» y tu número. El código que te llegó **es la llave de tu cuenta** (una línea amarilla une los dos teléfonos) | «Ese código no es de ella. Es la llave de tu cuenta: alguien la está registrando en otro teléfono, ahora.» | «That code isn't hers. It's the key to your account: someone is registering it on another phone, right now.» |
| 380–480 | **Marcador 2** sobre el nombre «Caro · vóley». Grafo de contagio: Caro → tú → tus grupos (nodos que se encienden de a uno) | «¿Y por qué te escribe tu amiga? Porque a ella ya se la robaron. Así se contagia.» | «Why is your friend asking? Because hers was stolen first. That's how it spreads.» |
| 480–540 | **Marcador 3** sobre «por error» | «La excusa llega antes que la duda.» | «The excuse arrives before the doubt.» |
| 540–600 | **Marcador 4** sobre «Es urgente» | «Y la prisa no te deja pensar.» | «And the rush keeps you from thinking.» |
| 600–760 | El teléfono frío escribe en el grupo «Familia»: «Hola, ¿me prestan plata hasta mañana?». Tu historial queda borroso detrás de un vidrio esmerilado con la etiqueta «chats anteriores: no los ve» | «No puede leer tus chats viejos. No los necesita: escribe en tus grupos, con tu nombre.» | «They can't read your old chats. They don't need to: they write in your groups, as you.» |
| 760–900 | **Defensa:** la cámara sube, el teléfono vuelve a vertical. `SettingsRow` «Ajustes › Cuenta › Verificación en dos pasos»; el `Toggle` pasa a **turquesa**. Un candado de línea (dibujado, no de stock) se cierra sobre el segundo teléfono | «La defensa: un código nunca se pasa. Y activa la verificación en dos pasos: aunque te lo saquen, no les alcanza.» | «The defense: never share a code. And turn on two-step verification: even if they get it, it's not enough.» |
| 900–1010 | Ficha forense: «SI YA TE PASÓ: vuelve a entrar con un código nuevo → se cierra su sesión. Si te piden PIN: espera 7 días.» | «Si ya te pasó, vuelve a entrar con un código nuevo y lo sacas.» | «If it already happened, log back in with a new code and they're out.» |
| 1010–1110 | Cabecera: «MANDÁSELO A QUIEN DICE "YO NO CAIGO"». Abajo, en la zona de subtítulos: «CASO #002 → "Hola, cambié de número"» | «Mándaselo a quien siempre dice "yo no caigo".» | «Send this to whoever says "I'd never fall for it".» |
| 1110–1199 | La cámara vuelve al POV; los marcadores se retiran; la pantalla vuelve al estado del frame 0 | — | — |
| 1199 | Idéntico al frame 0 | | |

Notas:
- Voz y pantalla en ES usan **tuteo neutro** («pasas», «vuelve»). Si en la revisión decido pasar a voseo, se cambia solo en `i18n/es.ts`; por defecto todo va en tuteo: «¿SE LO PASAS?», «MÁNDASELO…», «VUELVE A ENTRAR…». Dejá un único archivo `i18n/es.ts` para que cambiar el registro sea trivial.
- Números en el texto enviado a la API escritos en palabras («cuatro ocho dos, nueve uno tres» si se lee el código; por defecto **no se lee**).
- La pregunta del gancho tiene que verse a f60 como muy tarde; los primeros 2 s son lo más importante del video.

## 7. Subtítulos

- Usá el sistema compartido `src/canal/subtitulos/` tal como quedó (centro 540, ancho ≤ 720, carril fijo con base en y 1500, paginación por frase, palabra activa sin color). Si necesitás fuente o color de énfasis propios del canal, agregalos como props con defaults que no cambien GiroDato ni MilAños.
- Énfasis (máx. 1 por página, color `evidence`): ES `código`, `llave`, `contagia`, `excusa`, `prisa`, `dos pasos`; EN `code`, `key`, `spreads`, `excuse`, `rush`, `two-step`.
- **Ocultos** en f0–110 (el gancho ya está escrito en pantalla) y en f1010–1199. Nunca encima del teléfono ni de un marcador: si chocan, se corrige el layout, no el subtítulo (regla del repo).

## 8. Espacio de patrocinio (preparado, apagado)

- Componente `marca/SponsorSlot.tsx` con props zod `sponsor: { nombre: string; claim: string; activo: boolean }`, default `activo: false`.
- Cuando está activo, ocupa f900–960 con una tarjeta discreta «Este caso te lo trae {nombre} · {claim}» y la etiqueta «PUBLICIDAD» / «AD», sin tapar subtítulos; la ficha «SI YA TE PASÓ» se corre 60 frames. Cuando está apagado, el video es idéntico a no tenerlo.
- No inventes sponsors: en las pruebas usá `nombre: "Marca de prueba"`, y solo en un still de muestra.

## 9. Audio

### Voz (ElevenLabs)

- Reutilizá `scripts/gen-voice.mjs` tal como se usa en el repo: `node --env-file=<ruta del .env> scripts/gen-voice.mjs --lines <json> --out public/videos/ciberseguridad/01-codigo-por-error/voz/<es|en> --budget <n>`, y después `normalize-voice.mjs --drive 6`. Para que use la voz del canal sin tocar a los demás, agregale una opción `--voice-env <NOMBRE_VAR>` con default `ELEVENLABS_VOICE_ID` (así GiroDato sigue igual) y pasá `--voice-env ELEVENLABS_VOICE_ID_CIBER`. Mostrame ese diff antes de usarlo.
- `eleven_multilingual_v2`, velocidad 1,0, una petición por bloque de voz, con `previous_text` / `next_text`. Tono: calmo, cercano, de investigador, nunca alarmista; si suena dramático, bajá `style`.
- **Presupuesto: 3.000 caracteres en total** (los dos idiomas). Contá antes de cada petición. Ante 401, 402, 403 o 429, frená y avisame.
- No podés escuchar: verificá con la alineación que estén todas las palabras, en orden, y sin silencios de más de 0,8 s dentro de un bloque. En el informe, pedime que escuche «código», «verificación», «contagia» (ES) y «two-step», «rewind» (EN).

### Efectos (sintetizados por código, sin licencias)

Script nuevo `scripts/gen-sfx-ciberseguridad.mjs` (mismo enfoque que los `gen-sfx-*` existentes, semilla fija, WAV 48 kHz mono 16 bits) → `public/videos/ciberseguridad/sfx/` (compartido por la serie). Verificá cada forma de onda con `qa-wave-png`:

| Archivo | Uso | Receta | Volumen |
| --- | --- | --- | --- |
| notif.wav | SMS f0 y burbujas | Dos senos 1.320/1.760 Hz, 70 ms, caída rápida | 0,30 |
| typing.wav | «escribiendo…» | Clics suaves irregulares, 0,6 s | 0,15 |
| tap.wav | toque del dedo | Clic seco 8 ms | 0,30 |
| send.wav | envío f160 | Barrido de ruido 600 Hz → 3 kHz, 180 ms | 0,25 |
| alert.wav | cuenta perdida f170 | Seno 140 Hz modulado + clic, 400 ms | 0,35 |
| rewind.wav | rebobinado f230 | Ruido filtrado con barrido descendente + tren de clics que desacelera, 1,2 s | 0,25 |
| marker.wav | cada marcador | Golpe de plástico sobre mesa: seno 220 Hz + ruido corto, 90 ms | 0,35 |
| link.wav | línea que une teléfonos | Seno 880 Hz con glissando, 300 ms | 0,15 |
| spread.wav | nodos del grafo | Pops de 600–1.200 Hz | 0,15 |
| toggle.wav | interruptor f800 | Dos clics 20 ms | 0,35 |
| lock.wav | candado | Clic metálico grave | 0,35 |
| room.wav | todo el video | Ruido rosa pasabajos 350 Hz, loop exacto de la duración | 0,04 |

Fades de 2–5 ms en extremos; verificá cada uno con su forma de onda en PNG. Sin música. Mezcla: voz al frente, ≈ −14 LUFS integrados, pico real ≤ −1 dBTP, medido en cada MP4.

## 10. Cámara y curvas

- Cámara = contenedor con `perspective: 1800px`, origen en el centro del teléfono.
- Keyframes (`Easing.bezier(0.45, 0, 0.2, 1)`, clamp):

| Frames | Escala | rotateX del teléfono | Nota |
| --- | --- | --- | --- |
| 0 → 110 | 1,00 → 1,03 | 0° | POV, acercamiento leve durante el gancho |
| 170 → 200 | → 1,06 | 0° | Empuje en la pérdida |
| 230 → 270 | → 0,82 | → 52° | Rebobinado: el teléfono se acuesta en la mesa |
| 270 → 600 | 0,82 → 0,86 | 52° | Autopsia; la cámara se desplaza hacia cada marcador (x ±60) |
| 760 → 800 | → 0,96 | → 0° | Defensa: vuelve a vertical |
| 1110 → 1199 | → valores del frame 0 | 0° | Loop |

- Deriva sumada: x = 3·sin(2π·f/150), y = 2·sin(2π·f/240) (ambos dividen 1.200; si cambiás la duración, elegí períodos que la dividan).
- Marcadores: `spring({damping: 14, stiffness: 140, mass: 0.8})`. Burbujas: entran 8 frames, sube 18 px + opacidad, `Easing.out(Easing.cubic)`. Reacomodos: `spring({damping: 200})`. Salidas: `Easing.in(Easing.cubic)`, 10–15 frames. Nada lineal salvo el rebobinado.

## 11. Código

```
src/canales/ciberseguridad/
  marca/
    theme.ts · anim.ts · canal.ts (CHANNEL_NAME)
    AnatomiaEstafa.tsx    plantilla: Backdrop → Camera(mesa + teléfonos + marcadores) → Overlays → Subtítulos → Audio
    chat/*  EvidenceMarker.tsx  ForensicCard.tsx  ContagionGraph.tsx  RewindFx.tsx  SponsorSlot.tsx  RecreationTag.tsx
  episodios/01-codigo-por-error/
    index.tsx             composición: AnatomiaEstafa + datos del episodio
    timeline.ts           todos los frames de la sección 6 con nombre
    escena.ts             mensajes, marcadores (n.º, objetivo, frame), grafo, defensa
    i18n/es.ts · i18n/en.ts
scripts/gen-sfx-ciberseguridad.mjs
```

- Animación solo con `useCurrentFrame()`, `interpolate()` (clamp en los dos extremos), `spring()` y `<Sequence>`. Prohibido `transition`, `@keyframes`, `requestAnimationFrame`, `Date`, `Math.random()` (usá `random('semilla')`).
- **Plantilla de serie:** `AnatomiaEstafa.tsx` no sabe de códigos de 6 dígitos; lee todo de `escena.ts` + `i18n`. El episodio 02 tiene que poder hacerse creando solo esa carpeta de datos y, como mucho, un componente nuevo.
- Props zod: `lang: 'es' | 'en'`, `showSafeZones` (false), `capa: 'todo' | 'subtitulos' | 'escena'` (para el QA del repo), `sponsor` (sección 8).
- TypeScript estricto, sin `any`. Ningún frame mágico fuera de `timeline.ts`, ningún color ni fuente fuera de `marca/theme.ts`, ningún texto visible fuera de `i18n/`.
- Agregá a `src/canal/qa/prohibidas.ts` (sin quitar nada): `WhatsApp` **solo como texto visible en pantalla** (en la voz sí va), y nombres de bancos o billeteras reales que se te ocurra que podrían colarse. Si el QA de prohibidas no distingue pantalla de voz, avisame antes de cambiarlo.

## 12. Vista previa

- Studio sin errores ni advertencias, en los dos idiomas.
- Stills con `scripts/stills.mjs`, con y sin zonas seguras, en ES y EN: 0, 45, 90, 150, 200, 250, 320, 420, 510, 570, 680, 820, 950, 1060, 1150, 1199. Hoja de contactos por idioma.
- **Mirá cada imagen** (no alcanza con generarla). Prestá atención a que el chat se lea a 360 px de ancho y a que el texto en inglés no desborde las burbujas.

## 13. Control de calidad

| Prueba | Criterio |
| --- | --- |
| Gancho | La pregunta «¿SE LO PASAS?» legible antes de f60; algo se mueve o aparece en cada uno de los primeros 30 frames |
| Storyboard | Cada evento de la sección 6 en su frame (±2), ajustado a la voz real |
| Subtítulos | `npm run qa:subs -- EstafaCodigoES` y `…EN` con **0 fallas** |
| Zona segura | Ningún texto fuera de la zona de `src/canal/zonaSegura.ts`, incluida la cámara a 1,06 |
| Legibilidad | A 360 px de ancho se leen burbujas, código, marcadores y cabeceras; ningún texto menor a 24 px en el lienzo |
| Contraste | Texto/fondo ≥ 4,5:1 calculado (incluido negro sobre amarillo del marcador y texto sobre burbujas) |
| Rigor | Cada frase de la voz tiene su fila en `fuentes.md`; no aparece «ve tus chats» ni «tiene tus contactos»; «RECREACIÓN» visible siempre |
| Marcas | Ningún logo, color de marca ni UI reconocible de WhatsApp o bancos (compará un still con una captura real de WhatsApp y describime las diferencias) |
| Idiomas | ES y EN renderizan sin textos cruzados ni desbordes; los dos pasan todas las pruebas |
| Otros canales intactos | Frames de control de GiroDato y MilAños idénticos antes y después (`qa-frame-diff.mjs`) |
| Loop | Frame final vs frame 0: diferencia mínima (script) |
| Sponsor | Con `activo: false`, el render es idéntico a no tener el componente |
| Audio | Sin clipping; loudness según la sección 9; efectos en su frame (±1) |
| Render | H.264, 1080 × 1920, 30 fps, duración según la voz, `--gl=angle`, verificado con `npx remotion ffprobe` |

## 14. Entregables extra

- `guiones/Ciberseguridad/README.md` (serie «Anatomía de una estafa»): la promesa, los 3 actos, la regla de color, el formato de los marcadores y cómo crear el episodio 02 (qué archivos copiar).
- `guiones/Ciberseguridad/01-codigo-por-error/publicacion.md` (no publiques nada vos):
  - Título ES: «Te piden un código "por error". No lo pases. #shorts» · EN: «"Sorry, I sent you a code by mistake" — don't send it #shorts»
  - Descripción ES: «Recreación. Así te roban el WhatsApp con un código de 6 dígitos y cómo evitarlo: nunca compartas códigos y activa la verificación en dos pasos (Ajustes › Cuenta). Fuentes en el comentario fijado.» (+ versión EN)
  - Comentario fijado: los enlaces de `fuentes.md` + «¿A quién le mandarías esto?».
  - Recordatorio: marcar «contenido alterado o sintético» al subir (voz IA) y no activar el doblaje automático de YouTube (ya tenemos las dos versiones).
- Una línea por cada idea de episodio que se te ocurra reutilizando la plantilla (no las produzcas).

## 15. Informe final

1. Rutas de los MP4 (ES y EN), hojas de contactos y `reporte.md` del QA de subtítulos.
2. Estado: **terminado** o **borrador** (y por qué).
3. Tabla de la sección 13 con resultado por prueba y por idioma.
4. Qué reutilizaste del repo y qué componentes nuevos creaste.
5. Desvíos respecto de este documento y su motivo.
6. Voz: ids, modelo, ajustes finales, bloques regenerados y caracteres de ElevenLabs consumidos.
7. Qué tengo que escuchar y mirar yo.
8. Paquetes instalados (si te autoricé alguno).
9. Al cerrar: actualizá `guiones/APRENDIZAJES.md` (sección Ciberseguridad) y el índice de `guiones/README.md`, como pide el repo.
