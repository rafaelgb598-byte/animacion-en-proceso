// 1000 años · Cocina · v2 · Sonido (sección 4 del prompt v2): efectos sintetizados + narración de Isaac.
// Reutiliza los efectos del celular (v2/v3) y de la cocina v1; suma goteos, papel y el plato que gira (gen-sfx-1000-anos-cocina-v2.mjs).
// Con voz activa, todo lo demás baja 8 dB (duckAt). Niveles ajustados midiendo la energía por cuarto de segundo.
import { random, staticFile } from "remotion";
import { lerp } from "../../../../canal/mil-anos/anim";
import { bed, type SfxCue } from "../../../../canal/mil-anos/audio/SfxLayer";
import { CLOCK, CUE, DURATION, LOOP_CUT } from "./cocina.timeline";
import { duckAt, VOICE, VOICE_IDS, voiceEnd, voiceStart } from "./cocina.voz";

const V2 = (name: string) => staticFile(`videos/03-1000-anos/v2/sfx/${name}.wav`);
const V3 = (name: string) => staticFile(`videos/03-1000-anos/final/sfx/${name}.wav`);
const K1 = (name: string) => staticFile(`videos/04-1000-anos-cocina/sfx/${name}.wav`);
const K2 = (name: string) => staticFile(`videos/04-1000-anos-cocina/v2/sfx/${name}.wav`);

const inDip = (f: number) => CUE.fridgeDips.some(([a, b]) => f >= a && f < b);
/** Zumbido de la heladera: fondo (≈ −24 dB RMS en la mezcla final), no tapa la voz. */
const HUM = 0.1;

/** Aplica el ducking de la voz a un efecto que empieza en `from`. */
const ducked = (from: number, v: number | ((f: number) => number)) => (f: number) => (typeof v === "number" ? v : v(f)) * duckAt(from + f);

