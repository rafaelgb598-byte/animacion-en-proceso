import React from "react";
import { Easing, interpolateColors } from "remotion";
import { lerp } from "../../../../canal/mil-anos/anim";
import { RoughFilter, Svg } from "../../../../canal/mil-anos/svg";
import { recipe } from "../../episodes/cocina.decay";
import { RECIPE } from "../../episodes/cocina";
import { FONTS, K, LAYOUT, M, TYPE } from "../../theme";
import type { KitchenProps } from "./types";

const R = LAYOUT.recipe;
const PAPER = { w: 280, h: 262 };
const FALL_Y = Easing.in(Easing.quad);
const TITLE = RECIPE.title;
const LINES = RECIPE.lines;

/**
 * Receta de la abuela, escrita a mano (Caveat: es parte del objeto, no de la interfaz), con un imán en el freezer.
 * Amarillea → se mancha con la humedad (AÑO 1) → se despega y cae al agua del piso (AÑO 10) → desaparece (AÑO 15–20).
 */
export const Recipe: React.FC<KitchenProps> = ({ year }) => {
  const r = recipe(year);
  if (r.gone >= 0.999) return null;
  const fy = FALL_Y(r.fall);
  const onDoor = { x: R.cx, y: R.top + PAPER.h / 2 };
  const floorP = LAYOUT.recipeFloor;
  const cx = lerp(r.fall, [0, 1], [onDoor.x, floorP.cx]) + 46 * Math.sin(r.fall * Math.PI * 3) * (1 - r.fall);
  const cy = onDoor.y + (floorP.cy - onDoor.y) * fy;
  const rot = r.fall < 1 ? R.rot + 28 * Math.sin(r.fall * Math.PI * 2.5) + (floorP.rot - R.rot) * r.fall : floorP.rot;
  const sy = lerp(r.fall, [0.55, 1], [1, 0.36]);
  const paper = interpolateColors(r.yellow, [0, 1], [M.paper, M.paperOld]);
  const ink = 1 - 0.85 * r.soak - 0.25 * r.stain;
  const edge = 2 + 10 * r.soak + 14 * r.gone;
  return (
    <Svg style={{ opacity: 1 - r.gone }}>
      <defs>
        <RoughFilter id="kc-recipe-edge" seed={61} scale={edge} freq={0.06} />
        <RoughFilter id="kc-recipe-stain" seed={62} scale={30} freq={0.03} />
        <clipPath id="kc-recipe-clip">
          <rect x={-PAPER.w / 2} y={-PAPER.h / 2} width={PAPER.w} height={PAPER.h} />
        </clipPath>
      </defs>
      <g transform={`translate(${cx} ${cy}) rotate(${rot}) scale(${1 - 0.2 * r.gone} ${sy * (1 - 0.2 * r.gone)})`}>
        <rect x={-PAPER.w / 2 + 5} y={-PAPER.h / 2 + 6} width={PAPER.w} height={PAPER.h} fill={M.black} opacity={0.25 * (1 - r.fall)} />
        <g filter="url(#kc-recipe-edge)">
          <rect x={-PAPER.w / 2} y={-PAPER.h / 2} width={PAPER.w} height={PAPER.h} fill={paper} />
          <rect x={-PAPER.w / 2} y={-PAPER.h / 2} width={PAPER.w} height={PAPER.h} fill={M.cartonWet} opacity={0.7 * r.soak} />
        </g>
        <g fontFamily={FONTS.recipe} fill={K.recipeInk} opacity={ink} clipPath="url(#kc-recipe-clip)">
          {TITLE.map((t, i) => (
            <text key={t} x={-PAPER.w / 2 + 18} y={-PAPER.h / 2 + 40 + i * 34} fontSize={TYPE.recipeTitle} fontWeight={700}>
              {t}
            </text>
          ))}
          {LINES.map((l, i) => (
            <text key={l} x={-PAPER.w / 2 + 18} y={-PAPER.h / 2 + 118 + i * 29} fontSize={TYPE.recipeLine} fontWeight={500}>
              {l}
            </text>
          ))}
        </g>
        {/* mancha de humedad */}
        <g clipPath="url(#kc-recipe-clip)" filter="url(#kc-recipe-stain)">
          <ellipse cx={50} cy={60} rx={30 + 110 * r.stain} ry={24 + 80 * r.stain} fill={M.waterStain} opacity={0.55 * r.stain} />
          <ellipse cx={-80} cy={-70} rx={10 + 40 * r.stain} ry={8 + 30 * r.stain} fill={M.waterStain} opacity={0.4 * r.stain} />
        </g>
      </g>
    </Svg>
  );
};

/** Fantasma de la receta sobre el plato (remate): dos renglones en Caveat al 12 %, contenido. */
export const RecipeGhost: React.FC<{ opacity: number; x: number; y: number }> = ({ opacity, x, y }) => {
  if (opacity <= 0.001) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x - 340,
        top: y - TYPE.ghost * 1.2,
        width: 680,
        textAlign: "center",
        fontFamily: FONTS.recipe,
        fontWeight: 700,
        fontSize: TYPE.ghost,
        lineHeight: 1.15,
        color: M.paper,
        opacity,
        transform: "rotate(-3deg)",
      }}
    >
      {RECIPE.ghost.map((l) => (
        <div key={l}>{l}</div>
      ))}
    </div>
  );
};
