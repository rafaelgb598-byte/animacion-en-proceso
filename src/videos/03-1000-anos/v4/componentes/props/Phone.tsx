import React from "react";
import { AbsoluteFill, random } from "remotion";
import { aluminumDull, aluminumPits, batterySwell, dust, mix, mixColor, phoneBodyLoss } from "../../decay";
import { TAU } from "../../lib/anim";
import { buzzOffset, screenOn } from "../../lib/power";
import { onSupport } from "../../lib/support";
import { MAT } from "../../theme";
import { PERIOD } from "../../timeline";
import type { SceneBaseProps } from "../../types";
import { DustFilter } from "../svg";
import { DogScreen } from "./DogScreen";

export type PhoneSpec = {
  x: number; y: number; w: number; h: number; rot: number; radius: number; tilt: number; restTilt: number;
  restX: number; restY: number;
};

const INSET = 8;

/** Posición del celular en el mundo (baja con el colapso de la mesa). */
export const phonePose = (spec: PhoneSpec, year: number, frame: number) => {
  const s = onSupport(year, frame, 1, 1);
  return {
    x: mix(spec.x, spec.restX, s.t) + buzzOffset(frame),
    y: mix(spec.y, spec.restY, s.t),
    rot: spec.rot - 6 * s.t,
    tilt: mix(spec.tilt, spec.restTilt, s.t),
  };
};

/** Puerto inferior proyectado (para el cable). */
export const phonePort = (spec: PhoneSpec, year: number, frame: number) => {
  const p = phonePose(spec, year, frame);
  const half = (spec.h / 2) * Math.cos((p.tilt * Math.PI) / 180) * 1.12;
  const a = (p.rot * Math.PI) / 180;
  return { x: p.x - Math.sin(a) * half, y: p.y + Math.cos(a) * half };
};

/**
 * Celular apoyado sobre la tapa (CSS 3D con perspectiva local, sin intersecciones con la mesa).
 * Prop principal: year. frame solo para vibración, pulso de brillo, destello y fantasma.
 */
