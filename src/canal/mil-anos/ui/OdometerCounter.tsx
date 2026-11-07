import React from "react";
import { interpolate } from "remotion";
import { CLAMP } from "../anim";
import type { Clock } from "../clock";
import { SERIES_FONTS, SERIES_LAYOUT, SERIES_TYPE, SERIES_UI } from "../theme";

export const fmtThousands = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const LINE = SERIES_TYPE.counter * 1.1;

const RollingNumber: React.FC<{ value: number }> = ({ value }) => {
  const n = Math.max(1, Math.floor(value));
  const raw = value - Math.floor(value);
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

/**
 * Contador de la serie (Plex Mono 700, 88 px, ámbar, con velo) en (100, 330).
 * Igual al del celular v4, pero lee el reloj del episodio por props (unidades DÍA / SEMANA / MES / AÑO configurables).
 */
export const OdometerCounter: React.FC<{ frame: number; year: number; opacity: number; clock: Clock }> = ({ frame, year, opacity, clock }) => {
  if (opacity <= 0.001) return null;
  const rolling = clock.rollingAt(frame) && year > 0;
  const lastEnd = [...clock.rollEnds].reverse().find((e) => frame >= e && e < clock.loopCut);
  const click = lastEnd !== undefined && frame < clock.loopCut ? interpolate(frame - lastEnd, [0, 5], [1.06, 1], CLAMP) : 1;
  const unit = clock.unitAt(year);
  return (
    <div
      style={{
        position: "absolute",
        left: SERIES_LAYOUT.counter.x,
        top: SERIES_LAYOUT.counter.y - SERIES_TYPE.counter - 6,
        opacity,
        fontFamily: SERIES_FONTS.mono,
        fontVariantNumeric: "tabular-nums",
        textShadow: `0 2px 14px ${SERIES_UI.shadow}`,
        padding: "6px 18px 10px",
        marginLeft: -18,
        borderRadius: 14,
        background: SERIES_UI.veilStrong,
      }}
    >
      <div
        style={{
          fontWeight: 700,
          fontSize: SERIES_TYPE.counter,
          lineHeight: `${LINE}px`,
          height: LINE,
          color: SERIES_UI.amber,
          transformOrigin: "0% 50%",
          transform: `scale(${rolling ? 1 : click})`,
          whiteSpace: "nowrap",
        }}
      >
        {rolling ? (
          <span style={{ display: "inline-flex" }}>
            <span style={{ whiteSpace: "pre" }}>{unit.prefix}</span>
            <RollingNumber value={year * unit.perYear} />
          </span>
        ) : (
          clock.milestoneAt(year).label
        )}
      </div>
    </div>
  );
};
