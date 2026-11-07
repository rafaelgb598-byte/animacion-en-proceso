import React from "react";
import { AbsoluteFill } from "remotion";
import { shards } from "../../episodes/cocina.decay";
import { LAYOUT } from "../../theme";
import { BrokenPlates } from "./BrokenPlates";
import { CannedTin } from "./CannedTin";
import { Counter } from "./Counter";
import { Cupboard } from "./Cupboard";
import { FoodItems } from "./FoodItems";
import { Fridge, FridgeDoor, FridgeMagnet } from "./Fridge";
import { GrandmaPlate } from "./GrandmaPlate";
import { FlyingLeaves, KitchenLight, KitchenRain } from "./KitchenLight";
import { KitchenWindow } from "./KitchenWindow";
import { Insects, RoofDebris, SoilMound, Vines } from "./Nature";
import { PetBottle } from "./PetBottle";
import { Recipe } from "./Recipe";
import { Floor, Sky, Wall } from "./Room";
import { Faucet, SinkBasin, SinkSoil } from "./Sink";
import type { KitchenProps } from "./types";

export type CameraState = { push: number; zoom: number; dx: number; dy: number };

/** De coordenadas de mundo a pantalla (acercamiento del gancho alrededor del centro + revelación alrededor del plato). */
export const toScreen = (p: { x: number; y: number }, cam: CameraState) => {
  const z = LAYOUT.plate;
  const o = LAYOUT.pushOrigin;
  const ix = z.cx + (p.x - z.cx) * cam.zoom;
  const iy = z.cy + (p.y - z.cy) * cam.zoom;
  return { x: o.x + (ix - o.x) * cam.push + cam.dx, y: o.y + (iy - o.y) * cam.push + cam.dy };
};

/**
 * Plano único de la cocina (cámara alta, casi quieta). Cada pieza lee su estado de `year`;
 * `frame` solo mueve moscas, lluvia, hojas y pasto.
 */
export const KitchenScene: React.FC<KitchenProps & { light: number; glint: number | null; cam: CameraState }> = ({ year, frame, light, glint, cam }) => {
  const p = { year, frame };
  const sh = shards(year);
  const o = LAYOUT.pushOrigin;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ transformOrigin: `${o.x}px ${o.y}px`, transform: `translate(${cam.dx}px, ${cam.dy}px) scale(${cam.push})` }}>
        <AbsoluteFill style={{ transformOrigin: `${LAYOUT.plate.cx}px ${LAYOUT.plate.cy}px`, transform: `scale(${cam.zoom})` }}>
          <Sky {...p} />
          <Wall {...p} />
          <Vines {...p} />
          <KitchenWindow {...p} />
          <Floor {...p} />
          <Counter {...p} />
          <Faucet {...p} />
          <SinkBasin {...p} />
          <GrandmaPlate {...p} glint={glint} />
          <SinkSoil {...p} />
          <CannedTin {...p} />
          <PetBottle {...p} />
          <Fridge {...p} light={light}>
            <FoodItems {...p} />
          </Fridge>
          <Recipe {...p} />
          <FridgeMagnet {...p} />
          <FridgeDoor {...p} light={light} />
          <Cupboard {...p} />
          <BrokenPlates {...p} scatter={sh.scatter} dirt={sh.dirt} bury={sh.bury} />
          <RoofDebris {...p} />
          <SoilMound {...p} />
          <Insects {...p} />
          <KitchenLight {...p} light={light} />
          <KitchenRain {...p} />
          <FlyingLeaves {...p} />
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
