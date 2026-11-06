// Pantallas de la app genérica, armadas con las piezas de chat/. Todo es función del tiempo de escena `st`.
import React from "react";
import { interpolate } from "remotion";
import { CLAMP, OUT_CUBIC, enter } from "../anim";
import { ALPHA, CHAT, COLOR, TYPE } from "../theme";
import type { Episodio, MensajeChat } from "../tipos";
import { Bubble, TypingBubble } from "./Bubble";
import { ChatHeader } from "./ChatHeader";
import { IconoCasa, IconoEnviar } from "./Iconos";
import { SettingsRow } from "./SettingsRow";
import { SmsNotification } from "./SmsNotification";
import { StatusBar } from "./StatusBar";

/** alto de una burbuja (renglones fijos): sirve para que la lista suba suave cuando entra una nueva */
export const altoBurbuja = (texto: string) => CHAT.bubblePadY + texto.split("\n").length * CHAT.fontSize * CHAT.lineHeight + (CHAT.bubblePadY - 6);
const ALTO_ESCRIBIENDO = 68;

/** Alturas fijas de la pantalla de chat (coordenadas de pantalla del teléfono): los marcadores apuntan con esto. */
export const CHAT_LAYOUT = { status: 52, notifTop: 58, notifH: 240, headerGap: 10, headerH: 92, inputH: 104, listBottom: 12 } as const;
export const filaNotificacion = () => CHAT_LAYOUT.notifTop + CHAT_LAYOUT.notifH / 2;
export const filaCabecera = () => CHAT_LAYOUT.notifTop + CHAT_LAYOUT.notifH + CHAT_LAYOUT.headerGap + CHAT_LAYOUT.headerH / 2;
/** centro vertical de cada mensaje visible en el tiempo de escena `st` (la lista se apoya abajo) */
export const filasMensajes = (mensajes: MensajeChat[], st: number, altoPantalla: number): Record<string, number> => {
  const vis = mensajes.filter((m) => st >= m.f);
  const out: Record<string, number> = {};
  let y = altoPantalla - CHAT_LAYOUT.inputH - CHAT_LAYOUT.listBottom;
  for (let i = vis.length - 1; i >= 0; i--) {
    const h = altoBurbuja(vis[i].texto);
    out[vis[i].id] = y - h / 2;
    y -= h + CHAT.gap;
  }
  return out;
};

export type MarcasPantalla = { notificacion: number; cabecera: number; frases: Record<string, Record<number, number>> };

