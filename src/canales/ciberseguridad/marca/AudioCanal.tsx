// Audio del canal: voz al frente, efectos sintetizados en su frame, ambiente de sala en loop (sin música).
import React from "react";
import { Audio } from "@remotion/media";
import { Sequence, staticFile } from "remotion";
import type { Episodio } from "./tipos";

export const AudioCanal: React.FC<{ ep: Episodio }> = ({ ep }) => (
  <>
    <Audio src={staticFile(ep.ambiente.archivo)} volume={ep.ambiente.volumen} />
    {ep.sfx.map((c) => (
      <Sequence key={c.id} from={c.f} durationInFrames={c.dur ?? 60} layout="none" name={`sfx ${c.id}`}>
        <Audio src={staticFile(c.archivo)} volume={c.volumen} />
      </Sequence>
    ))}
    {ep.voz.map((b) =>
      b.audio ? (
        <Sequence key={b.id} from={b.f} layout="none" name={`voz ${b.id}`}>
          <Audio src={staticFile(b.audio)} volume={ep.vozVolumen} />
        </Sequence>
      ) : null,
    )}
  </>
);
