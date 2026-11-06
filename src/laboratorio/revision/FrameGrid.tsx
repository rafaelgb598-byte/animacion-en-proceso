import React from "react";
import { AbsoluteFill, type CalculateMetadataFunction } from "remotion";
import { DecoyV2 } from "../../videos/01-efecto-senuelo/historial/v2/DecoyV2";
import { DecoyV3 } from "../../videos/01-efecto-senuelo/historial/v3/DecoyV3";
import { FinalVisual } from "../../videos/01-efecto-senuelo/short-final/EfectoSenueloFinal";

/**
 * Grilla de revisión: muestra varios fotogramas de una versión, opcionalmente recortados
 * a una zona (pies, manos, cara) para inspeccionar detalles fotograma por fotograma.
 * Uso: npx remotion still src/index.ts InspeccionFotogramas out.png --props='{"version":"v2","frames":[...],"crop":[x,y,w,h]}'
 */

export type GridProps = {
  version: "v2" | "v3" | "final";
  frames: number[];
  cols: number;
  crop: [number, number, number, number]; // en píxeles del video 1080×1920
  panelW: number;
};

export const gridDefaults: GridProps = {
  version: "v2",
  frames: [0, 10, 20, 30, 40, 50],
  cols: 6,
  crop: [0, 0, 1080, 1920],
  panelW: 300,
};

const LABEL = 34;

const size = (p: GridProps) => {
  const ph = (p.panelW * p.crop[3]) / p.crop[2];
  const rows = Math.ceil(p.frames.length / p.cols);
  return { w: p.cols * (p.panelW + 8) + 8, h: rows * (ph + LABEL + 8) + 8, ph };
};

export const gridMetadata: CalculateMetadataFunction<GridProps> = ({ props }) => {
  const s = size(props);
  return { width: Math.round(s.w / 2) * 2, height: Math.round(s.h / 2) * 2 };
};

export const FrameGrid: React.FC<GridProps> = (p) => {
  const { ph } = size(p);
  const k = p.panelW / p.crop[2];
  const Scene: React.FC<{ inst: string; frame: number }> =
    p.version === "v2" ? DecoyV2 : p.version === "v3" ? DecoyV3 : ({ frame, inst }) => <FinalVisual f={frame} inst={inst} />;
  return (
    <AbsoluteFill style={{ backgroundColor: "#1B1719" }}>
      {p.frames.map((f, i) => {
        const x = 8 + (i % p.cols) * (p.panelW + 8);
        const y = 8 + Math.floor(i / p.cols) * (ph + LABEL + 8);
        return (
          <React.Fragment key={i}>
            <div style={{ position: "absolute", left: x, top: y, width: p.panelW, height: ph, overflow: "hidden" }}>
              <div
                style={{
                  width: 1080,
                  height: 1920,
                  position: "absolute",
                  left: 0,
                  top: 0,
                  transformOrigin: "0 0",
                  transform: `scale(${k}) translate(${-p.crop[0]}px, ${-p.crop[1]}px)`,
                }}
              >
                <Scene inst={`g${i}`} frame={f} />
              </div>
            </div>
            <div style={{ position: "absolute", left: x, top: y + ph + 2, width: p.panelW, color: "#ddd", fontFamily: "Consolas, monospace", fontSize: 20, textAlign: "center" }}>
              f{f} · {(f / 30).toFixed(2)}s
            </div>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};
