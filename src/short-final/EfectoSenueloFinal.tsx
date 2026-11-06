import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { clamp, ease } from "../character/anim";
import { BoardScene } from "./BoardScene";
import { CafeScene } from "./CafeScene";
import { Captions, HookTitle } from "./Overlays";
import { DURATION, SCENE, SFX } from "./timing";

/**
 * SHORT FINAL — Efecto señuelo (1080×1920 · 30 fps · 46,4 s).
 * Voz: Isaac (ElevenLabs, QmPfzE500cXXHM9uQKGc). Efectos: ElevenLabs Sound Effects. Sin música.
 */

export const FINAL_FRAMES = DURATION;
const T = 12; // duración de las transiciones (fotogramas)

const slide = (f: number, at: number) => ease.inOut(clamp((f - (at - T / 2)) / T, 0, 1));

/** parte visual (también usada por las herramientas de revisión con un fotograma fijo) */
export const FinalVisual: React.FC<{ f: number; inst?: string }> = ({ f, inst = "" }) => {
  const toBoard = slide(f, SCENE.boardIn);
  const toCafe = slide(f, SCENE.boardOut);
  const inBoardRange = f >= SCENE.boardIn - T / 2 && f < SCENE.boardOut + T / 2;
  const showCafe = f < SCENE.boardIn + T / 2 || f >= SCENE.boardOut - T / 2;
  // café → pizarrón: el café sube y el pizarrón entra desde abajo (y a la inversa al volver)
  const cafeY = f < SCENE.boardOut - T ? -toBoard * 1920 : (1 - toCafe) * 1920;
  const boardY = f < SCENE.boardOut - T ? (1 - toBoard) * 1920 : -toCafe * 1920;

  return (
    <AbsoluteFill style={{ backgroundColor: "#F2DDBA" }}>
      {showCafe ? (
        <AbsoluteFill style={{ transform: `translateY(${cafeY}px)` }}>
          <CafeScene inst={inst} f={f < SCENE.boardOut - T ? Math.min(f, SCENE.boardIn + T) : Math.max(f, SCENE.boardOut - T)} />
        </AbsoluteFill>
      ) : null}
      {inBoardRange ? (
        <AbsoluteFill style={{ transform: `translateY(${boardY}px)` }}>
          <BoardScene inst={inst} f={f} />
        </AbsoluteFill>
      ) : null}

      <AbsoluteFill>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920">
          <HookTitle f={f} outAt={158} />
          {f >= 1330 ? <HookTitle f={f} inFrom={1342} /> : null}
          <Captions f={f} />
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const EfectoSenueloFinal: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <FinalVisual f={f} />
      <Audio src={staticFile("short-final/voz/narracion-isaac.mp3")} />
      {SFX.map((s, i) => (
        <Sequence key={i} from={s.at} durationInFrames={s.dur ?? 60} layout="none" name={`sfx ${s.name}`}>
          <Audio src={staticFile(`short-final/sfx/${s.name}.mp3`)} volume={s.volume} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
