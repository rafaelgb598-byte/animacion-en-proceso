// Plantilla de la serie «Anatomía de una estafa»: Backdrop → Cámara (mesa + teléfonos + marcadores) → Overlays → Subtítulos → Audio.
// No sabe nada de códigos de 6 dígitos: todo sale del `Episodio` (escena.ts + i18n del episodio).
import React, { useEffect, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Subtitulos } from "../../../canal/subtitulos/Subtitulos";
import type { Fuente } from "../../../canal/subtitulos/estilo";
import { ANCHO_TEXTO_MAX, CARRIL, CENTRO_X, ZONA } from "../../../canal/zonaSegura";
import { CLAMP, OUT_CUBIC, SPRING_MARKER, SPRING_SETTLE, between, enter, exit, springIn, track } from "./anim";
import { AudioCanal } from "./AudioCanal";
import { Backdrop } from "./Backdrop";
import { CAM, type CamState, camara, proyectarMesa } from "./camara";
import { IconoCandado } from "./chat/Iconos";
import { CHAT_LAYOUT, ChatScreen, GrupoScreen, RegistroScreen, SEGUNDO, SettingsScreen, filaCabecera, filaNotificacion, filasMensajes, type MarcasPantalla } from "./chat/Pantallas";
import { Phone } from "./chat/Phone";
import { SystemBanner } from "./chat/SystemBanner";
import { ContagionGraph } from "./ContagionGraph";
import { EvidenceMarker } from "./EvidenceMarker";
import { ForensicCard } from "./ForensicCard";
import { Dedo, Gancho } from "./Gancho";
import { RecreationTag } from "./RecreationTag";
import { RewindFx } from "./RewindFx";
import { SponsorSlot } from "./SponsorSlot";
import { ALPHA, COLOR, FONT, FONTS_READY, MARKER, PHONE, TYPE } from "./theme";
import type { Capa, Episodio } from "./tipos";
import { palabrasDelVideo } from "./voz";

const W = PHONE.w;
const H = PHONE.h;
const BEZEL = PHONE.bezel;
const SCREEN_H = H - 2 * BEZEL;
/** separación de cada marcador respecto del borde izquierdo del teléfono (escalonados para que no se tapen los números) */
const MARKER_OFF = [160, 84, 160, 84] as const;

/** Fuente de los subtítulos del canal (Archivo 900, la familia de la marca) para el sistema compartido. */
export const FUENTE_SUBS_CANAL: Fuente = { familia: FONT.archivo, listo: FONTS_READY };

const useFuentesCanal = () => {
  const [handle] = useState(() => delayRender("fuentes del canal Ciberseguridad"));
  useEffect(() => {
    FONTS_READY().then(() => continueRender(handle));
  }, [handle]);
};

/** marcas (subrayado + marcador) de cada objetivo en el frame f */
const marcasEn = (ep: Episodio, f: number): MarcasPantalla => {
  const m: MarcasPantalla = { notificacion: 0, cabecera: 0, frases: {} };
  for (const k of ep.marcadores) {
    const t = interpolate(f, [k.f + 6, k.f + 18], [0, 1], { ...CLAMP, easing: OUT_CUBIC }) * exit(f, ep.marcadoresSalen, 14);
    if (k.objetivo === "notificacion") m.notificacion = t;
    else if (k.objetivo === "cabecera") m.cabecera = t;
    else m.frases[k.objetivo] = { ...(m.frases[k.objetivo] ?? {}), [k.frase ?? 0]: t };
  }
  return m;
};

/** fila (y en la pantalla del teléfono) de cada objetivo, en el estado de la autopsia */
const filaObjetivo = (ep: Episodio, objetivo: string, stAutopsia: number) => {
  if (objetivo === "notificacion") return filaNotificacion();
  if (objetivo === "cabecera") return filaCabecera();
  return filasMensajes(ep.telefono.mensajes, stAutopsia, SCREEN_H)[objetivo] ?? SCREEN_H / 2;
};

