// Episodio 01 · datos de la escena: mensajes, marcadores (n.º, objetivo, frame), grafo, defensa, sonido.
// Junta timeline + i18n y devuelve el `Episodio` que dibuja la plantilla AnatomiaEstafa.
import { interpolate } from "remotion";
import { CLAMP, IN_CUBIC, OUT_CUBIC } from "../../marca/anim";
import { posicionOpcion } from "../../marca/Gancho";
import type { BloqueVoz, CueSfx, Episodio, Lang } from "../../marca/tipos";
import { EN } from "./i18n/en";
import { ES } from "./i18n/es";
import type { Textos } from "./i18n/tipos";
import { type BloqueMedido, VOZ_IDS, type VozId, crearTimeline, tiempoEscena } from "./timeline";
import { VOZ_REAL } from "./vozReal";

export const TEXTOS: Record<Lang, Textos> = { es: ES, en: EN };
export const CARPETA_PUBLIC = "videos/ciberseguridad/01-codigo-por-error";
const SFX = (n: string) => `videos/ciberseguridad/sfx/${n}.wav`;

/** puntos de toque en pantalla (cámara del gancho ≈ 1,03): botón Copiar, campo de texto, enviar */
const PANTALLA = { copiar: { x: 602, y: 621 }, campo: { x: 516, y: 1243 }, enviar: { x: 768, y: 1243 } } as const;

/** duración de cada bloque y sus palabras, de la voz real del idioma */
const medidas = (lang: Lang): Record<VozId, BloqueMedido> =>
  Object.fromEntries(
    VOZ_IDS.map((id) => {
      const v = VOZ_REAL[lang][id];
      if (!v) throw new Error(`Falta la voz ${lang}/${id}: correr scripts/voz-ciberseguridad.mjs`);
      return [id, { duracion: v.duracion, palabras: v.palabras }];
    }),
  ) as Record<VozId, BloqueMedido>;

export const timelineDe = (lang: Lang, conSponsor: boolean) => crearTimeline(medidas(lang), conSponsor);

