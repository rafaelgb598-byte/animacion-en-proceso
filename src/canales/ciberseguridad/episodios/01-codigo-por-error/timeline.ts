// Episodio 01 · «Te mandé un código por error» — todos los frames con nombre (prompt § 6 y § 10).
// La imagen sigue a la voz REAL de cada idioma: cada bloque empieza cuando termina el anterior (más una pausa),
// y cada evento se cuelga de la palabra que lo nombra («llave», «registrando», «contagia», «activa»…).
// Dos relojes: `video` (frame real) y `escena` (lo que muestra la pantalla; el rebobinado la hace retroceder).
// Con patrocinio activo, todo lo que va desde la ficha en adelante se corre SPONSOR_EXTRA frames.
import type { Palabra } from "../../../../canal/subtitulos/tipos";

export const FPS = 30;
export const SPONSOR_EXTRA = 60;
export const VOZ_IDS = ["v01", "v02", "v03", "v04", "v05", "v06", "v07", "v08", "v09", "v10", "v11", "v12"] as const;
export type VozId = (typeof VOZ_IDS)[number];
export type BloqueMedido = { duracion: number; palabras: Palabra[] };

const fr = (s: number) => Math.round(s * FPS);
const clave = (t: string) => t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9ñ-]/g, "");

export const crearTimeline = (voz: Record<VozId, BloqueMedido>, conSponsor: boolean) => {
  const dur = (id: VozId) => fr(voz[id].duracion);
  const V = {} as Record<VozId, number>;
  /** frame (de video) de la primera palabra del bloque que coincide con alguna de las claves (ES o EN) */
  const en = (id: VozId, claves: string[]) => {
    const w = voz[id].palabras.find((p) => claves.includes(clave(p.t)));
    if (!w) throw new Error(`${id}: no encuentro ninguna de [${claves.join(", ")}] en la voz`);
    return V[id] + fr(w.s);
  };

  // ── acto 1: la trampa ──
  V.v01 = 10;
  V.v02 = V.v01 + dur("v01") + 4;
  const GANCHO_SALE = V.v02 + dur("v02") + 4;
  const TOQUES = { PASAR: GANCHO_SALE, COPIAR: GANCHO_SALE + 16, PEGAR: GANCHO_SALE + 27, ENVIAR: GANCHO_SALE + 42 };
  const DEDO_ENTRA = V.v02 - 20;
  const PERDIDA = GANCHO_SALE + 50;
  V.v03 = PERDIDA + 2;
  const REBOBINADO = Math.max(V.v03 + dur("v03") + 6, PERDIDA + 50);
  V.v04 = REBOBINADO + 2;
  const REBOBINADO_HASTA = Math.max(REBOBINADO + 40, V.v04 + dur("v04") + 2);

  // ── acto 2: la autopsia ──
  V.v05 = REBOBINADO_HASTA + 2;
  const MARCADOR_1 = V.v05 + 6;
  const ENLACE = en("v05", ["llave", "key"]);
  const SEGUNDO_ENTRA = ENLACE - 14;
  const CODIGO_ENTRA = en("v05", ["registrando", "registering"]);
  V.v06 = V.v05 + dur("v05") + 4;
  const MARCADOR_2 = en("v06", ["amiga", "friend"]) - 4;
  const GRAFO = en("v06", ["porque", "because"]) - 8;
  const GRAFO_NODOS = [GRAFO + 6, en("v06", ["robaron", "stolen"]), en("v06", ["contagia", "spreads"]), en("v06", ["contagia", "spreads"]) + 13] as const;
  V.v07 = V.v06 + dur("v06") + 4;
  const MARCADOR_3 = en("v07", ["excusa", "excuse"]) - 2;
  V.v08 = V.v07 + dur("v07") + 4;
  const MARCADOR_4 = en("v08", ["prisa", "rush"]) - 2;
  V.v09 = V.v08 + dur("v08") + 6;
  const VIDRIO = V.v09 + 4;
  const GRUPO_MENSAJE = en("v09", ["escribe", "write"]);

  // ── acto 3: la defensa ──
  const DEFENSA = V.v09 + dur("v09") + 4;
  V.v10 = DEFENSA + 2;
  const TOGGLE = en("v10", ["activa", "turn"]);
  const CANDADO = en("v10", ["alcanza", "enough"]);
  const S = conSponsor ? SPONSOR_EXTRA : 0;
  const SPONSOR = V.v10 + dur("v10") + 4;
  const FICHA = SPONSOR + S;
  V.v11 = FICHA + 4;
  const FICHA_HASTA = V.v11 + dur("v11") + 12;
  const CIERRE = FICHA_HASTA;
  V.v12 = CIERRE + 6;
  const CIERRE_HASTA = V.v12 + dur("v12") + 16;
  const VUELTA = CIERRE_HASTA;
  const DURACION = VUELTA + 72;
  const ULTIMO = DURACION - 1;

  return {
    DURACION,
    ULTIMO,
    S,
    // ── tiempo de ESCENA (pantalla del teléfono; hasta el rebobinado coincide con el video) ──
    escena: {
      SMS: -10, // ya compuesto en el frame 0
      B1_ESCRIBE: 10,
      B1: 22,
      B2_ESCRIBE: 32,
      B2: 50,
      COPIAR: TOQUES.COPIAR,
      PEGADO: TOQUES.PEGAR + 3,
      ENVIADO: TOQUES.ENVIAR + 2,
      PERDIDA,
      /** estado que queda congelado durante la autopsia (antes de copiar el código) */
      AUTOPSIA: 100,
    },
    // ── tiempo de VIDEO ──
    GANCHO_ELEGIDA: TOQUES.PASAR,
    GANCHO_SALE,
    GANCHO_VUELVE: VUELTA + 30,
    DEDO_DESDE: DEDO_ENTRA,
    DEDO_HASTA: GANCHO_SALE + 54,
    DEDO: { ENTRA: DEDO_ENTRA, NO: DEDO_ENTRA + 14, DUDA: DEDO_ENTRA + 28, PASAR: GANCHO_SALE - 4, COPIAR: GANCHO_SALE + 12, CAMPO: GANCHO_SALE + 23, ENVIAR: GANCHO_SALE + 37 },
    TOQUES,
    PERDIDA,
    PERDIDA_HASTA: REBOBINADO,
    REBOBINADO,
    REBOBINADO_HASTA,
    MARCADOR_1,
    SEGUNDO_ENTRA,
    ENLACE,
    CODIGO_ENTRA,
    MARCADOR_2,
    GRAFO,
    GRAFO_NODOS,
    MARCADOR_3,
    MARCADOR_4,
    GRAFO_HASTA: V.v09,
    VIDRIO,
    GRUPO_MENSAJE,
    VIDRIO_HASTA: DEFENSA,
    ENLACE_HASTA: V.v09,
    DEFENSA,
    TOGGLE,
    CANDADO,
    SEGUNDO_SALE: CIERRE - 14,
    SPONSOR,
    SPONSOR_HASTA: SPONSOR + SPONSOR_EXTRA,
    FICHA,
    FICHA_HASTA,
    CIERRE,
    CIERRE_HASTA,
    /** los marcadores se levantan cuando la cámara sube a la defensa (vista cenital: de canto no se leen) */
    MARCADORES_SALEN: DEFENSA,
    VUELTA,
    VUELTA_LISTA: VUELTA + 50,
    DEFENSA_HASTA: VUELTA,
    SUBS_DESDE: V.v03 - 2,
    SUBS_HASTA: CIERRE,
    VOZ_AT: V,
    // ── cámara (§ 10): escala, inclinación de la mesa, desplazamientos ──
    CAM_ESCALA: [
      { f: 0, v: 1 },
      { f: GANCHO_SALE, v: 1.03 },
      { f: PERDIDA, v: 1.03 },
      { f: PERDIDA + 30, v: 1.06 },
      { f: REBOBINADO, v: 1.06 },
      { f: REBOBINADO_HASTA, v: 0.82 },
      { f: V.v09, v: 0.86 },
      { f: DEFENSA, v: 0.86 },
      { f: DEFENSA + 40, v: 0.96 },
      { f: VUELTA, v: 0.96 },
      { f: ULTIMO, v: 1 },
    ],
    CAM_INCLINACION: [
      { f: 0, v: 0 },
      { f: REBOBINADO, v: 0 },
      { f: REBOBINADO_HASTA, v: 52 },
      { f: DEFENSA, v: 52 },
      { f: DEFENSA + 40, v: 0 },
    ],
    CAM_X: [
      { f: 0, v: 0 },
      { f: REBOBINADO_HASTA, v: 0 },
      { f: MARCADOR_1 + 10, v: 40 },
      { f: ENLACE + 30, v: -30 },
      { f: MARCADOR_2 + 10, v: 45 },
      { f: GRAFO + 70, v: 10 },
      { f: MARCADOR_3 + 7, v: 50 },
      { f: MARCADOR_4 + 7, v: 50 },
      { f: V.v09, v: 0 },
    ],
    CAM_Y: [
      { f: 0, v: 0 },
      { f: PERDIDA - 10, v: 0 },
      { f: PERDIDA + 20, v: -60 },
      { f: REBOBINADO, v: -60 },
      { f: REBOBINADO_HASTA, v: 40 },
      { f: DEFENSA, v: 40 },
      { f: DEFENSA + 40, v: 0 },
    ],
    TELEFONO_X: [
      { f: 0, v: 540 },
      { f: REBOBINADO, v: 540 },
      { f: REBOBINADO_HASTA, v: 530 },
      { f: DEFENSA, v: 530 },
      { f: DEFENSA + 40, v: 450 },
      { f: VUELTA, v: 450 },
      { f: ULTIMO, v: 540 },
    ],
    /** deriva: períodos que dividen la duración (cerca de 150 y 240 frames) para que el loop empalme */
    DERIVA: { ax: 3, px: DURACION / Math.max(1, Math.round(DURACION / 150)), ay: 2, py: DURACION / Math.max(1, Math.round(DURACION / 240)) },
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
