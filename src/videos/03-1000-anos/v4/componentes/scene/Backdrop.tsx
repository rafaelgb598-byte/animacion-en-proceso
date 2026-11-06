import React from "react";
import { AbsoluteFill } from "remotion";
import { MAT } from "../../theme";

/** Vacío: gradiente radial bgLit → bg (lo que se ve fuera del set). */
export const Backdrop: React.FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 55% at 50% 52%, ${MAT.bgLit} 0%, ${MAT.bg} 70%, ${MAT.black} 100%)` }} />
);
