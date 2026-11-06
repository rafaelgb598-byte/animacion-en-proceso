import React from "react";
import { CLAMP, OUT_CUBIC } from "../../lib/anim";
import { FONTS, LAYOUT, TYPE, UI } from "../../theme";
import { jumpAt, JUMP_ENDS, MILESTONES, WEEK } from "../../timeline";
import { interpolate } from "remotion";

export const fmtThousands = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const milestoneAt = (year: number) => {
  let m: (typeof MILESTONES)[number] = MILESTONES[0];
  for (const ms of MILESTONES) if (year >= ms.year - 1e-9) m = ms;
  return m;
};

/** Valor que rueda durante un salto: días, semanas o años reales (Math.floor). */
const rolling = (year: number): { prefix: string; value: number } => {
  if (year < WEEK) return { prefix: "DÍA ", value: year * 365 };
  if (year < 1) return { prefix: "SEMANA ", value: year * 52.18 };
  return { prefix: "AÑO ", value: year };
};

const LINE = TYPE.counter * 1.1;

const RollingNumber: React.FC<{ value: number }> = ({ value }) => {
  const n = Math.floor(value);
  const raw = value - n;
  const frac = Math.min(1, Math.max(0, (raw - 0.65) / 0.35));
  const head = fmtThousands(n).slice(0, -1);
  const last = n % 10;
  return (
    <span style={{ display: "inline-flex" }}>
      <span style={{ whiteSpace: "pre" }}>{head}</span>
      <span style={{ display: "inline-block", height: LINE, overflow: "hidden", verticalAlign: "top" }}>
        <span style={{ display: "flex", flexDirection: "column", transform: `translateY(${-frac * LINE}px)` }}>
          <span style={{ height: LINE }}>{last}</span>
          <span style={{ height: LINE }}>{(last + 1) % 10}</span>
        </span>
      </span>
    </span>
  );
};

/** Contador de años (x 100, y 300 línea base; Plex Mono 700, 72 px, ámbar). */
export const OdometerCounter: React.FC<{ frame: number; year: number }> = ({ frame, year }) => {
  const j = jumpAt(frame);
  const lastEnd = [...JUMP_ENDS].reverse().find((e) => frame >= e);
  const click = lastEnd !== undefined ? interpolate(frame - lastEnd, [0, 5], [1.06, 1], CLAMP) : 1;
  const ms = milestoneAt(year);
  const wordsOp = j ? 0 : lastEnd !== undefined ? interpolate(frame - lastEnd, [4, 14], [0, 1], { ...CLAMP, easing: OUT_CUBIC }) : 0;
  const r = rolling(year);
  return (
    <div
      style={{
        position: "absolute",
        left: LAYOUT.counter.x,
        top: LAYOUT.counter.y - TYPE.counter - 6,
        fontFamily: FONTS.mono,
        fontVariantNumeric: "tabular-nums",
        textShadow: `0 2px 14px ${UI.shadow}`,
        padding: "6px 18px 10px",
        marginLeft: -18,
        borderRadius: 14,
        background: UI.veilStrong,
      }}
    >
      <div
        style={{
          fontWeight: 700,
          fontSize: TYPE.counter,
          lineHeight: `${LINE}px`,
          height: LINE,
          color: UI.amber,
          transformOrigin: "0% 50%",
          transform: `scale(${j ? 1 : click})`,
          whiteSpace: "nowrap",
        }}
      >
        {j ? (
          <span style={{ display: "inline-flex" }}>
            <span style={{ whiteSpace: "pre" }}>{r.prefix}</span>
            <RollingNumber value={r.value} />
          </span>
        ) : (
          ms.label
        )}
      </div>
      <div style={{ fontWeight: 500, fontSize: TYPE.counterSub, color: UI.ash, marginTop: 6, opacity: ms.words ? wordsOp : 0 }}>
        {ms.words || " "}
      </div>
    </div>
  );
};
