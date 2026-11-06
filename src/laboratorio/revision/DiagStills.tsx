import React from "react";
import { lerp, smooth } from "../../canal/personaje/anim";
import { COUNTER_TOP, FLOOR } from "../../canal/escenarios/cafeteria/CafeV2";
import { getTimeline as tlV2, GRAB as GRAB2, GRIP_L as GRIP2, cupL as cupL2 } from "../../videos/01-efecto-senuelo/historial/v2/timeline";
import * as V3 from "../../videos/01-efecto-senuelo/historial/v3/timelineV3";
import { DiagText, runDiagnostics } from "./Diagnostics";
import { getCafe } from "../../videos/01-efecto-senuelo/short-final/cafe";

export const DiagV2: React.FC = () => {
  const tl = tlV2();
  const cupBottomY = (f: number) => {
    const magnet = smooth((f - (GRAB2 - 4)) / 4);
    if (f >= GRAB2) return tl.palm[f].y + GRIP2;
    return lerp(COUNTER_TOP, tl.palm[f].y + GRIP2, magnet);
  };
  const lines = runDiagnostics({
    name: "V2",
    poses: tl.poses,
    rigs: tl.rigs,
    floor: FLOOR,
    grab: { from: 250, to: 270, target: (f) => ({ x: cupL2(f), y: COUNTER_TOP - GRIP2 }), hand: (f) => tl.palm[f] },
    cupBottom: { from: 256, to: 298, y: cupBottomY, counter: COUNTER_TOP },
  });
  return <DiagText lines={lines} />;
};

export const DiagV3: React.FC = () => {
  const tl = V3.getTimeline();
  const lines = runDiagnostics({
    name: "V3",
    poses: tl.poses,
    rigs: tl.rigs,
    floor: FLOOR,
    ...V3.diagnosticsExtra(),
  });
  return <DiagText lines={lines} />;
};

export const DiagFinal: React.FC = () => {
  const tl = getCafe();
  const lines = runDiagnostics({ name: "Short final · cafetería", poses: tl.poses, rigs: tl.rigs, floor: FLOOR });
  return <DiagText lines={lines} />;
};
