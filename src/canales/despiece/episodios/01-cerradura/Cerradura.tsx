// Episodio 01 · el objeto: cerradura de cilindro con pernos (corte longitudinal y vista de frente) y su llave.
// Todo lo que es propio de la cerradura vive acá (no en el motor). Mecanismo verificado en fuentes.md:
// carcasa fija + rotor que gira; por columna, perno (largo variable) + contraperno + resorte; la línea de corte
// separa rotor y carcasa. Sin llave los contrapernos la cruzan; con la llave correcta cada unión cae sobre ella.
// v5: gancho = la llave con su contraseña · giro en vista de frente · «¿Cuál abre?» · loop exacto al cuadro 0.
import React, { useId } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { between, CLAMP, EASE, IN, mix, OUT, pulse, ramp } from "../../marca/anim";
import { ALPHA, COLOR, STROKE, TYPE } from "../../marca/theme";
import { Callout, CutLine, Dimension, Highlight, Pin, SectionSplit, Spring, TeaserChip, useResalte } from "../../motor";
import data from "./data.json";
import { PANTALLA } from "./script";
import type { Timeline } from "./timeline";

const D = data;
const N = D.niveles.length;
const SHEAR = D.lineaDeCorte;
const cx = (i: number) => D.columnas.x0 + i * D.columnas.paso;
const largoPerno = (nivel: number) => D.perno.largoBase + nivel * D.perno.largoPorNivel;

// ── encuadre: escena → pantalla ──
const E = D.encuadre;
const aPantalla = (x: number, y: number) => ({ x: (x - E.cx) * E.S + E.X, y: (y - E.cy) * E.S + E.Y });
const ESCENA = `translate(${E.X} ${E.Y}) scale(${E.S}) translate(${-E.cx} ${-E.cy})`;
/** centro de la hoja de la llave en coordenadas propias (u desde la punta) */
const LLAVE_CU = (D.llave.cabeza.u1 - 0) / 2;
const LLAVE_CY = 910;

// ── la llave: perfil del canto (coordenada u desde la punta) ──
type P = [number, number];
/** y del canto en cada columna (llave correcta: la unión cae justo en la línea de corte) */
const cantoCorrecto = D.niveles.map((n) => SHEAR + largoPerno(n));
const cantoIncorrecto = cantoCorrecto.map((y, i) => (i === D.llaveIncorrecta.columna ? y + D.llaveIncorrecta.corrimiento : y));
const uCol = (i: number) => cx(i) - D.llave.puntaMontada;

const perfil = (cantos: number[]): P[] => {
  const pts: P[] = [
    [0, D.llave.base - 14],
    [24, D.llave.lomo + 2],
  ];
  cantos.forEach((y, i) => {
    const u = uCol(i);
    pts.push([u - 11, y], [u + 11, y]);
    if (i < cantos.length - 1) {
      const pico = Math.max(D.llave.lomo, Math.min(y, cantos[i + 1]) - 22);
      pts.push([(u + uCol(i + 1)) / 2, pico]);
    }
  });
  pts.push([uCol(N - 1) + 46, D.llave.lomo], [D.llave.hoja, D.llave.lomo]);
  return pts;
};
const PERFIL_OK = perfil(cantoCorrecto);
const PERFIL_MAL = perfil(cantoIncorrecto);

/** y del canto bajo la coordenada u (null si la llave no llega) */
const cantoEn = (pts: P[], u: number): number | null => {
  if (u < 0 || u > pts[pts.length - 1][0]) return null;
  for (let i = 1; i < pts.length; i++) {
    const [u0, y0] = pts[i - 1];
    const [u1, y1] = pts[i];
    if (u <= u1) return u1 === u0 ? y1 : y0 + ((u - u0) / (u1 - u0)) * (y1 - y0);
  }
  return null;
};