export const sfxCues = (): SfxCue[] => {
  const impact = CUE.cupboardFall + CUE.cupboardFallLen;
  const clicks = Array.from(new Set([...CLOCK.rollEnds, ...CLOCK.unitChanges])).filter((f) => f < LOOP_CUT).sort((a, b) => a - b);
  const rainDur = CUE.rainEnd - CUE.windowBreak + 20;
  const windDur = LOOP_CUT - CUE.roofFall;
  const insectsDur = CUE.remateEnd - 70 - CUE.insectsFrom;
  const fliesDur = CUE.flies[1] - CUE.flies[0];
  const roomLateDur = CUE.roofFall + 30 - CUE.rainEnd + 20;
  const raw: SfxCue[] = [
    // gancho: zumbido bajo que tartamudea y se corta seco en f40; tic de reloj
    { key: "hum", src: K1("fridge-hum"), from: 0, dur: CUE.fridgeOff, loop: true, volume: (f) => HUM * (inDip(f) ? 0.25 : 1) },
    ...CUE.fridgeDips.map(([a]) => ({ key: `buzz-${a}`, src: V2("buzz"), from: a, dur: 8, volume: 0.06 })),
    { key: "off", src: V2("power-off"), from: CUE.fridgeOff, dur: 6, volume: 0.14 },
    ...CUE.clockTicks.map((f) => ({ key: `tick-${f}`, src: K1("clock-tick"), from: f, dur: 6, volume: 0.22 })),
    { key: "room", src: V2("room"), from: CUE.fridgeOff, dur: CUE.windowBreak - CUE.fridgeOff, volume: bed(CUE.windowBreak - CUE.fridgeOff, 0.08, 30, 10) },
    // comida: moscas un poco más presentes durante el acercamiento
    { key: "flies", src: K1("flies"), from: CUE.flies[0], dur: fliesDur, loop: true, volume: bed(fliesDur, 0.36, 20, 25) },
    // ventana, lluvia, goteos y papel (el tramo f315–f420 ya no queda plano)
    { key: "glass", src: V2("glass-break"), from: CUE.windowBreak, dur: 36, volume: 0.3 },
    { key: "rain", src: V2("rain"), from: CUE.windowBreak, dur: rainDur, loop: true, volume: bed(rainDur, 0.32, 12, 30) },
    { key: "drip-1", src: K2("drip-metal"), from: CUE.drips[0], dur: 14, volume: 0.32 },
    { key: "drip-2", src: K2("drip-metal-2"), from: CUE.drips[1], dur: 11, volume: 0.32 },
    { key: "paper", src: K2("paper-crinkle"), from: CUE.paperCrinkle, dur: 21, volume: 0.3 },
    // alacena: el pico del video (crujido → golpe grave → 8 tintineos escalonados)
    { key: "creak", src: V3("wood-creak"), from: CUE.cupboardFall - 14, dur: 18, volume: 0.3 },
    { key: "crash", src: K1("cupboard-crash"), from: impact, dur: 40, volume: 0.85 },
    ...Array.from({ length: 8 }, (_, i) => ({
      key: `plato-${i}`,
      src: K1(`ceramic-${"abc"[i % 3]}`),
      from: impact + 1 + i * 2 + Math.floor(random(`plato-${i}`) * 8),
      dur: 12,
      volume: 0.45 + 0.15 * random(`plato-v-${i}`),
    })),
    { key: "splash", src: K1("paper-splash"), from: CUE.recipeFall + CUE.recipeFallLen, dur: 14, volume: 0.2 },
    // un último plato que gira y se detiene (sostiene «Todos… menos uno») + goteo
    { key: "spin", src: K2("plate-spin"), from: CUE.plateSpin[0], dur: CUE.plateSpin[1] - CUE.plateSpin[0], volume: 0.5 },
    { key: "drip-3", src: K2("drip-metal"), from: CUE.dripLate, dur: 14, volume: 0.28 },
    // techo (−4 dB respecto de la v1), puertas, tierra
    { key: "room-late", src: V2("room"), from: CUE.rainEnd - 20, dur: roomLateDur, volume: bed(roomLateDur, 0.07, 20, 30) },
    { key: "roof", src: K1("roof-collapse"), from: CUE.roofFall, dur: 76, volume: 0.26 },
    { key: "roof-thud", src: V3("panel-thud"), from: CUE.roofFall + 9, dur: 9, volume: 0.2 },
    { key: "door", src: V3("panel-thud"), from: CUE.fridgeDoorFall + CUE.fridgeDoorFallLen, dur: 9, volume: 0.22 },
    { key: "cabinet-door", src: V3("panel-thud"), from: CUE.cabinetDoorFall + CUE.cabinetDoorFallLen, dur: 9, volume: 0.24 },
    { key: "soil", src: V3("soil"), from: CLOCK.jumpStarts[CLOCK.jumpStarts.length - 1], dur: 30, volume: 0.2 },
    { key: "wind", src: V2("wind"), from: CUE.roofFall, dur: windDur, volume: (f: number) => bed(windDur, 1, 30, 20)(f) * lerp(f, [CUE.windFrom - CUE.roofFall - 20, CUE.windFrom - CUE.roofFall + 10, CUE.remateEnd - 90 - CUE.roofFall, CUE.remateEnd - 70 - CUE.roofFall], [0.12, 0.25, 0.25, 0.06]) },
    { key: "insects", src: V2("insects"), from: CUE.insectsFrom, dur: insectsDur, loop: true, volume: bed(insectsDur, 0.16, 30, 20) },
    // tiempo: barrido en cada salto, clic de odómetro
    ...CLOCK.jumpStarts.map((f) => ({ key: `warp-${f}`, src: V2("timewarp"), from: f, dur: 28, volume: 0.16 })),
    ...clicks.map((f) => ({ key: `odo-${f}`, src: V2("odometer"), from: f, dur: 4, volume: 0.26 })),
    // revelación y carta
    { key: "glint", src: V2("glint"), from: CUE.glint, dur: 10, volume: 0.16 },
    { key: "card", src: V2("reveal"), from: CUE.card, dur: 63, volume: 0.35 },
    // loop: vuelve el zumbido para empalmar con el frame 0
    { key: "hum-loop", src: K1("fridge-hum"), from: LOOP_CUT, dur: DURATION - LOOP_CUT, loop: true, volume: HUM },
  ];
  // todo se agacha con la voz (también la nota de la carta, que suena bajo «…es el plato que no lavaste»);
  // solo el zumbido del loop queda igual porque es el empalme con el frame 0
  return raw.map((c) => (c.key === "hum-loop" ? c : { ...c, volume: ducked(c.from, c.volume) }));
};

/** Voz: solo las frases que ya tienen audio generado (las estimadas no suenan). */
export const voiceCues = (): SfxCue[] =>
  VOICE_IDS.filter((id) => VOICE[id].archivo).map((id) => ({
    key: `voz-${id}`,
    src: staticFile(VOICE[id].archivo as string),
    from: voiceStart(id),
    dur: voiceEnd(id) - voiceStart(id) + 6,
    volume: 1,
  }));

export const audioCues = (): SfxCue[] => [...sfxCues(), ...voiceCues()];
