// Texto enriquecido de la app de chat: `\n` renglones fijos, `[frase]` marcable, `{icono}` SVG.
import React from "react";
import { COLOR, MARKER } from "../theme";
import { ICONOS } from "./Iconos";

type Trozo = { tipo: "texto"; t: string } | { tipo: "frase"; t: string; i: number } | { tipo: "icono"; nombre: string };

export const trozos = (renglon: string, base = 0): { partes: Trozo[]; frases: number } => {
  const partes: Trozo[] = [];
  const re = /\[([^\]]+)\]|\{(\w+)\}/g;
  let last = 0;
  let k = base;
  let m: RegExpExecArray | null;
  while ((m = re.exec(renglon))) {
    if (m.index > last) partes.push({ tipo: "texto", t: renglon.slice(last, m.index) });
    if (m[1] !== undefined) partes.push({ tipo: "frase", t: m[1], i: k++ });
    else partes.push({ tipo: "icono", nombre: m[2] });
    last = m.index + m[0].length;
  }
  if (last < renglon.length) partes.push({ tipo: "texto", t: renglon.slice(last) });
  return { partes, frases: k - base };
};

/** texto plano (sin marcas): para contar o comparar */
export const plano = (r: string) => r.replace(/\[([^\]]+)\]/g, "$1").replace(/\{\w+\}/g, "").replace(/\n/g, " ");

export const RichText: React.FC<{ texto: string; marcadas?: Record<number, number>; iconSize?: number; color?: string; /** se agrega al final del último renglón (hora) */ cola?: React.ReactNode }> = ({
  texto,
  marcadas = {},
  iconSize = 40,
  color = COLOR.text,
  cola,
}) => {
  let base = 0;
  const renglones = texto.split("\n");
  return (
    <>
      {renglones.map((renglon, ri) => {
        const { partes, frases } = trozos(renglon, base);
        base += frases;
        return (
          <div key={ri} style={{ whiteSpace: "nowrap" }}>
            {partes.map((p, pi) => {
              if (p.tipo === "texto") return <span key={pi}>{p.t}</span>;
              if (p.tipo === "icono") {
                const I = ICONOS[p.nombre];
                return I ? <I key={pi} size={iconSize} color={color} /> : null;
              }
              const m = marcadas[p.i] ?? 0;
              return (
                <span key={pi} style={{ position: "relative", display: "inline-block" }}>
                  {p.t}
                  <span
                    style={{
                      position: "absolute",
                      left: 0,
                      bottom: -2,
                      height: MARKER.guide + 1,
                      width: `${m * 100}%`,
                      background: COLOR.evidence,
                      borderRadius: 2,
                    }}
                  />
                </span>
              );
            })}
            {ri === renglones.length - 1 ? cola : null}
          </div>
        );
      })}
    </>
  );
};