/** la llave dibujada en sus coordenadas propias (punta en u = 0) */
const Llave: React.FC<{ pts: P[] }> = ({ pts }) => {
  const k = D.llave.cabeza;
  const canto = pts.map(([u, y]) => `L${u} ${y}`).join(" ");
  const d = `M0 ${D.llave.base} L0 ${D.llave.base - 14} ${canto} L${k.u0} ${D.llave.lomo} L${k.u0} ${k.y0 + 24} Q${k.u0} ${k.y0} ${k.u0 + 24} ${k.y0} L${k.u1 - 40} ${k.y0} Q${k.u1} ${k.y0} ${k.u1} ${k.y0 + 40} L${k.u1} ${k.y1 - 40} Q${k.u1} ${k.y1} ${k.u1 - 40} ${k.y1} L${k.u0 + 24} ${k.y1} Q${k.u0} ${k.y1} ${k.u0} ${k.y1 - 24} L${k.u0} ${D.llave.base} Z`;
  return (
    <g>
      <path d={d} fill={COLOR.paper} stroke={COLOR.ink} strokeWidth={STROKE.piece} strokeLinejoin="round" />
      <line x1={40} y1={D.llave.base - 40} x2={k.u0 - 10} y2={D.llave.base - 40} stroke={ALPHA.shadeStrong} strokeWidth={STROKE.leader} />
      <circle cx={k.u1 - 46} cy={(k.y0 + k.y1) / 2} r={20} fill={COLOR.bg} stroke={COLOR.ink} strokeWidth={STROKE.piece} />
    </g>
  );
};

/** transformación afín de la llave (u, y propios → escena): x = a·u + b, y = a·y + c */
type Afin = { a: number; b: number; c: number };
const poseEscena = (punta: number): Afin => ({ a: 1, b: punta, c: 0 });
/** pose del gancho: la llave sola, grande y centrada (se expresa en coordenadas de escena) */
const G = D.gancho;
const POSE_GANCHO: Afin = {
  a: G.K / E.S,
  b: (G.X - G.K * LLAVE_CU - E.X) / E.S + E.cx,
  c: (G.Y - G.K * LLAVE_CY - E.Y) / E.S + E.cy,
};
const mezclar = (p: Afin, q: Afin, t: number): Afin => ({ a: mix(p.a, q.a, t), b: mix(p.b, q.b, t), c: mix(p.c, q.c, t) });
const matriz = (p: Afin) => `matrix(${p.a} 0 0 ${p.a} ${p.b} ${p.c})`;

/** dónde va el número de cada columna: sobre su diente (gancho) o debajo de su columna (cerradura) — en pantalla */
const numeroGancho = (i: number) => ({ x: G.K * (uCol(i) - LLAVE_CU) + G.X, y: G.yNumeros });
const numeroColumna = (i: number) => aPantalla(cx(i), 1108);

/** rayado de corte (convención de plano: piezas distintas, rayado en sentido opuesto) */
const Rayados: React.FC = () => (
  <defs>
    <pattern id="raya-carcasa" width={18} height={18} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <line x1={0} y1={0} x2={0} y2={18} stroke={ALPHA.hatch} strokeWidth={STROKE.thin} />
    </pattern>
    <pattern id="raya-rotor" width={14} height={14} patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
      <line x1={0} y1={0} x2={0} y2={14} stroke={ALPHA.hatch} strokeWidth={STROKE.thin} />
    </pattern>
  </defs>
);

type Col = { i: number; nivel: number; largo: number; base: number; union: number; alineada: boolean };

