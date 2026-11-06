import React from "react";
import { clamp, ease, smooth } from "../character/anim";
import { WORDS, type Word } from "./words";
import { captionY, FPS } from "./timing";

/**
 * Capas de texto en pantalla: título del gancho y subtítulos sincronizados.
 * Zona segura para Shorts: los subtítulos quedan entre y≈1380 y 1560 y a la izquierda
 * de la columna de íconos (x < 930); el título vive en la pared superior.
 */

const FONT = "'Segoe UI Black', 'Arial Black', 'Segoe UI', sans-serif";
const INK = "#1F1A24";

/* ------------------------------ subtítulos ------------------------------ */


type Page = { words: Word[]; start: number; end: number; lines: Word[][] };

const buildPages = (): Page[] => {
  const pages: Word[][] = [];
  let cur: Word[] = [];
  for (const w of WORDS) {
    cur.push(w);
    const chars = cur.map((x) => x.t).join(" ").length;
    const hardStop = /[.?!]$|…$/.test(w.t);
    const softStop = /[,:]$/.test(w.t) && chars > 14;
    if (hardStop || softStop || cur.length >= 5 || chars > 24) {
      pages.push(cur);
      cur = [];
    }
  }
  if (cur.length) pages.push(cur);
  return pages.map((ws, i) => {
    const next = pages[i + 1];
    const end = next ? Math.min(next[0].s, ws[ws.length - 1].e + 0.6) : ws[ws.length - 1].e + 0.9;
    // dos líneas como máximo, equilibradas por cantidad de caracteres
    const text = ws.map((w) => w.t).join(" ");
    let lines: Word[][] = [ws];
    if (text.length > 16 && ws.length > 1) {
      let best = -1;
      let bestDiff = Infinity;
      for (let k = 1; k < ws.length; k++) {
        const la = ws.slice(0, k).map((w) => w.t).join(" ");
        const lb = ws.slice(k).map((w) => w.t).join(" ");
        // nunca dejar una palabra cortita sola en una línea
        if (la.length <= 3 || lb.length <= 3) continue;
        if (Math.abs(la.length - lb.length) < bestDiff) {
          bestDiff = Math.abs(la.length - lb.length);
          best = k;
        }
      }
      if (best > 0) lines = [ws.slice(0, best), ws.slice(best)];
    }
    return { words: ws, start: ws[0].s - 0.08, end, lines };
  });
};
const PAGES = buildPages();

export const Captions: React.FC<{ f: number }> = ({ f }) => {
  const t = f / FPS;
  const page = PAGES.find((p) => t >= p.start && t < p.end);
  if (!page) return null;
  // la primera página ya está completa en el fotograma 0 (gancho legible desde el inicio)
  // una sola palabra activa: la última que ya empezó (y no terminó hace mucho)
  let current: Word | null = null;
  for (const w of page.words) if (t >= w.s - 0.04 && t < w.e + 0.25) current = w;
  const pin = page.start <= 0 ? 1 : smooth((t - page.start) / 0.12);
  const longest = Math.max(...page.lines.map((l) => l.map((w) => w.t).join(" ").length));
  const SIZE = Math.min(74, 860 / (longest * 0.66));
  const LH = SIZE * 1.24;
  // bloque centrado en pantalla, un poco por debajo del medio
  const CY = captionY(f);
  const baseY = CY - ((page.lines.length - 1) * LH) / 2 + SIZE * 0.36;
  return (
    <g opacity={pin} transform={`translate(0,${(1 - ease.out(pin)) * 16})`}>
      {page.lines.map((line, li) => (
        <text key={li} x={540} y={baseY + li * LH} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={SIZE} letterSpacing={-1}>
          {line.map((w, wi) => {
            const active = w === current;
            // karaoke: solo la palabra que se está diciendo va en amarillo
            const fill = active ? "#FFD84A" : "#FFFFFF";
            return (
              <tspan
                key={wi}
                fill={fill}
                stroke={INK}
                strokeWidth={14}
                paintOrder="stroke"
                strokeLinejoin="round"
                dy={active ? -4 : 0}
                dx={wi === 0 ? 0 : 18}
                style={{ fontSize: active ? SIZE * 1.08 : SIZE }}
              >
                {w.t.toUpperCase()}
              </tspan>
            );
          })}
        </text>
      ))}
    </g>
  );
};

/* ------------------------------ título del gancho ------------------------------ */

export const HookTitle: React.FC<{ f: number; inFrom?: number; outAt?: number }> = ({ f, inFrom, outAt }) => {
  const appear = inFrom === undefined ? 1 : smooth((f - inFrom) / 8);
  const leave = outAt === undefined ? 1 : 1 - smooth((f - outAt) / 10);
  const o = clamp(appear * leave, 0, 1);
  if (o <= 0) return null;
  const pulse = 1 + 0.015 * Math.sin(f * 0.2);
  return (
    <g opacity={o} transform={`translate(540,300) scale(${pulse * (0.94 + 0.06 * appear)}) rotate(-2)`}>
      <rect x={-470} y={-88} width={940} height={146} rx={26} fill="#FFFFFF" stroke={INK} strokeWidth={9} />
      <text x={0} y={16} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={82} letterSpacing={-2}>
        <tspan fill={INK}>¿</tspan>
        <tspan fill="#E24E5A">CHICO</tspan>
        <tspan fill={INK}> O </tspan>
        <tspan fill="#2BB3A3">GRANDE</tspan>
        <tspan fill={INK}>?</tspan>
      </text>
    </g>
  );
};
