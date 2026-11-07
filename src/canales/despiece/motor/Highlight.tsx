// Resalta una o más piezas bajando la opacidad del resto al 35 %.
// <Highlight activo={0..1} foco={["col-2"]}> … <Resaltable id="col-2"> … </Resaltable> … </Highlight>
import React, { createContext, useContext } from "react";
import { z } from "zod";

export const highlightSchema = z.object({
  /** 0..1: cuánto está activo el resalte (para entrar y salir suave) */
  activo: z.number().min(0).max(1),
  /** ids de las piezas que quedan al 100 % */
  foco: z.array(z.string()),
  /** opacidad del resto con el resalte entero */
  resto: z.number().min(0).max(1).default(0.35),
});
type Estado = z.infer<typeof highlightSchema>;

const Ctx = createContext<Estado>({ activo: 0, foco: [], resto: 0.35 });

export const Highlight: React.FC<z.input<typeof highlightSchema> & { children: React.ReactNode }> = ({ children, ...raw }) => {
  const estado = highlightSchema.parse(raw);
  return <Ctx.Provider value={estado}>{children}</Ctx.Provider>;
};

/** opacidad de una pieza según el resalte vigente */
export const useResalte = (id: string) => {
  const { activo, foco, resto } = useContext(Ctx);
  return foco.includes(id) ? 1 : 1 - (1 - resto) * activo;
};

export const Resaltable: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => {
  const o = useResalte(id);
  return <g opacity={o}>{children}</g>;
};
