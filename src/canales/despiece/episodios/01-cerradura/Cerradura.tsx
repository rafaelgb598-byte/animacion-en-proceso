// Episodio 01 · el objeto: cerradura de cilindro con pernos, vista exterior en 3/4 y corte longitudinal.
// Todo lo que es propio de la cerradura vive acá (no en el motor). Mecanismo verificado en fuentes.md:
// carcasa fija + rotor que gira; por columna, perno (largo variable) + contraperno + resorte; la línea de corte
// separa rotor y carcasa. Sin llave los contrapernos la cruzan; con la llave correcta cada unión cae sobre ella.
import React from "react";
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
const EJE = (D.rotor.y0 + D.rotor.y1) / 2;
const cx = (i: number) => D.columnas.x0 + i * D.columnas.paso;
const largoPerno = (nivel: number) => D.perno.largoBase + nivel * D.perno.largoPorNivel;

// ── la llave: perfil del canto (coordenada u desde la punta) ──
type P = [number, number];
/** y del canto de la llave en cada columna (llave correcta: la unión cae justo en la línea de corte) */
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

const Llave: React.FC<{ punta: number; pts: P[] }> = ({ punta, pts }) => {
  const k = D.llave.cabeza;
  const canto = pts.map(([u, y]) => `L${punta + u} ${y}`).join(" ");
  const d = `M${punta} ${D.llave.base} L${punta} ${D.llave.base - 14} ${canto} L${punta + k.u0} ${D.llave.lomo} L${punta + k.u0} ${k.y0 + 24} Q${punta + k.u0} ${k.y0} ${punta + k.u0 + 24} ${k.y0} L${punta + k.u1 - 40} ${k.y0} Q${punta + k.u1} ${k.y0} ${punta + k.u1} ${k.y0 + 40} L${punta + k.u1} ${k.y1 - 40} Q${punta + k.u1} ${k.y1} ${punta + k.u1 - 40} ${k.y1} L${punta + k.u0 + 24} ${k.y1} Q${punta + k.u0} ${k.y1} ${punta + k.u0} ${k.y1 - 24} L${punta + k.u0} ${D.llave.base} Z`;
  return (
    <g>
      <path d={d} fill={COLOR.paper} stroke={COLOR.ink} strokeWidth={STROKE.piece} strokeLinejoin="round" />
      {/* ranura longitudinal de la hoja y agujero de la cabeza */}
      <line x1={punta + 40} y1={D.llave.base - 40} x2={punta + k.u0 - 10} y2={D.llave.base - 40} stroke={ALPHA.shadeStrong} strokeWidth={STROKE.leader} />
      <circle cx={punta + k.u1 - 56} cy={(k.y0 + k.y1) / 2} r={22} fill={COLOR.bg} stroke={COLOR.ink} strokeWidth={STROKE.piece} />
    </g>
  );
};

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

