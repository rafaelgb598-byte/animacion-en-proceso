// Episodio 01 · Cerradura — todos los frames con nombre (arranque v4, § 6.2). 30 fps; objetivo 36 s (34–38).
// Cada bloque de voz empieza cuando termina el anterior (más una pausa) y cada evento se cuelga de la palabra que lo nombra.
// Sin voz real, las palabras se planifican a CPS_PLAN; con la voz real, el mismo cálculo usa los tiempos de ElevenLabs.
import type { BloqueVoz } from "../../marca/voz";
import { duracionBloque, palabrasDeBloque } from "../../marca/voz";
import { VOZ_IDS, type VozId } from "./script";

export const FPS = 30;
const fr = (s: number) => Math.round(s * FPS);
const clave = (t: string) =>
  t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9ñ]/g, "");

/** pausas entre bloques (frames) */
const PAUSA = 6;
/** largo de cada «tic» de columna (≈ 0,8 s) */
export const PASO_LUZ = 24;

export const crearTimeline = (bloques: BloqueVoz[]) => {
  const B = Object.fromEntries(bloques.map((b) => [b.id, b])) as Record<VozId, BloqueVoz>;
  const dur = (id: VozId) => fr(duracionBloque(B[id]));
  const V = {} as Record<VozId, number>;
  /** frame de la primera palabra del bloque que coincide con la clave */
  const en = (id: VozId, palabra: string) => {
    const w = palabrasDeBloque(B[id]).find((p) => clave(p.t) === clave(palabra));
    if (!w) throw new Error(`${id}: no encuentro «${palabra}» en la voz`);
    return V[id] + fr(w.s);
  };

  // ── 0–4 s: gancho, corte y apertura ──
  V.v1 = 4;
  /** la línea de corte llega al 100 % (arranca al 30 % en el cuadro 0) */
  const CORTE_FIN = 30;
  /** las mitades se separan y se desvanecen: cambio de estado antes de f45 */
  const APERTURA = CORTE_FIN;
  const LLAVE_ASOMA = 40;
  const LLAVE_MEDIA = 120;
  V.v2 = V.v1 + dur("v1") + 4;
  const PREGUNTA_SALE = Math.max(V.v2 + dur("v2"), LLAVE_MEDIA);

  // ── 4–10 s: las piezas ──
  V.v3 = V.v2 + dur("v2") + 5;
  const ROTULOS = {
    rotor: en("v3", "cilindro"),
    carcasa: en("v3", "girar"),
    pernos: en("v3", "pernos"),
    resortes: en("v3", "resortes"),
  };

  // ── 10–15 s: una columna, dos piezas, las cotas ──
  V.v4 = V.v3 + dur("v3") + PAUSA;
  const ROTULOS_SALEN = V.v4;
  const RESALTE = en("v4", "columna");
  const ROTULO_CONTRA = en("v4", "partida");
  const ROTULO_PERNO = ROTULO_CONTRA + 10;
  const COTA_FOCO = en("v4", "altura") - 6;
  /** las otras cuatro cotas, una cada 10 frames */
  const COTAS_RESTO = COTA_FOCO + 16;

  // ── 15–18 s: el truco (zoom a los dientes) ──
  V.v5 = V.v4 + dur("v4") + PAUSA;
  const RESALTE_SALE = V.v5 + 4;
  const ZOOM = en("v5", "truco");
  // ── 18–25 s: la llave entra, las columnas suben y cada corte se enciende ──
  const LLAVE_ENTRA = en("v5", "sube");
  const LLAVE_ADENTRO = LLAVE_ENTRA + 36;
  V.v6 = Math.max(V.v5 + dur("v5") + PAUSA, LLAVE_ADENTRO);
  const LUZ_0 = Math.max(en("v6", "cortes"), LLAVE_ADENTRO + 4);
  const LUCES = [0, 1, 2, 3, 4].map((i) => LUZ_0 + i * PASO_LUZ);
  const ROTULO_LINEA = en("v6", "linea");
  const DESTELLO = LUCES[4] + PASO_LUZ;
  // ── 25–27 s: el rotor gira 90° con un clac ──
  const GIRO = Math.max(DESTELLO + 10, en("v6", "libre"));
  const GIRO_FIN = GIRO + 30;

  // ── 27–32 s: llave incorrecta ──
  V.v7 = Math.max(V.v6 + dur("v6") + PAUSA, GIRO_FIN + 6);
  const GIRO_VUELVE = GIRO_FIN + 12;
  const LLAVE_SALE = GIRO_VUELVE + 14;
  const MALA_ENTRA = LLAVE_SALE + 14;
  const MALA_ADENTRO = MALA_ENTRA + 24;
  const MALA_MARCA = Math.max(MALA_ADENTRO + 2, en("v7", "corrida"));
  const INTENTO = Math.max(MALA_MARCA + 8, en("v7", "gira"));

  // ── 32–36 s: frase final, aviso y cierre en loop ──
  V.v8 = V.v7 + dur("v7") + PAUSA;
  const MALA_SALE = Math.max(INTENTO + 26, V.v8 + 6);
  const CODIGO = en("v8", "contrasena");
  const AVISO = V.v8 + dur("v8") + 4;
  const CIERRE = AVISO + 30;
  const DURACION = CIERRE + 30;

  return {
    V,
    CORTE_FIN,
    APERTURA,
    LLAVE_ASOMA,
    LLAVE_MEDIA,
    PREGUNTA_SALE,
    ROTULOS,
    ROTULOS_SALEN,
    RESALTE,
    ROTULO_CONTRA,
    ROTULO_PERNO,
    COTA_FOCO,
    COTAS_RESTO,
    RESALTE_SALE,
    ZOOM,
    LLAVE_ENTRA,
    LLAVE_ADENTRO,
    LUCES,
    ROTULO_LINEA,
    DESTELLO,
    GIRO,
    GIRO_FIN,
    GIRO_VUELVE,
    LLAVE_SALE,
    MALA_ENTRA,
    MALA_ADENTRO,
    MALA_MARCA,
    INTENTO,
    MALA_SALE,
    CODIGO,
    AVISO,
    CIERRE,
    DURACION,
    /** los subtítulos arrancan con «Abrámosla» (la pregunta ya está escrita en pantalla) */
    SUBS_DESDE: V.v2,
    /** período del latido de los resortes: divide la duración para que el loop cierre */
    LATIDO: DURACION / Math.max(1, Math.round(DURACION / 54)),
  };
};
export type Timeline = ReturnType<typeof crearTimeline>;
export { VOZ_IDS };
