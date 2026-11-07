// 1000 años · Cocina · Sonido (sección 8): efectos sintetizados, sin música.
// Reutiliza los efectos del celular (v2 y v3) y suma los nuevos de scripts/gen-sfx-1000-anos-cocina.mjs.
import { random, staticFile } from "remotion";
import { lerp } from "../../../canal/mil-anos/anim";
import { bed, type SfxCue } from "../../../canal/mil-anos/audio/SfxLayer";
import { CLOCK, CUE, DURATION, LOOP_CUT } from "./cocina.timeline";

const V2 = (name: string) => staticFile(`videos/03-1000-anos/v2/sfx/${name}.wav`);
const V3 = (name: string) => staticFile(`videos/03-1000-anos/final/sfx/${name}.wav`);
const NEW = (name: string) => staticFile(`videos/04-1000-anos-cocina/sfx/${name}.wav`);

const inDip = (f: number) => CUE.fridgeDips.some(([a, b]) => f >= a && f < b);
const HUM = 0.2;

export const audioCues = (): SfxCue[] => {
  const impact = CUE.cupboardFall + CUE.cupboardFallLen;
  const clicks = Array.from(new Set([...CLOCK.rollEnds, ...CLOCK.unitChanges])).filter((f) => f < LOOP_CUT).sort((a, b) => a - b);
  const rainDur = CUE.rainEnd - CUE.windowBreak;
  // el viento entra cuando cae el techo (f670) y crece desde f810; un ambiente de cuarto cubre f600–f700 (sin silencios muertos)
  const windDur = LOOP_CUT - CUE.roofFall;
  const roomLateDur = CUE.roofFall + 30 - CUE.rainEnd + 20;
  const insectsDur = LOOP_CUT - CUE.insectsFrom;
  const fliesDur = CUE.flies[1] - CUE.flies[0];
  return [
    // gancho: zumbido del motor que tartamudea con los parpadeos y se corta seco en f40; queda un tic de reloj
    { key: "hum", src: NEW("fridge-hum"), from: 0, dur: CUE.fridgeOff, loop: true, volume: (f) => HUM * (inDip(f) ? 0.25 : 1) },
    ...CUE.fridgeDips.map(([a]) => ({ key: `buzz-${a}`, src: V2("buzz"), from: a, dur: 8, volume: 0.1 })),
    { key: "off", src: V2("power-off"), from: CUE.fridgeOff, dur: 6, volume: 0.22 },
    ...CUE.clockTicks.map((f) => ({ key: `tick-${f}`, src: NEW("clock-tick"), from: f, dur: 6, volume: 0.5 })),
    { key: "room", src: V2("room"), from: CUE.fridgeOff, dur: CUE.windowBreak - CUE.fridgeOff, volume: bed(CUE.windowBreak - CUE.fridgeOff, 0.06, 30, 10) },
    // comida
    { key: "flies", src: NEW("flies"), from: CUE.flies[0], dur: fliesDur, loop: true, volume: bed(fliesDur, 0.12, 20, 25) },
    // ventana y lluvia
    { key: "glass", src: V2("glass-break"), from: CUE.windowBreak, dur: 36, volume: 0.34 },
    { key: "rain", src: V2("rain"), from: CUE.windowBreak, dur: rainDur + 20, loop: true, volume: bed(rainDur + 20, 0.22, 12, 30) },
    // alacena: crujido → golpe grave → 8 tintineos cerámicos escalonados (el pico del video)
    { key: "creak", src: V3("wood-creak"), from: CUE.cupboardFall - 14, dur: 18, volume: 0.3 },
    { key: "crash", src: NEW("cupboard-crash"), from: impact, dur: 40, volume: 0.5 },
    ...Array.from({ length: 8 }, (_, i) => ({
      key: `plato-${i}`,
      src: NEW(`ceramic-${"abc"[i % 3]}`),
      from: impact + 1 + i * 2 + Math.floor(random(`plato-${i}`) * 8),
      dur: 12,
      volume: 0.22 + 0.1 * random(`plato-v-${i}`),
    })),
    { key: "splash", src: NEW("paper-splash"), from: CUE.recipeFall + CUE.recipeFallLen, dur: 14, volume: 0.22 },
    // techo y tierra
    { key: "roof", src: NEW("roof-collapse"), from: CUE.roofFall, dur: 76, volume: 0.42 },
    { key: "room-late", src: V2("room"), from: CUE.rainEnd - 20, dur: roomLateDur, volume: bed(roomLateDur, 0.07, 20, 30) },
    { key: "roof-thud", src: V3("panel-thud"), from: CUE.roofFall + 9, dur: 9, volume: 0.3 },
    { key: "door", src: V3("panel-thud"), from: CUE.fridgeDoorFall + CUE.fridgeDoorFallLen, dur: 9, volume: 0.22 },
    { key: "cabinet-door", src: V3("panel-thud"), from: CUE.cabinetDoorFall + CUE.cabinetDoorFallLen, dur: 9, volume: 0.26 },
    { key: "soil", src: V3("soil"), from: CLOCK.jumpStarts[CLOCK.jumpStarts.length - 1], dur: 30, volume: 0.18 },
    { key: "wind", src: V2("wind"), from: CUE.roofFall, dur: windDur, volume: (f: number) => bed(windDur, 1, 30, 20)(f) * lerp(f, [CUE.windFrom - CUE.roofFall - 20, CUE.windFrom - CUE.roofFall + 10], [0.08, 0.16]) },
    { key: "insects", src: V2("insects"), from: CUE.insectsFrom, dur: insectsDur, loop: true, volume: bed(insectsDur, 0.1, 30, 20) },
    // tiempo: barrido en cada salto, clic de odómetro al cambiar de unidad y al frenar
    ...CLOCK.jumpStarts.map((f) => ({ key: `warp-${f}`, src: V2("timewarp"), from: f, dur: 28, volume: 0.16 })),
    ...clicks.map((f) => ({ key: `odo-${f}`, src: V2("odometer"), from: f, dur: 4, volume: 0.28 })),
    // revelación y carta: destello + nota grave de 2 s (55 + 110 Hz)
    { key: "glint", src: V2("glint"), from: CUE.glint, dur: 10, volume: 0.16 },
    { key: "card", src: V2("reveal"), from: CUE.card, dur: 63, volume: 0.36 },
    // loop: vuelve el zumbido para empalmar con el frame 0
    { key: "hum-loop", src: NEW("fridge-hum"), from: LOOP_CUT, dur: DURATION - LOOP_CUT, loop: true, volume: HUM },
  ];
};