export const Cerradura: React.FC<{ T: Timeline }> = ({ T }) => {
  const f = useCurrentFrame();
  const idBarrido = `barrido-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  // ── gancho ↔ cerradura: 1 = la llave sola con su contraseña (cuadro 0 y último cuadro) ──
  const gancho = f < T.CIERRE ? 1 - ramp(f, T.BAJADA, T.BAJADA_FIN - T.BAJADA, EASE) : ramp(f, T.CIERRE, T.DURACION - 1 - T.CIERRE, EASE);

  // ── línea de corte: 45 % en el cuadro 0, completa en CORTE_FIN (whoosh); al cierre se retrae y vuelve al 45 % ──
  const trayectoria = [
    { x: D.carcasa.x0 - 20, y: SHEAR },
    { x: D.carcasa.x1 + 110, y: SHEAR },
  ];
  const LINEA_0 = 0.45;
  const retrae = T.CIERRE + 5;
  let corte: { progreso: number; modo: "abre" | "cierra"; opacidad: number; brillo: number };
  if (f < T.CORTE_FIN) corte = { progreso: interpolate(f, [0, T.CORTE_FIN], [LINEA_0, 1], { ...CLAMP, easing: IN }), modo: "abre", opacidad: 1, brillo: 0 };
  else if (f < T.CIERRE) {
    const encendida = Math.max(ramp(f, T.LUCES[0], 6) * (1 - ramp(f, T.FRENTE, 6)), between(f, T.MALA_MARCA, T.MALA_SALE, 6, 8) * 0.6);
    corte = {
      progreso: 1,
      modo: "abre",
      opacidad: mix(interpolate(f, [T.CORTE_FIN, T.CORTE_FIN + 12], [1, 0.5], CLAMP), 1, encendida),
      brillo: between(f, T.DESTELLO, T.DESTELLO + 22, 3, 16),
    };
  } else if (f < retrae) corte = { progreso: ramp(f, T.CIERRE, retrae - T.CIERRE, IN), modo: "cierra", opacidad: 0.8, brillo: 0 };
  else corte = { progreso: interpolate(f, [retrae, T.DURACION - 1], [0, LINEA_0], CLAMP), modo: "abre", opacidad: 1, brillo: 0 };

  // el corte se revela detrás de la línea (barrido) y «respira» al abrirse y en «Mirá»
  // en el cuadro 0 la cerradura todavía no se ve: el barrido arranca en el borde y la revela en CORTE_FIN frames
  const barrido = f < T.CORTE_FIN ? interpolate(f, [0, T.CORTE_FIN], [D.carcasa.x0 - 40, D.carcasa.x1 + 140], { ...CLAMP, easing: IN }) : 2000;
  const respiro = Math.max(between(f, 2, 22, 7, 12), between(f, T.RESPIRO, T.RESPIRO + 22, 7, 12));
  const vistaFrente = between(f, T.FRENTE, T.FRENTE_SALE + 6, 6, 6);
  const cual = between(f, T.CUAL, T.CUAL_SALE, 8, 8);
  const opCorte = (f < T.CIERRE ? 1 : 1 - ramp(f, T.CIERRE, 12)) * (1 - vistaFrente) * (1 - 0.85 * cual);

  // ── la llave ──
  const usarMala = f >= T.MALA_ENTRA - 2 && f < T.CIERRE;
  const fuera = D.llave.puntaFuera;
  let punta: number;
  if (f < T.LLAVE_ENTRA) punta = interpolate(f, [T.BAJADA + 4, T.BAJADA_FIN + 4], [fuera, D.llave.puntaMitad], { ...CLAMP, easing: OUT });
  else if (f < T.LLAVE_SALE) punta = interpolate(f, [T.LLAVE_ENTRA, T.LLAVE_ADENTRO], [D.llave.puntaMitad, D.llave.puntaMontada], { ...CLAMP, easing: EASE });
  else if (f < T.MALA_ENTRA) punta = interpolate(f, [T.LLAVE_SALE, T.LLAVE_SALE + 12], [D.llave.puntaMontada, fuera], { ...CLAMP, easing: IN });
  else if (f < T.MALA_SALE) punta = interpolate(f, [T.MALA_ENTRA, T.MALA_ADENTRO], [fuera, D.llave.puntaMontada], { ...CLAMP, easing: EASE });
  else punta = interpolate(f, [T.MALA_SALE, T.MALA_SALE + 14], [D.llave.puntaMontada, fuera], { ...CLAMP, easing: IN });
  const pts = usarMala ? PERFIL_MAL : PERFIL_OK;
  const fisicaPresente = punta < fuera - 1;
  // pose visible: en el gancho, la llave grande; si no, donde la pone la física (al bajar, ya en «mitad»)
  const puntaVisible = f < T.LLAVE_ENTRA && f < T.BAJADA_FIN + 4 ? D.llave.puntaMitad : f >= T.CIERRE ? fuera : punta;
  const pose = mezclar(poseEscena(puntaVisible), POSE_GANCHO, gancho);
  const llaveVisible = gancho > 0.001 || fisicaPresente;

  // ── columnas ──
  const latido = pulse(f, T.LATIDO);
  const resortes = between(f, T.RESORTES, T.RESORTES + 30, 4, 14);
  const columnas: Col[] = D.niveles.map((nivel, i) => {
    const largo = largoPerno(nivel);
    const canto = fisicaPresente && gancho < 0.5 ? cantoEn(pts, cx(i) - punta) : null;
    const base = canto === null ? D.perno.reposo : Math.min(D.perno.reposo, canto);
    // cada columna «se asienta» con un golpecito (más fuerte cada vez) cuando le toca su luz
    const largoGolpe = 10;
    const golpe = f >= T.LUCES[i] && f < T.LUCES[i] + largoGolpe ? -(3 + i) * Math.sin(((f - T.LUCES[i]) / largoGolpe) * Math.PI) : 0;
    const union = base - largo + golpe;
    const alineada = Math.abs(base - largo - SHEAR) < 1.5;
    return { i, nivel, largo, base: base + golpe, union, alineada };
  });
  const luz = (i: number) => {
    if (f < T.FRENTE) return columnas[i].alineada ? ramp(f, T.LUCES[i], 4, OUT) : 0;
    if (f >= T.MALA_MARCA && f < T.MALA_SALE) return columnas[i].alineada ? ramp(f, T.MALA_MARCA, 5, OUT) : 0;
    return 0;
  };
  const falla = (i: number) => (i === D.llaveIncorrecta.columna ? between(f, T.MALA_MARCA, T.MALA_SALE + 4, 4, 8) : 0);

  // ── resalte y cámara ──
  const resalte = between(f, T.RESALTE, T.RESALTE_SALE, 8, 10);
  const zoom = ramp(f, T.ZOOM, 16) * (1 - ramp(f, T.LLAVE_ENTRA, 18));
  const golpeMira = between(f, T.RESPIRO, T.RESPIRO + 16, 4, 12);
  // acercamiento lento después de abrir (que el tramo del gancho nunca quede quieto) y vuelta en «pernos»
  const acerca = ramp(f, T.BAJADA_FIN, T.RESPIRO - T.BAJADA_FIN, (x) => x) * (1 - ramp(f, T.RESPIRO + 16, 40));
  const esc = 1 + 0.08 * zoom;
  /** el acercamiento y el golpe de «Mirá» van hacia el centro de la cerradura (no se corre del cuadro) */
  // acercamiento lento durante la frase final (vuelve a 1 antes del loop)
  const acercaFinal = ramp(f, T.CODIGO, T.CIERRE - T.CODIGO, (x) => x) * (1 - ramp(f, T.CIERRE, 10));
  const escCentro = 1 + 0.03 * golpeMira + 0.05 * acerca + 0.05 * acercaFinal;
  const centro = { x: (D.carcasa.x0 + D.carcasa.x1) / 2, y: (D.carcasa.y0 + D.carcasa.y1) / 2 };
  const pivote = { x: 700, y: 880 };
  // sacudón del clac (6 frames, 4 px) y rebote de la llave incorrecta
  const sac = (at: number, amp: number, len: number) => (f >= at && f < at + len ? amp * (1 - (f - at) / len) * (((f - at) % 2) * 2 - 1) : 0);
  const sacX = sac(T.CLAC, 4, 6) + sac(T.INTENTO, 6, 10);
  const sacY = sac(T.CLAC + 1, 3, 6);
  const deriva = 3 * Math.sin((2 * Math.PI * f) / T.DURACION);

  const cotas = (i: number) => {
    const at = i === D.columnaFoco ? T.COTA_FOCO : T.COTAS_RESTO + [0, 1, 2, 3, 4].filter((k) => k !== D.columnaFoco).indexOf(i) * 6;
    return ramp(f, at, 12, OUT) * (1 - ramp(f, T.RESALTE_SALE, 10));
  };

  const capa = (frente: boolean) => (
    <Interior columnas={columnas} luz={luz} falla={falla} latido={latido + resortes} frente={frente} />
  );

  return (
    <g>
      <Rayados />
      <defs>
        <clipPath id={idBarrido}>
          <rect x={-200} y={0} width={barrido + 200} height={1920} />
        </clipPath>
      </defs>
      <g transform={`translate(${sacX} ${sacY + deriva})`}>
        {/* ── la cerradura en corte (escena) ── */}
        <g transform={ESCENA}>
          <g transform={`translate(${centro.x} ${centro.y}) scale(${escCentro}) translate(${-centro.x} ${-centro.y}) translate(${pivote.x} ${pivote.y}) scale(${esc}) translate(${-pivote.x} ${-pivote.y})`}>
            <Highlight activo={resalte} foco={[`col-${D.columnaFoco}`]}>
              <g opacity={opCorte} clipPath={`url(#${idBarrido})`}>
                <SectionSplit id="fondo" corteY={SHEAR} apertura={respiro} separacion={36} opacidadInterior={0} exterior={capa(false)} interior={null} />
              </g>
              {llaveVisible ? (
                <g opacity={gancho > 0.001 ? 1 : opCorte}>
                  <Resaltable id="resto">
                    <g transform={matriz(pose)}>
                      <Llave pts={gancho > 0.001 ? PERFIL_OK : pts} />
                    </g>
                  </Resaltable>
                </g>
              ) : null}
              <g opacity={opCorte} clipPath={`url(#${idBarrido})`}>
                <SectionSplit id="frente" corteY={SHEAR} apertura={respiro} separacion={36} opacidadInterior={0} exterior={capa(true)} interior={null} />
                {columnas.map((c) => (
                  <g key={c.i}>
                    {luz(c.i) > 0 ? <rect x={cx(c.i) - 34} y={SHEAR - 5} width={68} height={10} rx={5} fill={COLOR.signal} opacity={luz(c.i)} /> : null}
                    {falla(c.i) > 0 ? <rect x={cx(c.i) - 34} y={c.union - 5} width={68} height={10} rx={5} fill={COLOR.error} opacity={falla(c.i)} /> : null}
                  </g>
                ))}
                {columnas.map((c) => (
                  <Cota key={c.i} i={c.i} desde={c.base} hasta={c.union} progreso={cotas(c.i)} />
                ))}
              </g>
            </Highlight>
            <CutLine trayectoria={trayectoria} progreso={corte.progreso} modo={corte.modo} opacidad={corte.opacidad * (1 - vistaFrente) * (1 - 0.85 * cual)} brillo={corte.brillo} />
            <Rotulos T={T} f={f} columnas={columnas} />
          </g>
        </g>

        {/* ── el giro, de frente ── */}
        {vistaFrente > 0 ? <Frente T={T} f={f} p={vistaFrente} /> : null}
      </g>

      {/* ── los números: sobre los dientes (gancho) → debajo de cada columna ── */}
      <Numeros f={f} T={T} gancho={gancho} resalte={resalte} opacidad={(1 - vistaFrente) * (1 - 0.85 * cual)} latido={latido} />

      {/* ── textos ── */}
      <TituloGancho opacidad={f < T.CIERRE ? 1 - ramp(f, T.TITULO_SALE, 10, IN) : ramp(f, T.CIERRE + 5, T.DURACION - 1 - T.CIERRE - 5, OUT)} />
      {cual > 0 ? <DosLlaves p={cual} f={f} T={T} /> : null}
      <Final p={between(f, T.CODIGO, T.CIERRE + 4, 10, 6)} f={f} T={T} />
      <TeaserChip proximo={D.proximo} x={480} y={512} ancho={620} progreso={between(f, T.AVISO, T.CIERRE + 4, 10, 6)} />
    </g>
  );
};

