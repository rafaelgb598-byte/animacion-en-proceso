import React from "react";
import { ALPHA, CHAT, COLOR, TYPE } from "../theme";
import { RichText } from "./Rich";
import { IconoAtras, IconoMenu } from "./Iconos";

/** Cabecera de la conversación: avatar con inicial, nombre (marcable) y estado. Sin botones de llamada de ninguna app. */
export const ChatHeader: React.FC<{ nombre: string; estado: string; inicial: string; marcado?: number }> = ({ nombre, estado, inicial, marcado = 0 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "10px 22px 14px", borderBottom: `1px solid ${ALPHA.hairline}` }}>
    <IconoAtras size={30} color={COLOR.muted} />
    <div
      style={{
        width: 60,
        height: 60,
        borderRadius: 30,
        background: COLOR.bubbleOut,
        color: COLOR.text,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...TYPE.uiStrong,
        fontSize: 30,
        flex: "none",
      }}
    >
      {inicial}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ ...TYPE.uiStrong, fontSize: 36, color: COLOR.text, lineHeight: 1.1 }}>
        <RichText texto={`[${nombre}]`} marcadas={{ 0: marcado }} iconSize={30} />
      </div>
      <div style={{ ...TYPE.ui, fontSize: CHAT.metaSize, color: COLOR.muted, marginTop: 2 }}>{estado}</div>
    </div>
    <IconoMenu size={30} color={COLOR.muted} />
  </div>
);
