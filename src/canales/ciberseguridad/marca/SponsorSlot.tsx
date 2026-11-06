// Espacio de patrocinio (§ 8): preparado y APAGADO por defecto. Apagado no dibuja nada.
import React from "react";
import { z } from "zod";
import { CENTRO_X, ANCHO_TEXTO_MAX } from "../../../canal/zonaSegura";
import { between } from "./anim";
import { ALPHA, COLOR, TYPE } from "./theme";

export const sponsorSchema = z.object({ nombre: z.string(), claim: z.string(), activo: z.boolean() });
export type Sponsor = z.infer<typeof sponsorSchema>;
export const SPONSOR_APAGADO: Sponsor = { nombre: "", claim: "", activo: false };

export const SponsorSlot: React.FC<{ f: number; desde: number; hasta: number; nombre: string; claim: string; activo: boolean; plantilla: string; etiqueta: string }> = ({
  f,
  desde,
  hasta,
  nombre,
  claim,
  activo,
  plantilla,
  etiqueta,
}) => {
  if (!activo) return null;
  const t = between(f, desde, hasta, 10, 12);
  if (t <= 0) return null;
  const texto = plantilla.replace("{nombre}", nombre).replace("{claim}", claim);
  return (
    <div
      style={{
        position: "absolute",
        left: CENTRO_X - ANCHO_TEXTO_MAX / 2,
        width: ANCHO_TEXTO_MAX,
        top: 300,
        opacity: t,
        transform: `translateY(${(1 - t) * -20}px)`,
        background: COLOR.slate,
        border: `2px solid ${ALPHA.glassEdge}`,
        borderRadius: 18,
        padding: "22px 28px",
      }}
    >
      <div style={{ ...TYPE.monoBold, fontSize: 24, letterSpacing: "0.14em", color: COLOR.muted }}>{etiqueta}</div>
      <div style={{ ...TYPE.uiStrong, fontSize: 38, lineHeight: 1.2, color: COLOR.text, marginTop: 8 }}>{texto}</div>
    </div>
  );
};