/** una capa del corte: «fondo» (carcasa, cámaras con resortes, rotor y canal) o «frente» (pernos y contrapernos) */
const Interior: React.FC<{ columnas: Col[]; luz: (i: number) => number; falla: (i: number) => number; latido: number; frente: boolean }> = ({
  columnas,
  luz,
  falla,
  latido,
  frente,
}) => {
  const c = D.carcasa;
  const r = D.rotor;
  const resto = useResalte("resto");
  if (frente)
    return (
      <g>
        {columnas.map((col) => (
          <PernoInferior key={`p${col.i}`} col={col} luz={luz(col.i)} falla={falla(col.i)} />
        ))}
        {columnas.map((col) => (
          <Contraperno key={`c${col.i}`} col={col} luz={luz(col.i)} falla={falla(col.i)} />
        ))}
      </g>
    );
  return (
    <g>
      <g opacity={resto}>
        <rect x={c.x0} y={c.y0} width={c.x1 - c.x0} height={c.y1 - c.y0} rx={18} fill={COLOR.paper} stroke={COLOR.ink} strokeWidth={STROKE.piece} />
        <rect x={c.x0} y={c.y0} width={c.x1 - c.x0} height={c.y1 - c.y0} rx={18} fill="url(#raya-carcasa)" />
      </g>
      {columnas.map((col) => (
        <Camara key={col.i} col={col} latido={latido} />
      ))}
      <g opacity={resto}>
        <rect x={r.x0} y={r.y0} width={r.x1 - r.x0} height={r.y1 - r.y0} fill={COLOR.paper} stroke={COLOR.ink} strokeWidth={STROKE.piece} />
        <rect x={r.x0} y={r.y0} width={r.x1 - r.x0} height={r.y1 - r.y0} fill="url(#raya-rotor)" />
        <rect x={r.x0 + 2} y={D.canal.y0} width={r.x1 - r.x0 + 2} height={D.canal.y1 - D.canal.y0} fill={COLOR.bg} />
      </g>
      {columnas.map((col) => (
        <AgujeroRotor key={col.i} i={col.i} />
      ))}
    </g>
  );
};

