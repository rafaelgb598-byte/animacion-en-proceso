import React from "react";
import { AbsoluteFill } from "remotion";
import { sinkDrop, shards } from "../../episodes/cocina.decay";
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

/** Cámara: pantalla = s · mundo + (tx, ty). */
export type CameraState = { s: number; tx: number; ty: number };

export const toScreen = (p: { x: number; y: number }, cam: CameraState) => ({ x: cam.s * p.x + cam.tx, y: cam.s * p.y + cam.ty });

/**
 * Plano único de la cocina (v2: escala base ×1,30). `objetos` = false deja solo el escenario (pared, muebles, piso,
 * tierra, luz y clima): es la capa «fondo» del QA de subtítulos, que marca como choque cualquier objeto bajo el carril.
 */
export const KitchenScene: React.FC<KitchenProps & { light: number; glint: number | null; cam: CameraState; objetos: boolean }> = ({ year, frame, light, glint, cam, objetos }) => {
  const p = { year, frame };
  const sh = shards(year);
  /** Mesada, bacha y todo lo que está encima bajan al nivel del suelo (AÑO 200 → 1.000). */
  const drop = LAYOUT.sinkDrop * sinkDrop(year);
  const onCounter: React.CSSProperties = { transform: `translateY(${drop}px)` };
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ transformOrigin: "0px 0px", transform: `translate(${cam.tx}px, ${cam.ty}px) scale(${cam.s})` }}>
        <Sky {...p} />
        <Wall {...p} />
        <Vines {...p} />
        <KitchenWindow {...p} />
        <Floor {...p} />
        <AbsoluteFill style={onCounter}>
          <Counter {...p} />
          <Faucet {...p} />
          <SinkBasin {...p} />
          {objetos ? <GrandmaPlate {...p} glint={glint} /> : null}
          <SinkSoil {...p} />
          {objetos ? <CannedTin {...p} /> : null}
          {objetos ? <PetBottle {...p} /> : null}
        </AbsoluteFill>
        <Fridge {...p} light={light}>
          {objetos ? <FoodItems {...p} /> : null}
        </Fridge>
        {objetos ? <Recipe {...p} /> : null}
        <FridgeMagnet {...p} />
        {objetos ? <FridgeDoor {...p} light={light} /> : null}
        {objetos ? <Cupboard {...p} /> : null}
        <AbsoluteFill style={onCounter}>{objetos ? <BrokenPlates {...p} scatter={sh.scatter} dirt={sh.dirt} bury={sh.bury} /> : null}</AbsoluteFill>
        {objetos ? <RoofDebris {...p} /> : null}
        <SoilMound {...p} />
        {objetos ? <Insects {...p} /> : null}
        <KitchenLight {...p} light={light} />
        <KitchenRain {...p} />
        {objetos ? <FlyingLeaves {...p} /> : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
