import React from "react";
import { CHAT, COLOR, TYPE } from "../theme";
import { IconoLeido } from "./Iconos";
import { RichText } from "./Rich";

export type BubbleProps = {
  de: "ellos" | "yo";
  texto: string;
  hora: string;
  /** frase [n] → 0..1 subrayado del marcador */
  marcadas?: Record<number, number>;
  /** 0..1 entrada (sube 18 px + opacidad) */
  t?: number;
  mono?: boolean;
};

/** Burbuja: radio 26, padding 22/28, texto 40 px, hora y «leído» propio del canal. */
export const Bubble: React.FC<BubbleProps> = ({ de, texto, hora, marcadas, t = 1, mono = false }) => {
  const out = de === "yo";
  return (
    <div style={{ display: "flex", justifyContent: out ? "flex-end" : "flex-start", opacity: t, transform: `translateY(${(1 - t) * 18}px)` }}>
      <div
        style={{
          maxWidth: "86%",
          background: out ? COLOR.bubbleOut : COLOR.bubbleIn,
          borderRadius: CHAT.bubbleRadius,
          borderBottomLeftRadius: out ? CHAT.bubbleRadius : 8,
          borderBottomRightRadius: out ? 8 : CHAT.bubbleRadius,
          padding: `${CHAT.bubblePadY}px ${CHAT.bubblePadX}px ${CHAT.bubblePadY - 6}px`,
          color: COLOR.text,
          ...(mono ? TYPE.monoBold : TYPE.ui),
          fontSize: CHAT.fontSize,
          lineHeight: CHAT.lineHeight,
        }}
      >
        <RichText
          texto={texto}
          marcadas={marcadas}
          iconSize={CHAT.fontSize}
          cola={
            <span style={{ ...TYPE.ui, display: "inline-flex", alignItems: "center", gap: 6, fontSize: CHAT.metaSize, lineHeight: 1, color: out ? COLOR.text : COLOR.muted, opacity: out ? 0.75 : 1, marginLeft: 16, verticalAlign: "-0.1em" }}>
              {hora}
              {out ? <IconoLeido size={18} color={COLOR.text} /> : null}
            </span>
          }
        />
      </div>
    </div>
  );
};

/** «escribiendo…»: tres puntos que suben por turnos (función del frame). */
export const TypingBubble: React.FC<{ f: number; t?: number }> = ({ f, t = 1 }) => (
  <div style={{ display: "flex", opacity: t, transform: `translateY(${(1 - t) * 18}px)` }}>
    <div style={{ background: COLOR.bubbleIn, borderRadius: CHAT.bubbleRadius, borderBottomLeftRadius: 8, padding: "26px 30px", display: "flex", gap: 12 }}>
      {[0, 1, 2].map((i) => {
        const ph = ((f + i * 4) % 18) / 18;
        const up = Math.max(0, Math.sin(ph * Math.PI * 2));
        return <div key={i} style={{ width: 16, height: 16, borderRadius: 8, background: COLOR.muted, opacity: 0.55 + up * 0.45, transform: `translateY(${-up * 6}px)` }} />;
      })}
    </div>
  </div>
);