const Resaltable: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => <g opacity={useResalte(id)}>{children}</g>;

const Camara: React.FC<{ col: Col; latido: number }> = ({ col, latido }) => {
  const o = useResalte(`col-${col.i}`);
  const w = D.camara.ancho;
  const x = cx(col.i);
  const tope = col.union - D.contraperno.largo;
  return (
    <g opacity={o}>
      <rect x={x - w / 2} y={D.camara.y0} width={w} height={SHEAR - D.camara.y0} fill={COLOR.bg} />
      <Spring x={x} yTop={D.camara.y0 + 2} yBottom={tope - 1} ancho={30 + Math.min(1.6, latido) * 6} espiras={7} />
    </g>
  );
};

const AgujeroRotor: React.FC<{ i: number }> = ({ i }) => {
  const o = useResalte(`col-${i}`);
  const w = D.camara.ancho;
  return <rect x={cx(i) - w / 2} y={SHEAR - 1} width={w} height={D.canal.y0 - SHEAR + 2} fill={COLOR.bg} opacity={o} />;
};

const PernoInferior: React.FC<{ col: Col; luz: number; falla: number }> = ({ col, luz, falla }) => {
  const o = useResalte(`col-${col.i}`);
  const resalte = falla > 0.5 ? COLOR.error : luz > 0.5 ? COLOR.signal : null;
  return (
    <g opacity={o}>
      <Pin id={`p${col.i}`} x={cx(col.i)} yTop={col.union} yBottom={col.base} ancho={D.columnas.anchoPerno} tipo="llave" resalte={resalte} />
    </g>
  );
};