export const Phone: React.FC<SceneBaseProps & { spec: PhoneSpec; glint: number | null; ghost: number }> = ({ year, frame, spec, glint, ghost }) => {
  const pose = phonePose(spec, year, frame);
  const on = screenOn(frame);
  const pulse = 1 + 0.04 * Math.sin((frame / PERIOD.screenPulse) * TAU);
  const swell = batterySwell(year);
  const dull = aluminumDull(year);
  const pits = aluminumPits(year);
  const loss = phoneBodyLoss(year);
  const d = Math.max(0, dust(year));
  const frameCol = mixColor(MAT.aluminum, MAT.aluminumDull, dull);
  const gw = spec.w - INSET * 2;
  const gh = spec.h - INSET * 2;

  return (
    <AbsoluteFill style={{ perspective: 1300, perspectiveOrigin: `${pose.x}px ${pose.y - 260}px` }}>
      {/* sombra de contacto */}
      <div
        style={{
          position: "absolute",
          left: pose.x - spec.w * 0.62,
          top: pose.y - spec.h * 0.2,
          width: spec.w * 1.24,
          height: spec.h * 0.48,
          borderRadius: "50%",
          background: MAT.black,
          opacity: 0.45 * (1 - loss),
          filter: "blur(16px)",
          transform: `rotate(${pose.rot}deg)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: pose.x - spec.w / 2,
          top: pose.y - spec.h / 2,
          width: spec.w,
          height: spec.h,
          transformStyle: "preserve-3d",
          transform: `rotateX(${pose.tilt}deg) rotateZ(${pose.rot}deg)`,
        }}
      >
        {/* cuerpo + marco de aluminio */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: spec.radius,
            background: MAT.phoneBody,
            boxShadow: `inset 0 0 0 5px ${frameCol}, inset 0 0 0 7px ${MAT.black}`,
            opacity: 1 - loss,
          }}
        >
          <svg width={spec.w} height={spec.h} style={{ position: "absolute", inset: 0 }}>
            {/* brillo del marco */}
            <rect x={2.5} y={2.5} width={spec.w - 5} height={spec.h - 5} rx={spec.radius - 2} fill="none" stroke={MAT.specular} strokeOpacity={0.35 * (1 - dull)} strokeWidth={1.5} />
            {Array.from({ length: 26 }, (_, i) => {
              if (random(`pit-on-${i}`) > pits) return null;
              const side = i % 4;
              const u = random(`pit-u-${i}`);
              const x = side === 0 ? 3 : side === 1 ? spec.w - 3 : u * spec.w;
              const y = side === 2 ? 3 : side === 3 ? spec.h - 3 : u * spec.h;
              return <circle key={i} cx={x} cy={y} r={1.5 + random(`pit-r-${i}`) * 2} fill={MAT.phoneBody} />;
            })}
            {/* puerto */}
            <rect x={spec.w / 2 - 16} y={spec.h - 6} width={32} height={4} rx={2} fill={MAT.black} />
          </svg>
        </div>
        {/* vidrio (se levanta desde el borde inferior cuando la batería se hincha) */}
        <div
          style={{
            position: "absolute",
            left: INSET,
            top: INSET,
            width: gw,
            height: gh,
            borderRadius: spec.radius - INSET,
            overflow: "hidden",
            background: MAT.glass,
            transformOrigin: "50% 0%",
            transform: `translateZ(1px) rotateX(${4 * swell}deg)`,
          }}
        >
          <div style={{ position: "absolute", inset: 0, opacity: on * pulse }}>
            <DogScreen w={gw} h={gh} id="uep-dog" />
          </div>
          {ghost > 0 ? (
            <div style={{ position: "absolute", inset: 0, opacity: ghost }}>
              <DogScreen w={gw} h={gh} id="uep-dog-ghost" />
            </div>
          ) : null}
          <svg width={gw} height={gh} style={{ position: "absolute", inset: 0 }}>
            <defs>
              <DustFilter id="uep-phone-dust" seed={52} />
              <linearGradient id="uep-glint" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor={MAT.specular} stopOpacity={0} />
                <stop offset="0.5" stopColor={MAT.specular} stopOpacity={0.85} />
                <stop offset="1" stopColor={MAT.specular} stopOpacity={0} />
              </linearGradient>
            </defs>
            {/* borde del vidrio: lo que lo hace legible cuando queda solo */}
            <rect x={0.75} y={0.75} width={gw - 1.5} height={gh - 1.5} rx={spec.radius - INSET} fill="none" stroke={MAT.specular} strokeOpacity={0.18 + 0.25 * loss} strokeWidth={1.5} />
            {/* cámara frontal (hardware, sin íconos) */}
            <circle cx={gw / 2} cy={18} r={5} fill={MAT.black} opacity={0.9} />
            {/* reflejo especular de la ventana (22 %) */}
            <polygon points={`${gw * 0.08},${gh * 0.05} ${gw * 0.5},${gh * 0.02} ${gw * 0.32},${gh * 0.62} ${gw * -0.05},${gh * 0.7}`} fill={MAT.specular} opacity={(0.22 + 0.18 * loss) * (1 - on * 0.6)} />
            {/* polvo: no tapa del todo el especular */}
            {d > 0.001 ? (
              <g opacity={d * 0.45}>
                <rect width={gw} height={gh} fill={MAT.dust} opacity={0.25} />
                <rect width={gw} height={gh} fill={MAT.dust} filter="url(#uep-phone-dust)" />
              </g>
            ) : null}
            {glint !== null ? (
              <rect x={-gw * 1.2 + glint * gw * 2.6} y={-gh * 0.2} width={gw * 0.55} height={gh * 1.4} fill="url(#uep-glint)" transform={`rotate(-24 ${gw / 2} ${gh / 2})`} />
            ) : null}
          </svg>
        </div>
        {/* línea de luz en la junta cuando el vidrio se levanta */}
        {swell > 0.01 ? (
          <div
            style={{
              position: "absolute",
              left: INSET + 6,
              top: spec.h - INSET - 3,
              width: gw - 12,
              height: 5,
              background: MAT.specular,
              opacity: 0.95 * swell * (1 - loss),
              transform: "translateZ(0.5px)",
            }}
          />
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