/** vista exterior en 3/4 (cuadro 0 y cierre del loop) */
const Exterior: React.FC = () => {
  const c = D.carcasa;
  const caraCx = c.x1;
  const caraCy = (c.y0 + c.y1) / 2;
  return (
    <g>
      <rect x={c.x0} y={c.y0} width={c.x1 - c.x0} height={c.y1 - c.y0} rx={18} fill={COLOR.paper} stroke={COLOR.ink} strokeWidth={STROKE.piece} />
      <rect x={c.x0 + 2} y={(c.y0 + c.y1) / 2 + 60} width={c.x1 - c.x0 - 4} height={c.y1 - (c.y0 + c.y1) / 2 - 62} rx={16} fill={ALPHA.shade} />
      <line x1={c.x0 + 20} y1={c.y0 + 26} x2={c.x1 - 20} y2={c.y0 + 26} stroke={ALPHA.shadeStrong} strokeWidth={STROKE.thin} />
      {/* tapitas de las cámaras de los pernos */}
      {D.niveles.map((_, i) => (
        <rect key={i} x={cx(i) - 22} y={c.y0 - 8} width={44} height={14} rx={5} fill={COLOR.paper} stroke={COLOR.ink} strokeWidth={STROKE.thin + 1} />
      ))}
      {/* cara frontal en perspectiva: carcasa, rotor y bocallave */}
      <ellipse cx={caraCx} cy={caraCy} rx={66} ry={(c.y1 - c.y0) / 2} fill={COLOR.paper} stroke={COLOR.ink} strokeWidth={STROKE.piece} />
      <ellipse cx={caraCx + 4} cy={EJE} rx={34} ry={(D.rotor.y1 - D.rotor.y0) / 2} fill={COLOR.paper} stroke={COLOR.ink} strokeWidth={STROKE.piece} />
      <path d={`M${caraCx + 4} ${EJE - 80} L${caraCx + 10} ${EJE - 30} L${caraCx} ${EJE + 10} L${caraCx + 9} ${EJE + 80}`} fill="none" stroke={COLOR.bg} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};

export const Cerradura: React.FC<{ T: Timeline }> = ({ T }) => {
  const f = useCurrentFrame();

  // ── línea de corte: 30 % en el cuadro 0, completa en CORTE_FIN; al cierre se retrae y vuelve al 30 % (loop) ──
  const trayectoria = [
    { x: D.carcasa.x0 - 24, y: SHEAR },
    { x: D.carcasa.x1 + 80, y: SHEAR },
  ];
  const finRetrae = T.CIERRE + 10;
  let corte: { progreso: number; modo: "abre" | "cierra"; opacidad: number; brillo: number } = { progreso: 1, modo: "abre", opacidad: 0.55, brillo: 0 };
  if (f < T.CORTE_FIN) corte = { progreso: interpolate(f, [0, T.CORTE_FIN], [0.3, 1]), modo: "abre", opacidad: 1, brillo: 0 };
  else if (f < T.CIERRE) {
    const luzLinea = Math.max(between(f, T.ROTULO_LINEA, T.GIRO_FIN + 20, 10, 14), ramp(f, T.LUCES[0], 8) * (1 - ramp(f, T.GIRO_FIN + 10, 16)));
    corte = { progreso: 1, modo: "abre", opacidad: mix(interpolate(f, [T.CORTE_FIN, T.CORTE_FIN + 14], [1, 0.5], CLAMP), 1, luzLinea), brillo: between(f, T.DESTELLO, T.DESTELLO + 26, 4, 18) };
  } else if (f < finRetrae) corte = { progreso: ramp(f, T.CIERRE, 10, IN), modo: "cierra", opacidad: 0.8, brillo: 0 };
  else corte = { progreso: interpolate(f, [finRetrae, T.DURACION], [0, 0.3], CLAMP), modo: "abre", opacidad: 1, brillo: 0 };

  // ── apertura / cierre de la vista exterior ──
  const apertura = f < T.CIERRE ? ramp(f, T.APERTURA, 12, OUT) : 1 - ramp(f, T.CIERRE + 2, 24, EASE);
  const exterior = f < T.CIERRE ? 1 - ramp(f, T.APERTURA + 3, 12) : ramp(f, T.CIERRE + 2, 22);

  // ── la llave ──
  const usarMala = f >= T.LLAVE_SALE + 14;
  const punta =
    f < T.LLAVE_ENTRA
      ? interpolate(f, [T.LLAVE_ASOMA, T.LLAVE_MEDIA], [D.llave.puntaFuera, D.llave.puntaMitad], { ...CLAMP, easing: OUT })
      : f < T.LLAVE_SALE
        ? interpolate(f, [T.LLAVE_ENTRA, T.LLAVE_ADENTRO], [D.llave.puntaMitad, D.llave.puntaMontada], { ...CLAMP, easing: EASE })
        : f < T.MALA_ENTRA
          ? interpolate(f, [T.LLAVE_SALE, T.LLAVE_SALE + 14], [D.llave.puntaMontada, D.llave.puntaFuera], { ...CLAMP, easing: IN })
          : f < T.MALA_SALE
            ? interpolate(f, [T.MALA_ENTRA, T.MALA_ADENTRO], [D.llave.puntaFuera, D.llave.puntaMontada], { ...CLAMP, easing: EASE })
            : interpolate(f, [T.MALA_SALE, T.MALA_SALE + 18], [D.llave.puntaMontada, D.llave.puntaFuera], { ...CLAMP, easing: IN });
  const pts = usarMala ? PERFIL_MAL : PERFIL_OK;
  const llaveVisible = punta < D.llave.puntaFuera - 1;

  // ── giro del rotor (proyección de un giro alrededor del eje: lo de adentro se aplasta con cos θ) ──
  const giro = interpolate(f, [T.GIRO, T.GIRO_FIN], [0, 90], { ...CLAMP, easing: EASE }) * (1 - ramp(f, T.GIRO_VUELVE, 14, EASE));
  const intento = f >= T.INTENTO ? 7 * Math.sin(Math.min(Math.PI, ((f - T.INTENTO) / 6) * Math.PI)) * Math.exp(-(f - T.INTENTO) / 10) : 0;
  const theta = ((giro + Math.max(0, intento)) * Math.PI) / 180;
  const aplastar = Math.cos(theta);

  // ── columnas ──
  const latido = pulse(f, T.LATIDO);
  const columnas = D.niveles.map((nivel, i) => {
    const largo = largoPerno(nivel);
    const canto = llaveVisible ? cantoEn(pts, cx(i) - punta) : null;
    // el perno se apoya en el canto de la llave (si la llave está debajo) o en el fondo de su agujero
    const base = canto === null ? D.perno.reposo : Math.min(D.perno.reposo, canto);
    // cada columna «se asienta» con un golpecito cuando le toca su luz
    const golpe = f >= T.LUCES[i] && f < T.LUCES[i] + 14 ? -5 * Math.sin(((f - T.LUCES[i]) / 14) * Math.PI) : 0;
    const union = base - largo + golpe;
    const alineada = Math.abs(base - largo - SHEAR) < 1.5;
    return { i, nivel, largo, base: base + golpe, union, alineada };
  });
  const ok = (i: number) => columnas[i].alineada;

  // luces de los cortes (naranja al tocar la línea) y la columna que falla (rojo)
  const luz = (i: number) => {
    if (f < T.LLAVE_SALE) return ok(i) ? ramp(f, T.LUCES[i], 6, OUT) : 0;
    if (f >= T.MALA_MARCA && f < T.MALA_SALE) return ok(i) ? ramp(f, T.MALA_MARCA, 6, OUT) : 0;
    return 0;
  };
  const falla = (i: number) => (i === D.llaveIncorrecta.columna ? between(f, T.MALA_MARCA, T.MALA_SALE + 6, 6, 8) : 0);

  // ── resalte y cámara ──
  const resalte = between(f, T.RESALTE, T.RESALTE_SALE, 10, 10);
  const zoom = ramp(f, T.ZOOM, 20) * (1 - ramp(f, T.LLAVE_ENTRA, 20));
  const esc = 1 + 0.08 * zoom;
  const pivote = { x: 770, y: 900 };
  // deriva mínima de cámara (nada está quieto) que cierra el loop
  const deriva = 4 * Math.sin((2 * Math.PI * f) / T.DURACION);

  const cotas = (i: number) => {
    const at = i === D.columnaFoco ? T.COTA_FOCO : T.COTAS_RESTO + [0, 1, 2, 3, 4].filter((k) => k !== D.columnaFoco).indexOf(i) * 10;
    return { progreso: ramp(f, at, 16, OUT), at };
  };
  const cotasFuera = 1 - ramp(f, T.LLAVE_ENTRA - 10, 12);
  const digitos = 1 - ramp(f, T.CIERRE - 14, 12);

  const interior = (
    <Highlight activo={resalte} foco={[`col-${D.columnaFoco}`]}>
      <Interior T={T} f={f} columnas={columnas} luz={luz} falla={falla} aplastar={aplastar} punta={punta} pts={pts} llaveVisible={llaveVisible} latido={latido} />
    </Highlight>
  );

  return (
    <g>
      <Rayados />
      <g transform={`translate(0 ${deriva}) translate(${pivote.x} ${pivote.y}) scale(${esc}) translate(${-pivote.x} ${-pivote.y})`}>
        <SectionSplit id="cerradura" corteY={SHEAR} apertura={apertura} separacion={40} opacidadExterior={exterior} exterior={<Exterior />} interior={interior} />
        <CutLine trayectoria={trayectoria} progreso={corte.progreso} modo={corte.modo} opacidad={corte.opacidad} brillo={corte.brillo} />
        {/* marcas de cada corte sobre la línea */}
        {columnas.map((c) => (
          <g key={c.i}>
            {luz(c.i) > 0 ? <rect x={cx(c.i) - 34} y={SHEAR - 5} width={68} height={10} rx={5} fill={COLOR.signal} opacity={luz(c.i)} /> : null}
            {falla(c.i) > 0 ? <rect x={cx(c.i) - 34} y={c.union - 5} width={68} height={10} rx={5} fill={COLOR.error} opacity={falla(c.i)} /> : null}
          </g>
        ))}

        {/* 4–10 s: rótulos de las piezas */}
        <Rotulos T={T} f={f} columnas={columnas} />

        {/* 10–15 s: cotas (largo de cada perno = altura de su corte) */}
        <Highlight activo={resalte} foco={[`col-${D.columnaFoco}`]}>
          {columnas.map((c) => (
            <Cota key={c.i} i={c.i} desde={c.base} hasta={c.union} progreso={cotas(c.i).progreso * cotasFuera} />
          ))}
        </Highlight>
      </g>

      {/* valores de las cotas: el «código» de esta llave (niveles del dibujo, sin unidad) */}
      <g opacity={digitos}>
        {columnas.map((c) => {
          const p = cotas(c.i).progreso;
          return p > 0 ? <ValorCota key={c.i} i={c.i} p={p} resalte={resalte} enfoque={c.i === D.columnaFoco} final={ramp(f, T.CODIGO, 14, OUT)} /> : null;
        })}
      </g>

      {/* gancho: la pregunta ya está en el cuadro 0 y vuelve en el cierre (loop) */}
      <Pregunta opacidad={f < T.CIERRE ? 1 - ramp(f, T.PREGUNTA_SALE, 12, IN) : ramp(f, T.CIERRE + 6, 18, OUT)} />

      {/* 32–35 s: frase final y aviso */}
      <Final p={between(f, T.CODIGO, T.CIERRE + 4, 14, 12)} />
      <TeaserChip proximo={D.proximo} x={480} y={1196} ancho={620} progreso={between(f, T.AVISO, T.CIERRE + 22, 12, 14)} />
    </g>
  );
};

type Col = { i: number; nivel: number; largo: number; base: number; union: number; alineada: boolean };

const Interior: React.FC<{
  T: Timeline;
  f: number;
  columnas: Col[];
  luz: (i: number) => number;
  falla: (i: number) => number;
  aplastar: number;
  punta: number;
  pts: P[];
  llaveVisible: boolean;
  latido: number;
}> = ({ columnas, luz, falla, aplastar, punta, pts, llaveVisible, latido }) => {
  const c = D.carcasa;
  const r = D.rotor;
  const resto = useResalte("resto");
  const aplastado = `translate(0 ${EJE}) scale(1 ${aplastar}) translate(0 ${-EJE})`;
  return (
    <g>
      {/* carcasa (fija) con sus cámaras */}
      <g opacity={resto}>
        <rect x={c.x0} y={c.y0} width={c.x1 - c.x0} height={c.y1 - c.y0} rx={18} fill={COLOR.paper} stroke={COLOR.ink} strokeWidth={STROKE.piece} />
        <rect x={c.x0} y={c.y0} width={c.x1 - c.x0} height={c.y1 - c.y0} rx={18} fill="url(#raya-carcasa)" />
      </g>
      {columnas.map((col) => (
        <Camara key={col.i} col={col} latido={latido} />
      ))}
      {/* rotor (cuerpo fijo en la vista; lo de adentro se aplasta al girar) */}
      <g opacity={resto}>
        <rect x={r.x0} y={r.y0} width={r.x1 - r.x0} height={r.y1 - r.y0} fill={COLOR.paper} stroke={COLOR.ink} strokeWidth={STROKE.piece} />
        <rect x={r.x0} y={r.y0} width={r.x1 - r.x0} height={r.y1 - r.y0} fill="url(#raya-rotor)" />
      </g>
      <g transform={aplastado}>
        <g opacity={resto}>
          <rect x={r.x0 + 2} y={D.canal.y0} width={r.x1 - r.x0 + 2} height={D.canal.y1 - D.canal.y0} fill={COLOR.bg} />
        </g>
        {columnas.map((col) => (
          <AgujeroRotor key={col.i} i={col.i} />
        ))}
        {llaveVisible ? (
          <g opacity={resto}>
            <Llave punta={punta} pts={pts} />
          </g>
        ) : null}
        {columnas.map((col) => (
          <PernoInferior key={col.i} col={col} luz={luz(col.i)} falla={falla(col.i)} />
        ))}
      </g>
      {columnas.map((col) => (
        <Contraperno key={col.i} col={col} luz={luz(col.i)} falla={falla(col.i)} />
      ))}
    </g>
  );
};

const Camara: React.FC<{ col: Col; latido: number }> = ({ col, latido }) => {
  const o = useResalte(`col-${col.i}`);
  const w = D.camara.ancho;
  const x = cx(col.i);
  const tope = col.union - D.contraperno.largo;
  return (
    <g opacity={o}>
      <rect x={x - w / 2} y={D.camara.y0} width={w} height={SHEAR - D.camara.y0} fill={COLOR.bg} />
      <Spring x={x} yTop={D.camara.y0 + 2} yBottom={tope - 1} ancho={32 + latido * 6} espiras={7} />
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

const ValorCota: React.FC<{ i: number; p: number; resalte: number; enfoque: boolean; final: number }> = ({ i, p, resalte, enfoque, final }) => {
  const nivel = D.niveles[i];
  const o = enfoque ? 1 : 1 - 0.4 * resalte;
  return (
    <text x={cx(i)} y={1112 + (1 - p) * 10} textAnchor="middle" fill={COLOR.paper} opacity={p * o} style={{ ...TYPE.value, fontSize: mix(52, 60, final) }}>
      {nivel}
    </text>
  );
};

const Rotulos: React.FC<{ T: Timeline; f: number; columnas: Col[] }> = ({ T, f, columnas }) => {
  const sale = (a: number) => between(f, a, T.ROTULOS_SALEN + 10, 1, 10);
  const prog = (a: number) => ramp(f, a, 20, OUT);
  const R = PANTALLA.rotulos;
  const foco = columnas[D.columnaFoco];
  const x4 = cx(4);
  const finFoco = T.RESALTE_SALE + 6;
  return (
    <g>
      <Callout ancla={{ x: 118, y: 640 }} codo={{ x: 118, y: 470 }} rotulo={{ x: 140, y: 482 }} texto={R.carcasa} progreso={prog(T.ROTULOS.carcasa)} opacidad={sale(T.ROTULOS.carcasa)} />
      <Callout ancla={{ x: x4, y: 640 }} codo={{ x: x4 + 44, y: 470 }} rotulo={{ x: x4 + 66, y: 482 }} texto={R.resortes} progreso={prog(T.ROTULOS.resortes)} opacidad={sale(T.ROTULOS.resortes)} />
      <Callout ancla={{ x: 250, y: 1001 }} codo={{ x: 250, y: 1130 }} rotulo={{ x: 274, y: 1142 }} texto={R.rotor} progreso={prog(T.ROTULOS.rotor)} opacidad={sale(T.ROTULOS.rotor)} />
      <Callout ancla={{ x: x4 + 22, y: (columnas[4].union + columnas[4].base) / 2 }} codo={{ x: 690, y: 700 }} rotulo={{ x: 716, y: 712 }} texto={R.pernos} progreso={prog(T.ROTULOS.pernos)} opacidad={sale(T.ROTULOS.pernos)} />
      {/* 10–15 s: las dos piezas de la columna en foco */}
      <Callout ancla={{ x: cx(D.columnaFoco) + 22, y: foco.union - D.contraperno.largo / 2 }} codo={{ x: 690, y: 600 }} rotulo={{ x: 716, y: 612 }} texto={R.contra} progreso={prog(T.ROTULO_CONTRA)} opacidad={between(f, T.ROTULO_CONTRA, finFoco, 1, 10)} />
      <Callout ancla={{ x: cx(D.columnaFoco) + 22, y: (foco.union + foco.base) / 2 }} codo={{ x: 690, y: 770 }} rotulo={{ x: 716, y: 782 }} texto={R.perno} progreso={prog(T.ROTULO_PERNO)} opacidad={between(f, T.ROTULO_PERNO, finFoco, 1, 10)} />
      {/* 21–27 s: la línea de corte */}
      <Callout ancla={{ x: 660, y: SHEAR }} codo={{ x: 690, y: 690 }} rotulo={{ x: 714, y: 660 }} tam={36} texto={R.linea} progreso={prog(T.ROTULO_LINEA)} opacidad={between(f, T.ROTULO_LINEA, T.GIRO_FIN + 20, 1, 12)} color={COLOR.signal} />
    </g>
  );
};

const Pregunta: React.FC<{ opacidad: number }> = ({ opacidad }) => {
  if (opacidad <= 0) return null;
  const [l1, l2] = PANTALLA.pregunta;
  const [antes, despues] = l2.split("TU");
  return (
    <g opacity={opacidad}>
      <text x={540} y={352} textAnchor="middle" fill={COLOR.paper} style={TYPE.title}>
        {l1}
      </text>
      <text x={540} y={446} textAnchor="middle" fill={COLOR.paper} style={TYPE.title}>
        {antes}
        <tspan fill={COLOR.signal}>TU</tspan>
        {despues}
      </text>
    </g>
  );
};

const Final: React.FC<{ p: number }> = ({ p }) => {
  if (p <= 0) return null;
  return (
    <g opacity={p} transform={`translate(0 ${(1 - p) * 16})`}>
      <text x={540} y={330} textAnchor="middle" fill={COLOR.paper} style={{ ...TYPE.label, fontSize: 48 }}>
        {PANTALLA.final}
      </text>
      <text x={540} y={448} textAnchor="middle" fill={COLOR.signal} style={{ ...TYPE.value, fontSize: 112, letterSpacing: "0.12em" }}>
        {D.niveles.join(" ")}
      </text>
    </g>
  );
};