const Contraperno: React.FC<{ col: Col; luz: number; falla: number }> = ({ col, luz, falla }) => {
  const o = useResalte(`col-${col.i}`);
  const resalte = falla > 0.5 ? COLOR.error : luz > 0.5 ? COLOR.signal : null;
  return (
    <g opacity={o}>
      <Pin id={`c${col.i}`} x={cx(col.i)} yTop={col.union - D.contraperno.largo} yBottom={col.union} ancho={D.columnas.anchoPerno} tipo="contra" resalte={resalte} />
    </g>
  );
};

const Cota: React.FC<{ i: number; desde: number; hasta: number; progreso: number }> = ({ i, desde, hasta, progreso }) => {
  const o = useResalte(`col-${i}`);
  if (progreso <= 0) return null;
  return <Dimension desde={{ x: cx(i) + 22, y: desde }} hasta={{ x: cx(i) + 22, y: hasta }} corrimiento={-12} valor="" progreso={progreso} opacidad={o} />;
};

/** solo tres rótulos, cuando la voz los nombra (coordenadas de escena, sobre la cerradura) */
const Rotulos: React.FC<{ T: Timeline; f: number; columnas: Col[] }> = ({ T, f, columnas }) => {
  const prog = (a: number) => ramp(f, a, 16, OUT);
  const R = PANTALLA.rotulos;
  const foco = columnas[D.columnaFoco];
  const xf = cx(D.columnaFoco);
  return (
    <g>
      <Callout ancla={{ x: xf - 22, y: foco.union - D.contraperno.largo / 2 }} codo={{ x: 120, y: 470 }} rotulo={{ x: 140, y: 420 }} texto={R.contra} progreso={prog(T.ROTULO_CONTRA)} opacidad={between(f, T.ROTULO_CONTRA, T.ROTULOS_SALEN, 1, 10)} />
      <Callout ancla={{ x: xf + 22, y: (foco.union + foco.base) / 2 }} codo={{ x: 540, y: 470 }} rotulo={{ x: 562, y: 482 }} texto={R.perno} progreso={prog(T.ROTULO_PERNO)} opacidad={between(f, T.ROTULO_PERNO, T.ROTULOS_SALEN, 1, 10)} />
      <Callout ancla={{ x: 690, y: SHEAR }} codo={{ x: 690, y: 470 }} rotulo={{ x: 600, y: 420 }} alinear="start" texto={R.linea} progreso={prog(T.ROTULO_LINEA)} opacidad={between(f, T.ROTULO_LINEA, T.FRENTE + 4, 1, 4)} color={COLOR.signal} />
    </g>
  );
};