export const ChatScreen: React.FC<{
  ep: Episodio;
  st: number;
  f: number;
  marcas: MarcasPantalla;
  /** 0..1 presión del botón «Copiar» */
  presion: number;
}> = ({ ep, st, f, marcas, presion }) => {
  const tel = ep.telefono;
  const n = tel.notificacion;
  const copiado = st >= (tel.toques[0]?.f ?? Infinity);
  const visibles: { m: MensajeChat | null; key: string; t: number; h: number }[] = [];
  for (const m of tel.mensajes) {
    if (m.escribiendo !== undefined && st >= m.escribiendo && st < m.f) {
      visibles.push({ m: null, key: `${m.id}-typing`, t: enter(st, m.escribiendo, 6), h: ALTO_ESCRIBIENDO });
    }
    if (st >= m.f) visibles.push({ m, key: m.id, t: enter(st, m.f), h: altoBurbuja(m.texto) });
  }
  const pegado = st >= tel.entrada.fPegado && st < tel.entrada.fEnviado;
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
      <div style={{ height: CHAT_LAYOUT.status }}>
        <StatusBar hora={tel.hora} />
      </div>
      <div style={{ height: CHAT_LAYOUT.notifH, marginTop: CHAT_LAYOUT.notifTop - CHAT_LAYOUT.status, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <SmsNotification n={n} t={enter(st, n.f, 10)} marcado={marcas.notificacion} presionado={presion} copiado={copiado} pulso={interpolate(st, [n.f, n.f + 6, n.f + 16], [0, 1, 0], CLAMP)} />
      </div>
      <div style={{ height: CHAT_LAYOUT.headerH, marginTop: CHAT_LAYOUT.headerGap, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <ChatHeader nombre={tel.contacto} estado={tel.estado} inicial={tel.inicial} marcado={marcas.cabecera} />
      </div>
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 18, right: 18, bottom: CHAT_LAYOUT.listBottom, display: "flex", flexDirection: "column", gap: 0 }}>
          {visibles.map(({ m, key, t, h }) => (
            <div key={key} style={{ height: (h + CHAT.gap) * interpolate(t, [0, 1], [0, 1], { ...CLAMP, easing: OUT_CUBIC }), overflow: "visible", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
              <div style={{ paddingTop: CHAT.gap }}>
                {m ? <Bubble de={m.de} texto={m.texto} hora={m.hora} t={t} marcadas={marcas.frases[m.id]} mono={m.de === "yo" && /^[\d\s]+$/.test(m.texto)} /> : <TypingBubble f={f} t={t} />}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ height: CHAT_LAYOUT.inputH, boxSizing: "border-box", display: "flex", alignItems: "center", gap: 14, padding: "8px 18px 18px" }}>
        <div style={{ flex: 1, background: COLOR.bubbleIn, borderRadius: 999, padding: "16px 26px", ...(pegado ? TYPE.monoBold : TYPE.ui), fontSize: pegado ? 36 : 30, color: pegado ? COLOR.text : COLOR.muted, whiteSpace: "nowrap", overflow: "hidden" }}>
          {pegado ? tel.entrada.pegado : tel.entrada.placeholder}
        </div>
        <div style={{ width: 70, height: 70, borderRadius: 35, background: pegado ? COLOR.bubbleOut : COLOR.bubbleIn, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
          <IconoEnviar size={32} color={pegado ? COLOR.text : COLOR.muted} />
        </div>
      </div>
    </div>
  );
};

/** Ajustes › … › Verificación en dos pasos, con el interruptor (defensa). */
export const SettingsScreen: React.FC<{ ep: Episodio; on: number }> = ({ ep, on }) => {
  const d = ep.defensa;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <StatusBar hora={ep.telefono.hora} />
      <div style={{ padding: "20px 26px" }}>
        <div style={{ ...TYPE.uiStrong, fontSize: 52, color: COLOR.text }}>{d.titulo}</div>
        <div style={{ ...TYPE.ui, fontSize: 28, lineHeight: 1.3, color: COLOR.muted, marginTop: 10 }}>
          {d.ruta.split("\n").map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
        <div style={{ marginTop: 36 }}>
          <SettingsRow titulo={d.ajuste} detalle={d.detalle} on={on} />
        </div>
      </div>
    </div>
  );
};

/** Teléfono del ladrón: tamaño base (se escala entero). Textos ≥ 30 px para que a escala de cámara queden ≥ 24 px. */
export const SEGUNDO = { w: 260, h: 500, pantallaW: 260 - 2 * Math.round((16 * 260) / 540), pantallaH: 500 - 2 * Math.round((16 * 260) / 540) } as const;
const CONDENSADA = { fontVariationSettings: "'wdth' 78" } as const;

/** pantalla de registro: «Ingresa el código…», tu número y el código que entra dígito a dígito */
export const RegistroScreen: React.FC<{ ep: Episodio; f: number }> = ({ ep, f }) => {
  const s = ep.segundoTelefono;
  const digitos = s.codigo.replace(/\s/g, "").split("");
  return (
    <div style={{ position: "absolute", inset: 0, padding: "58px 12px 0", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
      <div style={{ ...TYPE.uiStrong, ...CONDENSADA, fontSize: 31, lineHeight: 1.15, color: COLOR.text }}>
        {s.titulo.split("\n").map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>
      <div style={{ ...TYPE.ui, ...CONDENSADA, fontSize: 30, color: COLOR.muted, marginTop: 18, whiteSpace: "nowrap" }}>{s.numero}</div>
      <div style={{ display: "flex", gap: 6, marginTop: 30 }}>
        {digitos.map((d, i) => {
          const t = enter(f, s.fCodigo + i * 4, 5);
          return (
            <div key={i} style={{ width: 33, height: 50, borderRadius: 8, border: `2px solid ${t > 0.5 ? COLOR.text : ALPHA.glassEdge}`, display: "flex", alignItems: "center", justifyContent: "center", ...TYPE.monoBold, fontSize: 30, color: COLOR.text }}>
              <span style={{ opacity: t }}>{d}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** escribe en el grupo «Familia» con tu nombre */
export const GrupoScreen: React.FC<{ ep: Episodio; f: number }> = ({ ep, f }) => {
  const g = ep.segundoTelefono.grupo;
  const t = enter(f, g.f, 8);
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "52px 14px 12px", borderBottom: `1px solid ${ALPHA.hairline}` }}>
        <div style={{ width: 46, height: 46, borderRadius: 23, background: COLOR.bubbleOut, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
          <IconoCasa size={28} />
        </div>
        <div style={{ ...TYPE.uiStrong, ...CONDENSADA, fontSize: 32, color: COLOR.text }}>{g.nombre}</div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 12 }}>
        <div style={{ alignSelf: "flex-end", opacity: t, transform: `translateY(${(1 - t) * 18}px)`, background: COLOR.bubbleOut, borderRadius: 20, borderBottomRightRadius: 6, padding: "12px 16px 10px" }}>
          <div style={{ ...TYPE.monoBold, fontSize: 30, color: COLOR.muted }}>{g.autor}</div>
          <div style={{ ...TYPE.ui, ...CONDENSADA, fontSize: 32, lineHeight: 1.18, color: COLOR.text }}>
            {g.mensaje.split("\n").map((l, i) => (
              <div key={i}>{l}</div>
            ))}
          </div>
          <div style={{ ...TYPE.ui, fontSize: 30, color: COLOR.muted, textAlign: "right" }}>{g.hora}</div>
        </div>
      </div>
    </div>
  );
};
