import React from "react";
import { AbsoluteFill } from "remotion";
import { DecoyV3 } from "./decoy-v3/DecoyV3";
import { DecoyV2 } from "./decoy-v2/DecoyV2";

/** Hoja comparativa: los mismos momentos de la historia en V1 (arriba) y V2 (abajo). */

export const COMPARE23_FRAMES = [
  { f: 30, label: '1.0 s · camina' },
  { f: 110, label: '3.7 s · duda' },
  { f: 160, label: '5.3 s · señala' },
  { f: 218, label: '7.3 s · precios' },
  { f: 238, label: '7.9 s · sorpresa' },
  { f: 272, label: '9.1 s · agarre' },
  { f: 297, label: '9.9 s · ironía' },
];

const PW = 300;
const PH = (PW * 1920) / 1080;
const GAP = 16;
const TOP = 70;
const LABEL = 46;

export const COMPARE23_W = COMPARE23_FRAMES.length * (PW + GAP) + GAP + 70;
export const COMPARE23_H = TOP + 2 * (PH + LABEL) + GAP * 3;

const Panel: React.FC<{ children: React.ReactNode; x: number; y: number }> = ({ children, x, y }) => (
  <div style={{ position: "absolute", left: x, top: y, width: PW, height: PH, overflow: "hidden", borderRadius: 12 }}>
    <div style={{ width: 1080, height: 1920, transform: `scale(${PW / 1080})`, transformOrigin: "0 0", position: "relative" }}>
      {children}
    </div>
  </div>
);

const font = "'Segoe Print', 'Comic Sans MS', cursive";

export const CompareV2V3: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#2A2024", fontFamily: font, color: "#F4EFE3" }}>
    <div style={{ position: "absolute", left: 24, top: 14, fontSize: 34, fontWeight: 700 }}>Efecto señuelo · V2 (arriba) vs V3 (abajo)</div>
    {[0, 1].map((row) => (
      <div
        key={row}
        style={{
          position: "absolute",
          left: 10,
          top: TOP + row * (PH + LABEL + GAP) + PH / 2 - 20,
          fontSize: 30,
          fontWeight: 700,
          color: row ? "#2BB3A3" : "#B9A894",
        }}
      >
        {row ? "V3" : "V2"}
      </div>
    ))}
    {COMPARE23_FRAMES.map(({ f, label }, i) => {
      const x = 70 + GAP + i * (PW + GAP);
      return (
        <React.Fragment key={f}>
          <Panel x={x} y={TOP}>
            <DecoyV2 inst={`d${i}`} frame={f} />
          </Panel>
          <Panel x={x} y={TOP + PH + LABEL + GAP}>
            <DecoyV3 inst={`e${i}`} frame={f} />
          </Panel>
          <div style={{ position: "absolute", left: x, top: TOP + PH + 6, width: PW, textAlign: "center", fontSize: 22 }}>{label}</div>
        </React.Fragment>
      );
    })}
  </AbsoluteFill>
);