/** vista de frente: la boca de la cerradura con la llave adentro gira 90° (clac en «gira») */
const Frente: React.FC<{ T: Timeline; f: number; p: number }> = ({ T, f, p }) => {
  const F = D.frente;
  const ang = interpolate(f, [T.GIRO, T.CLAC], [0, 90], { ...CLAMP, easing: IN });
  const esc = mix(0.86, 1, p);
  const luz = 1 - ramp(f, T.CLAC + 8, 16);
  const R = F.carcasa;
  const r = F.rotor;
  const arco = (a: number) => {
    const rad = ((a - 90) * Math.PI) / 180;
    return { x: F.X + Math.cos(rad) * (R + 46), y: F.Y + Math.sin(rad) * (R + 46) };
  };
  const a0 = arco(0);
  const a1 = arco(Math.max(0.1, ang));
  // la cara del canal: un zigzag vertical (perfil de la llave visto de punta)
  const canal = `M${F.X - 10} ${F.Y - 118} L${F.X + 14} ${F.Y - 70} L${F.X - 12} ${F.Y - 20} L${F.X + 14} ${F.Y + 34} L${F.X - 6} ${F.Y + 118}`;
  return (
    <g opacity={p} transform={`translate(${F.X} ${F.Y}) scale(${esc}) translate(${-F.X} ${-F.Y})`}>
      <circle cx={F.X} cy={F.Y} r={R} fill={COLOR.paper} stroke={COLOR.ink} strokeWidth={STROKE.piece} />
      <circle cx={F.X} cy={F.Y} r={R} fill="url(#raya-carcasa)" />
      {/* las cinco cámaras de los contrapernos asoman arriba, en la carcasa */}
      <rect x={F.X - 26} y={F.Y - R + 26} width={52} height={R - r - 26} fill={COLOR.bg} />
      <rect x={F.X - 22} y={F.Y - r - 84} width={44} height={84} rx={4} fill={COLOR.paper} stroke={COLOR.ink} strokeWidth={STROKE.piece} />
      <g transform={`rotate(${ang} ${F.X} ${F.Y})`}>
        <circle cx={F.X} cy={F.Y} r={r} fill={COLOR.paper} stroke={COLOR.ink} strokeWidth={STROKE.piece} />
        <circle cx={F.X} cy={F.Y} r={r} fill="url(#raya-rotor)" />
        <path d={canal} fill="none" stroke={COLOR.bg} strokeWidth={34} strokeLinecap="round" strokeLinejoin="round" />
        <path d={canal} fill="none" stroke={COLOR.paper} strokeWidth={18} strokeLinecap="round" strokeLinejoin="round" />
        {/* la cabeza de la llave (icónica: el agujero ayuda a leerla como llave) */}
        <rect x={F.X - 40} y={F.Y - 200} width={80} height={400} rx={34} fill={COLOR.paper} stroke={COLOR.ink} strokeWidth={STROKE.piece} />
        <rect x={F.X + 14} y={F.Y - 180} width={12} height={360} rx={6} fill={ALPHA.shade} />
        <circle cx={F.X} cy={F.Y - 150} r={18} fill={COLOR.bg} stroke={COLOR.ink} strokeWidth={STROKE.piece} />
      </g>
      {/* la línea de corte, de frente, es el borde del rotor */}
      <circle cx={F.X} cy={F.Y} r={r} fill="none" stroke={ALPHA.signalGlow} strokeWidth={STROKE.cut + 16 * luz} />
      <circle cx={F.X} cy={F.Y} r={r} fill="none" stroke={COLOR.signal} strokeWidth={STROKE.cut} />
      {/* flecha de giro */}
      {ang > 1 ? (
        <g>
          <path d={`M${a0.x} ${a0.y} A${R + 46} ${R + 46} 0 0 1 ${a1.x} ${a1.y}`} fill="none" stroke={COLOR.signal} strokeWidth={STROKE.cut} strokeLinecap="round" />
          <circle cx={a1.x} cy={a1.y} r={11} fill={COLOR.signal} />
        </g>
      ) : null}
    </g>
  );
};

