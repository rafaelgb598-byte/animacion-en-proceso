// Episodio «el celular en la mesa de luz»: objetos, etiquetas, ganador, gancho y origen del zoom.
import React from "react";
import { Book } from "../componentes/props/Book";
import { Bottle } from "../componentes/props/Bottle";
import { Charger } from "../componentes/props/Charger";
import { Lamp } from "../componentes/props/Lamp";
import { Nightstand } from "../componentes/props/Nightstand";
import { Phone, phonePort } from "../componentes/props/Phone";
import { Floor, Mound } from "../componentes/scene/Ground";
import { Grass } from "../componentes/scene/Grass";
import { Room, Sky } from "../componentes/scene/Room";
import { Vine } from "../componentes/scene/Vine";
import { ghostOpacity, glintT } from "../lib/power";
import { LAYOUT } from "../theme";
import type { Episode } from "../types";
import { SOURCED_FIGURES } from "./celular.decay";
import VOZ from "./celular.voz.json";
import { VOICE_CUES, type VoiceId } from "../timeline";

const P = LAYOUT.phone;
const h = React.createElement;

/** El gancho y «La foto, no.» ya están escritos en pantalla: no se subtitulan dos veces. */
const NO_SUBS: readonly VoiceId[] = ["hook", "photo"];

export const CELULAR: Episode = {
  id: "celular",
  voice: (Object.keys(VOICE_CUES) as VoiceId[]).map((id) => ({
    id,
    from: VOICE_CUES[id],
    file: `videos/03-1000-anos/v2/voz/${id}.wav`,
    duration: VOZ[id].duration,
    phrases: VOZ[id].phrases,
    subtitles: !NO_SUBS.includes(id),
  })),
  hook: [
    ["Lo", "dejás", "cargando."],
    ["Nunca", "volvés."],
  ],
  labels: {
    power: "luz · cortada (nadie paga)",
    screen: "pantalla · apagada",
    paper: "papel · amarillea",
    fabricStain: "tela · se mancha",
    window: "ventana · rota",
    battery: "batería de litio · puede hincharse",
    bookSwell: "libro · se hincha",
    particleboard: "aglomerado · se deshace",
    bookGone: "libro · desapareció",
    fabricGone: "tela · desapareció",
    woodGone: "madera · desapareció",
    copper: "cobre del cable · verde",
    petDeformed: "PET · deformado, entero",
    aluminum: SOURCED_FIGURES.aluminum.label,
    pet: SOURCED_FIGURES.pet.label,
  },
  winner: {
    kicker: "ÚLTIMO EN PIE",
    name: "el vidrio de la pantalla",
    figure: SOURCED_FIGURES.glass.label,
    foot: "simulación · estimaciones",
    after: "La foto, no.",
  },
  zoomTarget: LAYOUT.fragment,
  zoomScreen: LAYOUT.fragmentOnScreen,
  light: {
    lampPool: { x: LAYOUT.lamp.x, y: LAYOUT.lamp.y - 330, r: 560 },
    window: LAYOUT.window,
    beam: [
      [LAYOUT.window.x + 10, LAYOUT.window.y + 40],
      [LAYOUT.window.x + LAYOUT.window.w, LAYOUT.window.y],
      [1020, 1480],
      [430, 1640],
    ],
    screenGlow: { x: P.x, y: P.y, r: 300 },
  },
  scene: [
    { id: "sky", layer: "sky", render: (p) => h(Sky, p) },
    { id: "room", layer: "wall", render: (p) => h(Room, p) },
    {
      id: "vine",
      layer: "wall",
      render: (p) =>
        h(Vine, {
          ...p,
          path: [[150, 700], [132, 780], [112, 860], [92, 950], [74, 1040], [62, 1120], [84, 1180]],
          branch: [[400, 720], [470, 650], [540, 610], [620, 570], [700, 548], [790, 508], [880, 478]],
        }),
    },
    { id: "floor", layer: "main", render: (p) => h(Floor, p) },
    { id: "nightstand", layer: "main", render: (p) => h(Nightstand, p) },
    { id: "lamp", layer: "main", render: (p) => h(Lamp, { ...p, ...LAYOUT.lamp, drop: 320 }) },
    { id: "bottle", layer: "main", render: (p) => h(Bottle, { ...p, ...LAYOUT.bottle, drop: 330 }) },
    {
      id: "charger",
      layer: "main",
      render: (p) => h(Charger, { ...p, ...LAYOUT.charger, floorY: 1440, port: phonePort(P, p.year, p.frame) }),
    },
    { id: "phone", layer: "main", render: (p) => h(Phone, { ...p, spec: P, glint: glintT(p.frame), ghost: ghostOpacity(p.frame) }) },
    { id: "book", layer: "main", render: (p) => h(Book, { ...p, ...LAYOUT.book, drop: 330 }) },
    { id: "mound", layer: "front", render: (p) => h(Mound, p) },
    { id: "grass", layer: "front", render: (p) => h(Grass, { ...p, count: 300, flowerCount: 12 }) },
  ],
};
