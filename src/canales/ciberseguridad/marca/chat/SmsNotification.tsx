import React from "react";
import { ALPHA, CHAT, COLOR, TYPE } from "../theme";
import { CodeChip } from "./CodeChip";
import { IconoSms } from "./Iconos";
import { RichText } from "./Rich";
import type { Notificacion } from "../tipos";

/** Notificación de SMS genérica, con el código y «Copiar». */
export const SmsNotification: React.FC<{ n: Notificacion; t?: number; marcado?: number; presionado?: number; copiado?: boolean; pulso?: number }> = ({
  n,
  t = 1,
  marcado = 0,
  presionado = 0,
  copiado = false,
  pulso = 0,
}) => (
  <div
    style={{
      margin: "6px 14px 0",
      background: COLOR.bubbleIn,
      borderRadius: 30,
      padding: "18px 24px 20px",
      opacity: t,
      transform: `translateY(${(1 - t) * -24}px) scale(${1 + pulso * 0.015})`,
      boxShadow: `0 10px 24px ${ALPHA.shadowSoft}, inset 0 0 0 2px ${ALPHA.hairline}`,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 12, color: COLOR.muted, ...TYPE.uiStrong, fontSize: CHAT.metaSize + 2, textTransform: "uppercase", letterSpacing: "0.04em" }}>
      <IconoSms size={30} color={COLOR.muted} />
      <span style={{ flex: 1 }}>{n.app}</span>
      <span style={{ ...TYPE.ui, textTransform: "none", letterSpacing: 0 }}>{n.cuando}</span>
    </div>
    <div style={{ ...TYPE.ui, fontSize: 34, lineHeight: 1.22, color: COLOR.text, marginTop: 10 }}>
      <RichText texto={n.texto} marcadas={{ 0: marcado }} iconSize={34} />
    </div>
    {n.codigo ? (
      <div style={{ marginTop: 14 }}>
        <CodeChip valor={n.codigo.valor} copiar={n.codigo.copiar} copiado={n.codigo.copiado} presionado={presionado} hecho={copiado} />
      </div>
    ) : null}
    {n.pie ? (
      <div style={{ ...TYPE.uiStrong, fontSize: 34, lineHeight: 1.22, color: COLOR.text, marginTop: 12 }}>
        <RichText texto={n.pie} iconSize={34} />
      </div>
    ) : null}
  </div>
);