const Numeros: React.FC<{ f: number; T: Timeline; gancho: number; resalte: number; opacidad: number; latido: number }> = ({ f, T, gancho, resalte, opacidad, latido }) => {
  const final = ramp(f, T.CODIGO, 12, OUT) * (1 - ramp(f, T.CIERRE, 6));
  return (
    <g opacity={opacidad}>
      {D.niveles.map((n, i) => {
        const a = numeroColumna(i);
        const b = numeroGancho(i);
        const x = mix(a.x, b.x, gancho);
        const y = mix(a.y, b.y, gancho);
        const enfoque = i === D.columnaFoco;
        const o = enfoque ? 1 : 1 - 0.4 * resalte;
        // en el gancho laten (cada uno con su fase) y son grandes y naranjas
        const late = 1 + 0.07 * gancho * pulse(f + i * 4, T.LATIDO);
        const k = salto(f, T.SALTOS[i]);
        const tam = mix(mix(58, 64, final), 112, gancho) * late * (1 + 0.25 * k);
        return (
          <text key={i} x={x} y={y} textAnchor="middle" fill={gancho > 0.5 || k > 0.2 ? COLOR.signal : COLOR.paper} opacity={o} style={{ ...TYPE.value, fontSize: tam }}>
            {n}
          </text>
        );
      })}
      {/* guías finas de cada número a su diente (solo en el gancho) */}
      {gancho > 0.02
        ? D.niveles.map((_, i) => {
            const b = numeroGancho(i);
            const yDiente = G.K * (cantoCorrecto[i] - LLAVE_CY) + G.Y;
            return <line key={`g${i}`} x1={b.x} y1={b.y + 16} x2={b.x} y2={yDiente - 10} stroke={COLOR.signal} strokeWidth={STROKE.thin} strokeDasharray="6 8" opacity={gancho * (0.7 + 0.3 * latido)} />;
          })
        : null}
    </g>
  );
};

const TituloGancho: React.FC<{ opacidad: number }> = ({ opacidad }) => {
  if (opacidad <= 0) return null;
  const [l1, l2] = PANTALLA.gancho;
  const [antes, despues] = l2.split("contraseña");
  return (
    <g opacity={opacidad}>
      <text x={540} y={392} textAnchor="middle" fill={COLOR.paper} style={TYPE.title}>
        {l1}
      </text>
      <text x={540} y={486} textAnchor="middle" fill={COLOR.paper} style={TYPE.title}>
        {antes}
        <tspan fill={COLOR.signal}>contraseña</tspan>
        {despues}
      </text>
    </g>
  );
};

/** «¿Cuál abre?»: dos llaves casi iguales (la 2 tiene una columna corrida) */
const DosLlaves: React.FC<{ p: number; f: number; T: Timeline }> = ({ p, f, T }) => {
  const L = D.dosLlaves;
  const llave = (n: 1 | 2, y: number, entra: number) => {
    const t = ramp(f, entra, 10, OUT);
    const x0 = L.X - L.K * LLAVE_CU + (1 - t) * 120;
    return (
      <g key={n} opacity={t}>
        <g transform={`matrix(${L.K} 0 0 ${L.K} ${x0} ${y - L.K * LLAVE_CY})`}>
          <Llave pts={n === 1 ? PERFIL_OK : PERFIL_MAL} />
        </g>
        <circle cx={118} cy={y} r={44} fill="none" stroke={COLOR.paper} strokeWidth={STROKE.leader} />
        <text x={118} y={y + 22} textAnchor="middle" fill={COLOR.paper} style={{ ...TYPE.value, fontSize: 64 }}>
          {n}
        </text>
      </g>
    );
  };
  return (
    <g opacity={p}>
      <text x={540} y={500} textAnchor="middle" fill={COLOR.paper} style={TYPE.title}>
        {PANTALLA.cual}
      </text>
      {llave(1, L.Y1, T.CUAL)}
      {llave(2, L.Y2, T.CUAL + 6)}
    </g>
  );
};

/** salto de un número (0 → 1 → 0 en 10 frames) */
const salto = (f: number, at: number) => (f >= at && f < at + 10 ? Math.sin(((f - at) / 10) * Math.PI) : 0);

const Final: React.FC<{ p: number; f: number; T: Timeline }> = ({ p, f, T }) => {
  if (p <= 0) return null;
  return (
    <g opacity={p} transform={`translate(0 ${(1 - p) * 16})`}>
      <text x={540} y={300} textAnchor="middle" fill={COLOR.paper} style={{ ...TYPE.label, fontSize: 48 }}>
        {PANTALLA.final}
      </text>
      {D.niveles.map((n, i) => {
        const k = salto(f, T.SALTOS[i]);
        return (
          <text key={i} x={540 + (i - 2) * 124} y={412 - 18 * k} textAnchor="middle" fill={COLOR.signal} style={{ ...TYPE.value, fontSize: 112 * (1 + 0.18 * k) }}>
            {n}
          </text>
        );
      })}
    </g>
  );
};