const Mesa: React.FC<{ ep: Episodio; f: number; c: CamState; fps: number }> = ({ ep, f, c, fps }) => {
  const st = ep.escena(f);
  const px = track(f, ep.telefonoX);
  const left = px - W / 2;
  const top = CAM.oy - H / 2;
  const marcas = marcasEn(ep, f);
  const p = ep.perdida;
  // la pérdida depende del tiempo de ESCENA: en el rebobinado el aviso «se va» solo
  const perdidaT = enter(st, p.f, 8);
  const apagado = interpolate(st, [p.f + 10, p.f + 30], [0, 1], CLAMP) * (st >= p.f ? 1 : 0);
  const sello = spring({ frame: st - (p.f + 22), fps, config: { damping: 12, stiffness: 180 } }) * (st >= p.f + 22 ? 1 : 0);
  const d = ep.defensa;
  const ajustes = between(f, d.f + 8, d.hasta, 12, 14);
  const toggle = springIn(f, d.fToggle, fps, SPRING_SETTLE);
  const presion = Math.max(0, ...ep.telefono.toques.slice(0, 1).map((t) => interpolate(st, [t.f - 3, t.f, t.f + 6], [0, 1, 0], CLAMP)));
  const v = ep.vidrio;
  const vidrio = between(f, v.f, v.hasta, 12, 12);
  const listTop = CHAT_LAYOUT.notifTop + CHAT_LAYOUT.notifH + CHAT_LAYOUT.headerGap + CHAT_LAYOUT.headerH;
  const stAut = ep.escena(ep.rebobinado.hasta);
  const glare = 0.5 + c.x / 200 + c.th / 110;
  return (
    <>
      {/* líneas guía de los marcadores (sobre la mesa) */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {ep.marcadores.map((k, i) => {
          const t = interpolate(f, [k.f + 4, k.f + 16], [0, 1], { ...CLAMP, easing: OUT_CUBIC }) * exit(f, ep.marcadoresSalen, 14);
          if (t <= 0) return null;
          const y = top + BEZEL + filaObjetivo(ep, k.objetivo, stAut);
          const x0 = left - MARKER_OFF[i % MARKER_OFF.length] + MARKER.w * 0.32;
          const x1 = left + BEZEL + 26;
          return <line key={k.n} x1={x0} y1={y} x2={x0 + (x1 - x0) * t} y2={y} stroke={COLOR.evidence} strokeWidth={MARKER.guide} strokeLinecap="round" />;
        })}
      </svg>
      {/* teléfono principal */}
      <div style={{ position: "absolute", left, top, width: W, height: H, transformStyle: "preserve-3d" }}>
        <Phone
          w={W}
          h={H}
          glare={glare}
          apagado={apagado * (1 - ajustes)}
          encima={
            <>
              {perdidaT > 0 ? <SystemBanner texto={p.banner} t={perdidaT} /> : null}
              {sello > 0 ? (
            <div style={{ position: "absolute", left: 0, right: 0, top: SCREEN_H * 0.46, display: "flex", justifyContent: "center", opacity: Math.min(1, sello) * perdidaT }}>
              <div style={{ ...TYPE.monoBold, fontSize: 58, letterSpacing: "0.06em", color: COLOR.danger, border: `6px solid ${COLOR.danger}`, borderRadius: 12, padding: "8px 22px", transform: `rotate(-8deg) scale(${1.6 - 0.6 * sello})`, background: ALPHA.dangerWash }}>
                {p.sello}
              </div>
            </div>
          ) : null}
            </>
          }
        >
          <ChatScreen ep={ep} st={st} f={f} marcas={marcas} presion={presion} />
          {vidrio > 0 ? (
            <div style={{ position: "absolute", left: 0, right: 0, top: listTop, bottom: CHAT_LAYOUT.inputH, opacity: vidrio }}>
              <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
                <filter id="cdEsmerilado">
                  <feTurbulence type="fractalNoise" baseFrequency={0.55} numOctaves={3} seed={7} />
                  <feColorMatrix type="matrix" values="0 0 0 0 0.55  0 0 0 0 0.6  0 0 0 0 0.66  0 0 0 0.55 0" />
                </filter>
                <rect width="100%" height="100%" fill={COLOR.slateLit} />
                <rect width="100%" height="100%" filter="url(#cdEsmerilado)" />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
                <div style={{ ...TYPE.monoBold, fontSize: 40, lineHeight: 1.25, textAlign: "center", color: COLOR.text, background: COLOR.bg, borderRadius: 12, padding: "14px 18px" }}>
                  {v.etiqueta.split("\n").map((l, i) => (
                    <div key={i}>{l}</div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
          {ajustes > 0 ? (
            <div style={{ position: "absolute", inset: 0, background: COLOR.screen, opacity: ajustes }}>
              <SettingsScreen ep={ep} on={toggle} />
            </div>
          ) : null}
        </Phone>
      </div>
      {/* marcadores */}
      {ep.marcadores.map((k, i) => {
        const t = springIn(f, k.f, fps, SPRING_MARKER);
        const y = top + BEZEL + filaObjetivo(ep, k.objetivo, stAut);
        return <EvidenceMarker key={k.n} n={k.n} x={left - MARKER_OFF[i % MARKER_OFF.length]} y={y + 30} t={t} opacidad={exit(f, ep.marcadoresSalen, 14)} />;
      })}
    </>
  );
};

/** El teléfono del ladrón: de pie, frío y sin rostro. */
const SegundoTelefono: React.FC<{ ep: Episodio; f: number; fps: number }> = ({ ep, f, fps }) => {
  const s = ep.segundoTelefono;
  if (f < s.entra || f > s.sale + 20) return null;
  const pos = { x: track(f, s.posicion.map((k) => ({ f: k.f, v: k.x }))), y: track(f, s.posicion.map((k) => ({ f: k.f, v: k.y }))), s: track(f, s.posicion.map((k) => ({ f: k.f, v: k.s }))) };
  const entra = springIn(f, s.entra, fps, SPRING_SETTLE);
  const sale = 1 - exit(f, s.sale, 14);
  const dx = (1 - entra) * 420 + sale * 420;
  const w = SEGUNDO.w * pos.s;
  const h = SEGUNDO.h * pos.s;
  const grupo = between(f, s.grupo.f - 8, ep.defensa.f + 30, 8, 10);
  const candado = springIn(f, s.candado, fps, { damping: 12, stiffness: 160 });
  // en la defensa la pantalla del ladrón queda tapada: solo el candado (sin textos chicos)
  const candadoOp = enter(f, ep.defensa.f + 8, 14);
  return (
    <div style={{ position: "absolute", left: pos.x - w / 2 + dx, top: pos.y - h / 2, width: w, height: h, opacity: entra * (1 - sale), transform: "perspective(1200px) rotateY(-14deg)" }}>
      <Phone w={w} h={h} frio glow={0.5}>
        <div style={{ position: "absolute", left: 0, top: 0, transform: `scale(${pos.s})`, transformOrigin: "0 0", width: SEGUNDO.pantallaW, height: SEGUNDO.pantallaH }}>
          <RegistroScreen ep={ep} f={f} />
          {grupo > 0 ? (
            <div style={{ position: "absolute", inset: 0, background: COLOR.screen, opacity: grupo }}>
              <GrupoScreen ep={ep} f={f} />
            </div>
          ) : null}
        </div>
        {candadoOp > 0 ? (
          <div style={{ position: "absolute", inset: 0, background: COLOR.screen, opacity: candadoOp, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <IconoCandado size={w * 0.5} cierre={Math.min(1, candado)} />
          </div>
        ) : null}
      </Phone>
    </div>
  );
};

/** Línea amarilla que une el código de tu teléfono con la pantalla del otro (la llave). */
const Enlace: React.FC<{ ep: Episodio; f: number; c: CamState }> = ({ ep, f, c }) => {
  const e = ep.enlace;
  const t = interpolate(f, [e.f, e.f + 16], [0, 1], { ...CLAMP, easing: OUT_CUBIC }) * exit(f, e.hasta, 12);
  if (t <= 0) return null;
  const px = track(f, ep.telefonoX);
  const a = proyectarMesa(px + 120, CAM.oy - H / 2 + BEZEL + filaNotificacion(), c.th);
  const s = ep.segundoTelefono;
  const sx = track(f, s.posicion.map((k) => ({ f: k.f, v: k.x })));
  const sy = track(f, s.posicion.map((k) => ({ f: k.f, v: k.y })));
  const b = { x: sx - 40, y: sy + 30 };
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <line x1={a.x} y1={a.y} x2={a.x + (b.x - a.x) * t} y2={a.y + (b.y - a.y) * t} stroke={COLOR.evidence} strokeWidth={MARKER.guide + 1} strokeLinecap="round" />
      <circle cx={a.x} cy={a.y} r={9} fill={COLOR.evidence} />
      {t >= 1 ? <circle cx={b.x} cy={b.y} r={9} fill={COLOR.evidence} /> : null}
    </svg>
  );
};

const Camara: React.FC<{ ep: Episodio; f: number; fps: number }> = ({ ep, f, fps }) => {
  const c = camara(ep, f);
  return (
    <AbsoluteFill style={{ transform: `translate(${c.x}px, ${c.y}px) scale(${c.s})`, transformOrigin: `${CAM.ox}px ${CAM.oy}px` }}>
      <AbsoluteFill style={{ perspective: `${CAM.persp}px`, perspectiveOrigin: `${CAM.ox}px ${CAM.oy}px` }}>
        <AbsoluteFill style={{ transformStyle: "preserve-3d", transformOrigin: `${CAM.ox}px ${CAM.oy}px`, transform: `rotateX(${c.th}deg)` }}>
          <Mesa ep={ep} f={f} c={c} fps={fps} />
        </AbsoluteFill>
      </AbsoluteFill>
      <ContagionGraph ep={ep} f={f} />
      <SegundoTelefono ep={ep} f={f} fps={fps} />
      <Enlace ep={ep} f={f} c={c} />
    </AbsoluteFill>
  );
};

const Cierre: React.FC<{ ep: Episodio; f: number }> = ({ ep, f }) => {
  const k = ep.cierre;
  const t = between(f, k.f, k.hasta, 10, 12);
  if (t <= 0) return null;
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: ALPHA.dim, opacity: t }} />
      <div style={{ position: "absolute", left: CENTRO_X - ANCHO_TEXTO_MAX / 2, width: ANCHO_TEXTO_MAX, top: 430, textAlign: "center", whiteSpace: "nowrap", ...TYPE.headline, fontSize: 84, lineHeight: 1.02, color: COLOR.text, opacity: t, transform: `translateY(${(1 - t) * -16}px)` }}>
        {k.cabecera.split("\n").map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>
      <div style={{ position: "absolute", left: CENTRO_X - ANCHO_TEXTO_MAX / 2, width: ANCHO_TEXTO_MAX, bottom: 1920 - CARRIL.bottom, textAlign: "center", opacity: t }}>
        {k.siguiente.split("\n").map((l, i) => (
          <div key={i} style={{ ...(i === 0 ? TYPE.monoBold : TYPE.mono), fontSize: i === 0 ? 48 : 38, lineHeight: 1.3, color: i === 0 ? COLOR.text : COLOR.muted }}>
            {l}
          </div>
        ))}
      </div>
    </>
  );
};

const ZonasSeguras: React.FC = () => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
    <rect x={ZONA.left} y={ZONA.top} width={ZONA.right - ZONA.left} height={ZONA.bottom - ZONA.top} fill="none" stroke="#FF0040" strokeWidth={3} strokeDasharray="12 8" />
    <rect x={CENTRO_X - ANCHO_TEXTO_MAX / 2 - 12} y={1300 - 12} width={ANCHO_TEXTO_MAX + 24} height={ZONA.bottom - 1300 + 12} fill="none" stroke="#00E0FF" strokeWidth={3} strokeDasharray="10 8" />
    <line x1={CENTRO_X} y1={0} x2={CENTRO_X} y2={1920} stroke="#00E0FF" strokeWidth={2} strokeDasharray="6 10" />
  </svg>
);

/** capa: "todo" (video) · "subtitulos" (solo subtítulos, fondo transparente) · "escena" (todo menos subtítulos y audio)
 *  · "fondo" (solo fondo, viñeta y grano: con "escena" el QA saca la máscara de teléfonos, marcadores y textos) */
export const AnatomiaEstafa: React.FC<{ ep: Episodio; capa: Capa; showSafeZones: boolean; /** hoja de contactos: escena + subtítulos, sin audio */ conSubtitulos?: boolean }> = ({
  ep,
  capa,
  showSafeZones,
  conSubtitulos = false,
}) => {
  useFuentesCanal();
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const escena = capa === "todo" || capa === "escena";
  const subs = capa === "todo" || capa === "subtitulos" || conSubtitulos;
  // solo las palabras que se subtitulan: las de los tramos ocultos (gancho y cierre, ya escritos en pantalla) no entran al paginado
  const palabras = React.useMemo(() => palabrasDelVideo(ep.voz, fps).filter((w) => ep.subtitulos.visible(Math.round(w.s * fps))), [ep.voz, ep.subtitulos, fps]);
  const sp = ep.sponsor;
  return (
    <AbsoluteFill style={{ backgroundColor: capa === "subtitulos" ? undefined : COLOR.bg }}>
      {capa !== "subtitulos" ? <Backdrop f={f} /> : null}
      {escena ? (
        <>
          <Camara ep={ep} f={f} fps={fps} />
          <RewindFx ep={ep} f={f} fps={fps} />
          <Gancho ep={ep} f={f} />
          <Dedo ep={ep} f={f} />
          <ForensicCard f={f} desde={ep.ficha.f} hasta={ep.ficha.hasta} titulo={ep.ficha.titulo} lineas={ep.ficha.lineas} />
          <SponsorSlot f={f} desde={sp.f} hasta={sp.hasta} nombre={sp.nombre} claim={sp.claim} activo={sp.activo} plantilla={sp.plantilla} etiqueta={sp.etiqueta} />
          <Cierre ep={ep} f={f} />
          <RecreationTag texto={ep.etiquetas.recreacion} caso={ep.caso.numero} />
        </>
      ) : null}
      {subs ? (
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          <Subtitulos f={f} palabras={palabras} enfasis={ep.subtitulos.enfasis} remates={ep.subtitulos.remates} visible={ep.subtitulos.visible} fuente={FUENTE_SUBS_CANAL} colorEnfasis={COLOR.evidence} debug={showSafeZones} />
        </svg>
      ) : null}
      {capa === "todo" ? <AudioCanal ep={ep} /> : null}
      {showSafeZones && escena ? <ZonasSeguras /> : null}
    </AbsoluteFill>
  );
};
