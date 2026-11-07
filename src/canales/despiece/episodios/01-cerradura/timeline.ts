// Episodio 01 · Cerradura (v5) — todos los frames con nombre. 30 fps; objetivo 28–31 s.
// Cada bloque de voz empieza cuando termina el anterior (más una pausa) y cada evento se cuelga de la palabra que lo nombra:
// destello en «línea», clac en «gira», rojo en «corrida». Sin voz real, las palabras se planifican a CPS_PLAN.
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
const PAUSA = 5;

export const crearTimeline = (bloques: BloqueVoz[]) => {
  const B = Object.fromEntries(bloques.map((b) => [b.id, b])) as Record<VozId, BloqueVoz>;
  const dur = (id: VozId) => fr(duracionBloque(B[id]));
  const V = {} as Record<VozId, number>;
  /** frame de la n-ésima palabra del bloque que coincide con la clave */
  const en = (id: VozId, palabra: string, n = 0) => {
    const ws = palabrasDeBloque(B[id]).filter((p) => clave(p.t) === clave(palabra));
    const w = ws[n];
    if (!w) throw new Error(`${id}: no encuentro «${palabra}» en la voz`);
    return V[id] + fr(w.s);
  };
  const fin = (id: VozId) => V[id] + dur(id);

  // ── 0–0,5 s: gancho (la llave con la contraseña) → la línea corta y abre antes de f12 ──
  V.v01 = 3;
  /** la línea completa el corte (arranca al 45 % en el cuadro 0) */
  const CORTE_FIN = 10;
  /** la llave y los números bajan a su lugar en la cerradura */
  const BAJADA = 3;
  const BAJADA_FIN = 16;
  const TITULO_SALE = fin("v01") + 2;

  // ── «Mirá»: las mitades del corte se separan y vuelven ──
  V.v02 = fin("v01") + PAUSA;
  const RESPIRO = V.v02;

  // ── piezas nombradas mientras pasa la acción ──
  V.v03 = fin("v02") + PAUSA;
  const ROTULO_PERNO = en("v03", "pernos");
  const ROTULO_CONTRA = en("v03", "resortes");
  const RESORTES = en("v03", "resortes");

  V.v04 = fin("v03") + PAUSA;
  const RESALTE = en("v04", "columna");
  const COTA_FOCO = en("v04", "corte");
  const COTAS_RESTO = COTA_FOCO + 12;
  const ROTULOS_SALEN = en("v04", "altura") + 10;

  // ── el truco: zoom a los dientes y la llave entra ──
  V.v05 = fin("v04") + PAUSA;
  const RESALTE_SALE = V.v05 + 4;
  const ZOOM = en("v05", "dientes");
  const LLAVE_ENTRA = en("v05", "suben");
  const LLAVE_ADENTRO = LLAVE_ENTRA + 30;

  // ── los cortes tocan la línea: 5 tics crecientes y el destello en «línea» ──
  V.v06 = Math.max(fin("v05") + PAUSA, LLAVE_ADENTRO + 2);
  const DESTELLO = en("v06", "linea");
  const LUZ_0 = Math.max(en("v06", "cuando"), LLAVE_ADENTRO + 2);
  const PASO_LUZ = Math.max(5, Math.floor((DESTELLO - 4 - LUZ_0) / 4));
  const LUCES = [0, 1, 2, 3, 4].map((i) => LUZ_0 + i * PASO_LUZ);
  const ROTULO_LINEA = DESTELLO;

  // ── «…el cilindro gira»: vista de frente, giro de 90° y clac en «gira» ──
  V.v07 = fin("v06") + 3;
  const CLAC = en("v07", "gira");
  const FRENTE = Math.max(DESTELLO + 10, CLAC - 22);
  const GIRO = FRENTE + 6;
  const FRENTE_SALE = Math.max(CLAC + 26, fin("v07"));
  /** de vuelta al corte: el rotor quedó girado → vuelve, sale la llave */
  const LLAVE_SALE = FRENTE_SALE + 6;

  // ── «¿Y cuál de estas abre?» ──
  V.v08 = Math.max(fin("v07") + PAUSA, LLAVE_SALE + 4);
  const CUAL = V.v08 - 4;
  const CUAL_SALE = Math.max(CUAL + 45, fin("v08") + 8);

  // ── «Basta una sola columna corrida… y no gira» ──
  V.v09 = CUAL_SALE + 2;
  const MALA_ENTRA = CUAL_SALE - 6;
  const MALA_MARCA = en("v09", "corrida");
  const MALA_ADENTRO = Math.min(MALA_ENTRA + 22, MALA_MARCA - 2);
  const INTENTO = en("v09", "gira");

  // ── frase final, aviso y vuelta al gancho (loop) ──
  V.v10 = fin("v09") + PAUSA + 2;
  const MALA_SALE = Math.max(INTENTO + 20, V.v10 - 2);
  const CODIGO = V.v10;
  /** los 5 números del código saltan de a uno mientras se dice la frase */
  const SALTOS = [0, 1, 2, 3, 4].map((i) => CODIGO + 12 + i * 8);
  const AVISO = en("v10", "contrasena");
  const CIERRE = fin("v10") + 4;
  const DURACION = CIERRE + 18;

  return {
    V,
    CORTE_FIN,
    BAJADA,
    BAJADA_FIN,
    TITULO_SALE,
    RESPIRO,
    ROTULO_PERNO,
    ROTULO_CONTRA,
    RESORTES,
    RESALTE,
    COTA_FOCO,
    COTAS_RESTO,
    ROTULOS_SALEN,
    RESALTE_SALE,
    ZOOM,
    LLAVE_ENTRA,
    LLAVE_ADENTRO,
    LUCES,
    DESTELLO,
    ROTULO_LINEA,
    FRENTE,
    GIRO,
    CLAC,
    FRENTE_SALE,
    LLAVE_SALE,
    CUAL,
    CUAL_SALE,
    MALA_ENTRA,
    MALA_ADENTRO,
    MALA_MARCA,
    INTENTO,
    MALA_SALE,
    CODIGO,
    SALTOS,
    AVISO,
    CIERRE,
    DURACION,
    /** los subtítulos arrancan con «Mirá» (la frase del gancho ya está escrita en pantalla) */
    SUBS_DESDE: V.v02,
    /** período del latido: divide la duración para que el loop cierre */
    LATIDO: DURACION / Math.max(1, Math.round(DURACION / 30)),
  };
};
export type Timeline = ReturnType<typeof crearTimeline>;
export { VOZ_IDS };
