import React from "react";
import { random } from "remotion";
import { airDust, lightRegime, mixColor } from "../../decay";
import { TAU } from "../../lib/anim";
import { lampOn, screenOn } from "../../lib/power";
import { LIGHT, MASK, MAT } from "../../theme";
import { PERIOD } from "../../timeline";
import type { LightRig, SceneBaseProps } from "../../types";
import { Svg } from "../svg";
import { warpFrame } from "./TimeFlicker";

/** Color de la luz dominante según el régimen (sección 4.4). */
export const lightColor = (year: number, frame: number): string => {
  const { day, broken, exterior } = lightRegime(year);
  let c = mixColor(LIGHT.lamp, LIGHT.window, Math.max(day, 1 - lampOn(frame)));
  c = mixColor(c, LIGHT.broken, broken);
  return mixColor(c, LIGHT.exterior, exterior);
};

/** Capas de luz por código: oscuridad con huecos, tinte, haz de la ventana, focos y polvo en suspensión. */
export const Light: React.FC<SceneBaseProps & { rig: LightRig }> = ({ year, frame, rig }) => {
  const lamp = lampOn(frame);
  const scr = screenOn(frame);
  const { day, broken, exterior } = lightRegime(year);
  const breath = 1 + 0.02 * Math.sin((frame / PERIOD.lampBreath) * TAU);
  const lampW = lamp * (1 - day) * breath;
  const windowW = day * (1 - exterior);
  const dark = (0.86 - 0.4 * day) * (1 - exterior) + 0.12 * exterior;
  const tint = lightColor(year, frame);
  const beamW = windowW * (0.16 + 0.08 * broken);
  const spread = 1 + 0.35 * broken;
  const beam = rig.beam.map(([bx, by], i) => {
    const wx = i < 2 ? bx : rig.window.x + (bx - rig.window.x) * spread;
    return `${wx},${by}`;
  });
  const dustOp = airDust(year);
  const wf = warpFrame(frame);
  const bx0 = Math.min(...rig.beam.map((p) => p[0]));
  const bx1 = Math.max(...rig.beam.map((p) => p[0])) * spread;
  const by0 = Math.min(...rig.beam.map((p) => p[1]));
  const by1 = Math.max(...rig.beam.map((p) => p[1]));
  return (
    <Svg>
      <defs>
        <radialGradient id="uep-hole-lamp">
          <stop offset="0" stopColor={MASK.hide} />
          <stop offset="0.55" stopColor={MASK.hide} stopOpacity={0.6} />
          <stop offset="1" stopColor={MASK.hide} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="uep-glow-lamp">
          <stop offset="0" stopColor={LIGHT.lamp} stopOpacity={0.55} />
          <stop offset="1" stopColor={LIGHT.lamp} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="uep-glow-screen">
          <stop offset="0" stopColor={LIGHT.screen} stopOpacity={0.35} />
          <stop offset="1" stopColor={LIGHT.screen} stopOpacity={0} />
        </radialGradient>
        <linearGradient id="uep-beam" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={tint} stopOpacity={1} />
          <stop offset="1" stopColor={tint} stopOpacity={0} />
        </linearGradient>
        <mask id="uep-dark-mask">
          <rect x={-300} y={-300} width={1680} height={2520} fill={MASK.show} />
          <circle cx={rig.lampPool.x} cy={rig.lampPool.y} r={rig.lampPool.r} fill="url(#uep-hole-lamp)" opacity={lampW} />
          <circle cx={rig.window.x + rig.window.w} cy={rig.window.y + rig.window.h + 380} r={820} fill="url(#uep-hole-lamp)" opacity={windowW * 0.8} />
          <circle cx={rig.screenGlow.x} cy={rig.screenGlow.y} r={rig.screenGlow.r} fill="url(#uep-hole-lamp)" opacity={0.5 * scr * (1 - day)} />
        </mask>
        <filter id="uep-beam-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={28} />
        </filter>
        <clipPath id="uep-beam-clip">
          <polygon points={beam.join(" ")} />
        </clipPath>
      </defs>
      <rect x={-300} y={-300} width={1680} height={2520} fill={MAT.bg} opacity={dark} mask="url(#uep-dark-mask)" />
      <rect x={-300} y={-300} width={1680} height={2520} fill={tint} opacity={0.22} style={{ mixBlendMode: "soft-light" }} />
      <circle cx={rig.lampPool.x} cy={rig.lampPool.y} r={rig.lampPool.r * 0.9} fill="url(#uep-glow-lamp)" opacity={lampW} style={{ mixBlendMode: "screen" }} />
      <circle cx={rig.screenGlow.x} cy={rig.screenGlow.y} r={rig.screenGlow.r} fill="url(#uep-glow-screen)" opacity={scr * (1 - day)} style={{ mixBlendMode: "screen" }} />
      {beamW > 0.002 ? <polygon points={beam.join(" ")} fill="url(#uep-beam)" opacity={beamW} filter="url(#uep-beam-blur)" style={{ mixBlendMode: "screen" }} /> : null}
      {dustOp > 0.01 ? (
        <g clipPath="url(#uep-beam-clip)" opacity={dustOp * Math.min(1, windowW * 1.5)}>
          {Array.from({ length: 40 }, (_, i) => {
            const px = bx0 + random(`dust-${i}-x`) * (bx1 - bx0);
            const py = by0 + random(`dust-${i}-y`) * (by1 - by0);
            const ph = random(`dust-${i}-p`) * TAU;
            const dx = Math.sin(wf / PERIOD.dustDrift * TAU + ph) * 22;
            const dy = Math.cos((wf / PERIOD.dustDrift) * TAU * 0.5 + ph) * 30;
            return (
              <circle key={i} cx={px + dx} cy={py + dy} r={1 + random(`dust-${i}-r`) * 1} fill={MAT.dust} opacity={0.15 + random(`dust-${i}-o`) * 0.2} />
            );
          })}
        </g>
      ) : null}
    </Svg>
  );
};
