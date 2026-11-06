import React from "react";
import { AbsoluteFill } from "remotion";
import { localToScene, type Pose, type Rig, type Vec } from "../../character/rig";

/**
 * Herramientas de revisión (no forman parte de ningún video).
 * Diagnostics: métricas numéricas por fotograma, mostradas como texto en un still.
 */

export type DiagInput = {
  name: string;
  poses: Pose[];
  rigs: Rig[];
  floor: number;
  /** posición de la mano respecto del objetivo de agarre (opcional) */
  grab?: { from: number; to: number; target: (f: number) => Vec; hand: (f: number) => Vec };
  cupBottom?: { from: number; to: number; y: (f: number) => number; counter: number };
};

const fmt = (n: number) => n.toFixed(1).padStart(6);

export const runDiagnostics = (d: DiagInput): string[] => {
  const out: string[] = [`== ${d.name} ==`];
  const N = d.poses.length;
  // 1) deslizamiento de pies: un pie apoyado (tobillo a menos de 3 px del nivel mínimo) que se mueve en x
  const slips: { f: number; leg: string; dx: number }[] = [];
  for (let f = 1; f < N; f++) {
    for (const leg of ["F", "B"] as const) {
      const a0 = localToScene(d.poses[f - 1], leg === "F" ? d.rigs[f - 1].legF.ankle : d.rigs[f - 1].legB.ankle);
      const a1 = localToScene(d.poses[f], leg === "F" ? d.rigs[f].legF.ankle : d.rigs[f].legB.ankle);
      const groundY = d.floor - 25 * d.poses[f].scale;
      const planted = Math.abs(a0.y - groundY) < 3 && Math.abs(a1.y - groundY) < 3;
      if (planted && Math.abs(a1.x - a0.x) > 1.5) slips.push({ f, leg, dx: a1.x - a0.x });
    }
  }
  const total = slips.reduce((s, x) => s + Math.abs(x.dx), 0);
  out.push(`Pies apoyados que patinan: ${slips.length} fotogramas · total ${total.toFixed(0)} px`);
  const worst = [...slips].sort((a, b) => Math.abs(b.dx) - Math.abs(a.dx)).slice(0, 8);
  out.push("  peores: " + worst.map((s) => `f${s.f}${s.leg}:${s.dx.toFixed(1)}`).join("  "));

  // 2) saltos bruscos de expresión (cambio por fotograma)
  const keys = ["browLiftL", "browLiftR", "smile", "mouthOpen", "mouthWidth", "lidL", "lidR", "eyeScale"] as const;
  const jumps: string[] = [];
  for (let f = 1; f < N; f++) {
    for (const k of keys) {
      const dv = Math.abs(d.poses[f].face[k] - d.poses[f - 1].face[k]);
      const lim = k === "eyeScale" ? 0.05 : 0.18;
      if (dv > lim) jumps.push(`f${f}:${k}+${dv.toFixed(2)}`);
    }
  }
  out.push(`Saltos de expresión (>0.18 por fotograma): ${jumps.length}`);
  out.push("  " + jumps.slice(0, 14).join("  "));

  // 3) cambios de forma de mano
  const swaps: string[] = [];
  for (let f = 1; f < N; f++) {
    if (d.poses[f].armFront.hand !== d.poses[f - 1].armFront.hand) swaps.push(`f${f}:${d.poses[f - 1].armFront.hand}>${d.poses[f].armFront.hand}`);
  }
  out.push(`Cambios de mano delantera: ${swaps.join("  ")}`);

  // 4) agarre
  if (d.grab) {
    const rows: string[] = [];
    for (let f = d.grab.from; f <= d.grab.to; f += 2) {
      const t = d.grab.target(f);
      const h = d.grab.hand(f);
      rows.push(`f${f}:${fmt(Math.hypot(t.x - h.x, t.y - h.y))}`);
    }
    out.push("Distancia mano→punto de agarre (px):");
    for (let i = 0; i < rows.length; i += 6) out.push("  " + rows.slice(i, i + 6).join(" "));
  }
  if (d.cupBottom) {
    const rows: string[] = [];
    for (let f = d.cupBottom.from; f <= d.cupBottom.to; f += 2) {
      rows.push(`f${f}:${fmt(d.cupBottom.counter - d.cupBottom.y(f))}`);
    }
    out.push("Altura de la base del vaso sobre el mostrador (px, negativo = hundido):");
    for (let i = 0; i < rows.length; i += 6) out.push("  " + rows.slice(i, i + 6).join(" "));
  }
  return out;
};

export const DiagText: React.FC<{ lines: string[] }> = ({ lines }) => (
  <AbsoluteFill style={{ backgroundColor: "#111", color: "#E8E8E8", padding: 30, fontFamily: "Consolas, monospace", fontSize: 22, lineHeight: 1.45, whiteSpace: "pre-wrap" }}>
    {lines.join("\n")}
  </AbsoluteFill>
);
