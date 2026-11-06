// Episodio 01 · «Te mandé un código por error» — todos los frames con nombre (prompt § 6 y § 10).
// Dos relojes: `video` (frame real) y `escena` (lo que muestra la pantalla; el rebobinado la hace retroceder).
// Con la voz real se ajusta ESTE archivo (VOZ_AT y los eventos), nunca el audio.
// Con patrocinio activo, todo lo que va desde la ficha en adelante se corre SPONSOR_EXTRA frames.

export const FPS = 30;
export const DURACION_BASE = 1200;
export const SPONSOR_EXTRA = 60;
/** a partir de acá se corre todo cuando hay patrocinio */
const CORTE_SPONSOR = 900;

export const crearTimeline = (conSponsor: boolean) => {
  const S = conSponsor ? SPONSOR_EXTRA : 0;
  const d = (f: number) => (f >= CORTE_SPONSOR ? f + S : f);
  const DURACION = DURACION_BASE + S;
  const ULTIMO = DURACION - 1;
  return {
    DURACION,
    ULTIMO,
    S,
    // ── tiempo de ESCENA (pantalla del teléfono) ──
    escena: {
      SMS: -10, // ya compuesto en el frame 0
      B1_ESCRIBE: 10,
      B1: 22,
      B2_ESCRIBE: 32,
      B2: 50,
      COPIAR: 124,
      PEGADO: 140,
      ENVIADO: 160,
      PERDIDA: 170,
      /** estado que queda congelado durante la autopsia (antes de enviar el código) */
      AUTOPSIA: 100,
    },
    // ── tiempo de VIDEO ──
    GANCHO_ELEGIDA: 104,
    GANCHO_SALE: 104,
    GANCHO_VUELVE: 1150 + S,
    DEDO_DESDE: 64,
    DEDO_HASTA: 172,
    DEDO: {
      ENTRA: 64,
      NO: 78,
      DUDA: 92,
      PASAR: 100,
      COPIAR: 120,
      CAMPO: 133,
      ENVIAR: 152,
    },
    TOQUES: { COPIAR: 124, PASAR: 104, PEGAR: 137, ENVIAR: 158 },
    PERDIDA: 170,
    PERDIDA_HASTA: 230,
    REBOBINADO: 230,
    REBOBINADO_HASTA: 270,
    MARCADOR_1: 280,
    SEGUNDO_ENTRA: 290,
    ENLACE: 300,
    CODIGO_ENTRA: 322,
    MARCADOR_2: 385,
    GRAFO: 398,
    GRAFO_NODOS: [405, 425, 445, 460] as const,
    MARCADOR_3: 488,
    MARCADOR_4: 548,
    GRAFO_HASTA: 600,
    VIDRIO: 610,
    GRUPO_MENSAJE: 640,
    VIDRIO_HASTA: 760,
    ENLACE_HASTA: 600,
    DEFENSA: 760,
    TOGGLE: 840,
    CANDADO: 865,
    SEGUNDO_SALE: d(1000),
    SPONSOR: CORTE_SPONSOR,
    SPONSOR_HASTA: CORTE_SPONSOR + SPONSOR_EXTRA,
    FICHA: d(900),
    FICHA_HASTA: d(1010),
    CIERRE: d(1010),
    CIERRE_HASTA: d(1110),
    /** los marcadores se levantan cuando la cámara sube a la defensa (vista cenital: de canto no se leen) */
    MARCADORES_SALEN: 760,
    VUELTA: d(1110),
    VUELTA_LISTA: d(1170),
    DEFENSA_HASTA: d(1110),
    SUBS_DESDE: 110,
    SUBS_HASTA: d(1010),
    /** inicio de cada bloque de voz (planificado; se ajusta a la voz real) */
    VOZ_AT: {
      v01: 20,
      v02: 62,
      v03: 172,
      v04: 232,
      v05: 272,
      v06: 382,
      v07: 482,
      v08: 542,
      v09: 602,
      v10: 762,
      v11: d(902),
      v12: d(1012),
    },
    // ── cámara (§ 10): escala, inclinación de la mesa, desplazamientos ──
    CAM_ESCALA: [
      { f: 0, v: 1 },
      { f: 110, v: 1.03 },
      { f: 170, v: 1.03 },
      { f: 200, v: 1.06 },
      { f: 230, v: 1.06 },
      { f: 270, v: 0.82 },
      { f: 600, v: 0.86 },
      { f: 760, v: 0.86 },
      { f: 800, v: 0.96 },
      { f: d(1110), v: 0.96 },
      { f: ULTIMO, v: 1 },
    ],
    CAM_INCLINACION: [
      { f: 0, v: 0 },
      { f: 230, v: 0 },
      { f: 270, v: 52 },
      { f: 760, v: 52 },
      { f: 800, v: 0 },
    ],
    CAM_X: [
      { f: 0, v: 0 },
      { f: 270, v: 0 },
      { f: 290, v: 40 },
      { f: 330, v: -30 },
      { f: 395, v: 45 },
      { f: 470, v: 10 },
      { f: 495, v: 50 },
      { f: 555, v: 50 },
      { f: 600, v: 0 },
    ],
    CAM_Y: [
      { f: 0, v: 0 },
      { f: 160, v: 0 },
      { f: 190, v: -60 },
      { f: 230, v: -60 },
      { f: 270, v: 40 },
      { f: 760, v: 40 },
      { f: 800, v: 0 },
    ],
    TELEFONO_X: [
      { f: 0, v: 540 },
      { f: 230, v: 540 },
      { f: 270, v: 530 },
      { f: 760, v: 530 },
      { f: 800, v: 450 },
      { f: d(1110), v: 450 },
      { f: ULTIMO, v: 540 },
    ],
    /** deriva: los períodos dividen la duración base (1.200) */
    DERIVA: { ax: 3, px: 150, ay: 2, py: 240 },
  };
};

export type Timeline = ReturnType<typeof crearTimeline>;

/** tiempo de escena: avanza con el video, retrocede en el rebobinado, queda congelado en la autopsia y vuelve a 0 para el loop */
export const tiempoEscena = (T: Timeline) => (f: number) => {
  if (f < T.REBOBINADO) return f;
  if (f < T.REBOBINADO_HASTA) return T.REBOBINADO - ((f - T.REBOBINADO) * (T.REBOBINADO - T.escena.AUTOPSIA)) / (T.REBOBINADO_HASTA - T.REBOBINADO);
  if (f < T.VUELTA) return T.escena.AUTOPSIA;
  if (f < T.VUELTA_LISTA) return T.escena.AUTOPSIA * (1 - (f - T.VUELTA) / (T.VUELTA_LISTA - T.VUELTA));
  return 0;
};