export const crearEpisodio = (lang: Lang, sponsor: { nombre: string; claim: string; activo: boolean }): Episodio => {
  const T = timelineDe(lang, sponsor.activo);
  const X = TEXTOS[lang];
  const E = T.escena;
  const pasar = posicionOpcion(0);
  const no = posicionOpcion(1);
  const medio = { x: (pasar.x + no.x) / 2, y: pasar.y + 6 };

  const voz: BloqueVoz[] = (Object.keys(X.voz) as (keyof Textos["voz"])[]).map((id) => {
    const real = VOZ_REAL[lang][id];
    return {
      id,
      f: T.VOZ_AT[id as VozId],
      dicho: X.voz[id].dicho,
      escrito: X.voz[id].escrito ?? X.voz[id].dicho,
      palabras: real?.palabras ?? null,
      audio: real?.audio ?? null,
      duracion: real?.duracion ?? null,
    };
  });

  const sfx: CueSfx[] = [
    { id: "sms", f: 0, archivo: SFX("notif"), volumen: 0.3, dur: 6 },
    { id: "typing-1", f: E.B1_ESCRIBE, archivo: SFX("typing"), volumen: 0.15, dur: 18 },
    { id: "b1", f: E.B1, archivo: SFX("notif"), volumen: 0.3, dur: 6 },
    { id: "typing-2", f: E.B2_ESCRIBE, archivo: SFX("typing"), volumen: 0.15, dur: 18 },
    { id: "b2", f: E.B2, archivo: SFX("notif"), volumen: 0.3, dur: 6 },
    ...Object.entries(T.TOQUES).map(([k, f]) => ({ id: `tap-${k}`, f, archivo: SFX("tap"), volumen: 0.3, dur: 3 })),
    { id: "send", f: E.ENVIADO, archivo: SFX("send"), volumen: 0.25, dur: 8 },
    { id: "alert", f: T.PERDIDA, archivo: SFX("alert"), volumen: 0.35, dur: 14 },
    { id: "rewind", f: T.REBOBINADO, archivo: SFX("rewind"), volumen: 0.25, dur: 38 },
    ...[T.MARCADOR_1, T.MARCADOR_2, T.MARCADOR_3, T.MARCADOR_4].map((f, i) => ({ id: `marker-${i + 1}`, f: f + 9, archivo: SFX("marker"), volumen: 0.35, dur: 4 })),
    { id: "link", f: T.ENLACE, archivo: SFX("link"), volumen: 0.15, dur: 10 },
    ...T.GRAFO_NODOS.map((f, i) => ({ id: `spread-${i}`, f, archivo: SFX("spread"), volumen: 0.15, dur: 4 })),
    { id: "toggle", f: T.TOGGLE, archivo: SFX("toggle"), volumen: 0.35, dur: 3 },
    { id: "lock", f: T.CANDADO, archivo: SFX("lock"), volumen: 0.35, dur: 6 },
  ];

  return {
    lang,
    duracion: T.DURACION,
    caso: { numero: X.caso, siguiente: X.siguiente, siguienteTitulo: X.cierre.siguiente },
    etiquetas: { recreacion: X.recreacion, rebobinando: X.rebobinando },
    escena: tiempoEscena(T),
    camara: { escala: T.CAM_ESCALA, inclinacion: T.CAM_INCLINACION, x: T.CAM_X, y: T.CAM_Y },
    deriva: T.DERIVA,
    telefonoX: T.TELEFONO_X,
    gancho: {
      pregunta: X.gancho.pregunta,
      opciones: X.gancho.opciones,
      visible: (f) => Math.min(interpolate(f, [T.GANCHO_SALE, T.GANCHO_SALE + 12], [1, 0], { ...CLAMP, easing: IN_CUBIC }) + interpolate(f, [T.GANCHO_VUELVE, T.GANCHO_VUELVE + 16], [0, 1], { ...CLAMP, easing: OUT_CUBIC }), 1),
      elegida: { f: T.GANCHO_ELEGIDA, indice: 0 },
    },
    telefono: {
      hora: X.telefono.hora,
      contacto: X.telefono.contacto,
      estado: X.telefono.estado,
      inicial: X.telefono.inicial,
      notificacion: { app: X.notificacion.app, cuando: X.notificacion.cuando, texto: `[${X.notificacion.texto}]`, codigo: { valor: X.notificacion.codigo, copiar: X.notificacion.copiar, copiado: X.notificacion.copiado }, pie: X.notificacion.pie, f: E.SMS },
      mensajes: [
        { id: "b1", de: "ellos", texto: X.mensajes.b1, hora: X.mensajes.horas[0], f: E.B1, escribiendo: E.B1_ESCRIBE },
        { id: "b2", de: "ellos", texto: X.mensajes.b2, hora: X.mensajes.horas[1], f: E.B2, escribiendo: E.B2_ESCRIBE },
        { id: "enviado", de: "yo", texto: X.mensajes.enviado, hora: X.mensajes.horas[2], f: E.ENVIADO },
      ],
      entrada: { placeholder: X.telefono.placeholder, pegado: X.mensajes.enviado, fPegado: E.PEGADO, fEnviado: E.ENVIADO },
      // el primero es «Copiar» (la plantilla hunde ese botón)
      toques: [
        { f: T.TOQUES.COPIAR, ...PANTALLA.copiar },
        { f: T.TOQUES.PASAR, ...pasar },
        { f: T.TOQUES.PEGAR, ...PANTALLA.campo },
        { f: T.TOQUES.ENVIAR, ...PANTALLA.enviar },
      ],
      dedo: {
        desde: T.DEDO_DESDE,
        hasta: T.DEDO_HASTA,
        ruta: [
          { f: T.DEDO.ENTRA, ...medio },
          { f: T.DEDO.NO, ...no },
          { f: T.DEDO.DUDA, ...medio },
          { f: T.DEDO.PASAR, ...pasar },
          { f: T.DEDO.COPIAR, ...PANTALLA.copiar },
          { f: T.DEDO.CAMPO, ...PANTALLA.campo },
          { f: T.DEDO.ENVIAR, ...PANTALLA.enviar },
        ],
      },
    },
    perdida: { f: E.PERDIDA, hasta: T.PERDIDA_HASTA, banner: X.perdida.banner, sello: X.perdida.sello },
    rebobinado: { f: T.REBOBINADO, hasta: T.REBOBINADO_HASTA, desde: X.rebobinando, a: "" },
    marcadores: [
      { n: 1, objetivo: "notificacion", f: T.MARCADOR_1 },
      { n: 2, objetivo: "cabecera", f: T.MARCADOR_2 },
      { n: 3, objetivo: "b1", f: T.MARCADOR_3, frase: 0 },
      { n: 4, objetivo: "b2", f: T.MARCADOR_4, frase: 0 },
    ],
    marcadoresSalen: T.MARCADORES_SALEN,
    segundoTelefono: {
      entra: T.SEGUNDO_ENTRA,
      sale: T.SEGUNDO_SALE,
      titulo: X.segundo.titulo,
      numero: X.segundo.numero,
      codigo: X.notificacion.codigo,
      fCodigo: T.CODIGO_ENTRA,
      grupo: { f: T.GRUPO_MENSAJE, nombre: X.segundo.grupo, mensaje: X.segundo.mensaje, autor: X.segundo.autor, hora: X.segundo.hora },
      candado: T.CANDADO,
      posicion: [
        { f: T.SEGUNDO_ENTRA, x: 800, y: 580, s: 1 },
        { f: T.DEFENSA, x: 800, y: 580, s: 1 },
        { f: T.DEFENSA + 40, x: 800, y: 470, s: 0.66 },
      ],
    },
    enlace: { f: T.ENLACE, hasta: T.ENLACE_HASTA, etiqueta: "" },
    grafo: {
      f: T.GRAFO,
      hasta: T.GRAFO_HASTA,
      titulo: X.grafo.titulo,
      nodos: [
        { id: "caro", etiqueta: X.grafo.caro, x: 150, y: 430, f: T.GRAFO_NODOS[0], icono: "persona" },
        { id: "tu", etiqueta: X.grafo.tu, x: 350, y: 430, f: T.GRAFO_NODOS[1], icono: "persona" },
        { id: "familia", etiqueta: X.grafo.familia, x: 560, y: 340, f: T.GRAFO_NODOS[2], icono: "grupo" },
        { id: "voley", etiqueta: X.grafo.voley, x: 560, y: 520, f: T.GRAFO_NODOS[3], icono: "grupo" },
      ],
      aristas: [
        ["caro", "tu"],
        ["tu", "familia"],
        ["tu", "voley"],
      ],
    },
    vidrio: { f: T.VIDRIO, hasta: T.VIDRIO_HASTA, etiqueta: X.vidrio },
    defensa: { f: T.DEFENSA, hasta: T.DEFENSA_HASTA, titulo: X.defensa.titulo, ruta: X.defensa.ruta, ajuste: X.defensa.ajuste, detalle: X.defensa.detalle, fToggle: T.TOGGLE },
    ficha: { f: T.FICHA, hasta: T.FICHA_HASTA, titulo: X.ficha.titulo, lineas: X.ficha.lineas },
    cierre: { f: T.CIERRE, hasta: T.CIERRE_HASTA, cabecera: X.cierre.cabecera, siguiente: X.cierre.siguiente },
    voz,
    subtitulos: { enfasis: X.enfasis, remates: X.remates, visible: (f) => f >= T.SUBS_DESDE && f < T.SUBS_HASTA },
    sfx,
    ambiente: { archivo: SFX("room"), volumen: 0.04 },
    // −3 dB: con la voz a 1,0 la mezcla medía −11,2 LUFS (ES v3); así queda cerca de −14
    vozVolumen: 0.71,
    sponsor: { ...sponsor, f: T.SPONSOR, hasta: T.SPONSOR_HASTA, plantilla: X.sponsor.plantilla, etiqueta: X.sponsor.etiqueta },
  };
};

