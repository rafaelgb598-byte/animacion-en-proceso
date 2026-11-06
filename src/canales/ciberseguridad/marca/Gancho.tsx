// Gancho: pregunta directa grande arriba y las dos opciones (PASAR / NO) abajo, visibles desde el fotograma 0.
// Las opciones ocupan el carril de subtítulos SOLO mientras los subtítulos están ocultos.
import React from "react";
import { interpolate } from "remotion";
import { CENTRO_X } from "../../../canal/zonaSegura";
import { CLAMP, between } from "./anim";
import { ALPHA, COLOR, TYPE } from "./theme";
import type { Episodio } from "./tipos";

export const GANCHO_LAYOUT = { preguntaTop: 296, preguntaSize: 104, opcionesTop: 1336, opcionW: 300, opcionH: 112, separacion: 40 } as const;

export const posicionOpcion = (i: number) => {
  const { opcionW, separacion, opcionesTop, opcionH } = GANCHO_LAYOUT;
  const x0 = CENTRO_X - opcionW - separacion / 2 + i * (opcionW + separacion);
  return { x: x0 + opcionW / 2, y: opcionesTop + opcionH / 2 };
};

export const Gancho: React.FC<{ ep: Episodio; f: number }> = ({ ep, f }) => {
  const g = ep.gancho;
  const op = g.visible(f);
  if (op <= 0) return null;
  const L = GANCHO_LAYOUT;
  // la opción elegida queda marcada solo mientras se va el gancho (en el loop vuelve sin elegir)
  const elegida = between(f, g.elegida.f - 4, g.elegida.f + 30, 4, 4);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: op }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: L.preguntaTop, textAlign: "center", ...TYPE.headline, fontSize: L.preguntaSize, lineHeight: 1, color: COLOR.text, transform: `translateY(${(1 - op) * -16}px)` }}>
        {g.pregunta}
      </div>
      {g.opciones.map((o, i) => {
        const p = posicionOpcion(i);
        const on = i === g.elegida.indice ? elegida : 0;
        return (
          <div
            key={o}
            style={{
              position: "absolute",
              left: p.x - L.opcionW / 2,
              top: L.opcionesTop,
              width: L.opcionW,
              height: L.opcionH,
              borderRadius: L.opcionH / 2,
              border: `4px solid ${COLOR.text}`,
              background: on > 0.5 ? COLOR.text : ALPHA.glass,
              color: on > 0.5 ? COLOR.bg : COLOR.text,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              ...TYPE.headline,
              fontSize: 66,
              transform: `scale(${1 - on * 0.05}) translateY(${(1 - op) * 20}px)`,
            }}
          >
            {o}
          </div>
        );
      })}
    </div>
  );
};

/** Dedo (círculo de toque): sigue la ruta, se hunde en cada toque. */
export const Dedo: React.FC<{ ep: Episodio; f: number }> = ({ ep, f }) => {
  const d = ep.telefono.dedo;
  if (f < d.desde || f > d.hasta) return null;
  const r = d.ruta;
  let x = r[0].x;
  let y = r[0].y;
  for (let i = 1; i < r.length; i++) {
    if (f >= r[i - 1].f && f <= r[i].f) {
      const t = interpolate(f, [r[i - 1].f, r[i].f], [0, 1], { ...CLAMP, easing: (k) => k * k * (3 - 2 * k) });
      x = r[i - 1].x + (r[i].x - r[i - 1].x) * t;
      y = r[i - 1].y + (r[i].y - r[i - 1].y) * t;
    } else if (f > r[i].f) {
      x = r[i].x;
      y = r[i].y;
    }
  }
  const toque = Math.max(0, ...ep.telefono.toques.map((t) => interpolate(f, [t.f - 3, t.f, t.f + 5], [0, 1, 0], CLAMP)));
  const op = Math.min(interpolate(f, [d.desde, d.desde + 8], [0, 1], CLAMP), interpolate(f, [d.hasta - 8, d.hasta], [1, 0], CLAMP));
  const R = 44 * (1 - toque * 0.18);
  return (
    <div style={{ position: "absolute", left: x - R, top: y - R, width: R * 2, height: R * 2, borderRadius: R, background: ALPHA.finger, border: `4px solid ${ALPHA.fingerRing}`, opacity: op, boxShadow: `0 0 0 ${toque * 26}px ${ALPHA.finger}` }} />
  );
};
