// Efectos del canal Despiece: sintetizados por código (scripts/gen-sfx-despiece.mjs), sin licencias ni música.
// Compartidos por todos los episodios: public/videos/despiece/sfx/
export const SFX = {
  /** la línea de corte recorriendo el objeto (zumbido corto, sube de tono) */
  corte: "videos/despiece/sfx/corte.wav",
  /** las mitades se separan (aire + clic seco) */
  apertura: "videos/despiece/sfx/apertura.wav",
  /** etiqueta que se dibuja (tic de lápiz) */
  trazo: "videos/despiece/sfx/trazo.wav",
  /** un perno que se asienta en su altura (tic metálico corto) */
  tic: "videos/despiece/sfx/tic.wav",
  /** la llave entrando (roce metálico) */
  llave: "videos/despiece/sfx/llave.wav",
  /** destello sobre la línea de corte */
  destello: "videos/despiece/sfx/destello.wav",
  /** el rotor gira y traba (clac) */
  clac: "videos/despiece/sfx/clac.wav",
  /** la llave incorrecta: el rotor intenta y rebota (golpe metálico apagado) */
  rebote: "videos/despiece/sfx/rebote.wav",
  /** aparece el aviso del próximo despiece */
  chip: "videos/despiece/sfx/chip.wav",
  /** el corte rápido que abre el objeto en el gancho (0,4 s) */
  whoosh: "videos/despiece/sfx/whoosh.wav",
  /** tics crecientes (cada uno más agudo y más fuerte): la progresión que termina en el clac */
  tic1: "videos/despiece/sfx/tic1.wav",
  tic2: "videos/despiece/sfx/tic2.wav",
  tic3: "videos/despiece/sfx/tic3.wav",
  tic4: "videos/despiece/sfx/tic4.wav",
  tic5: "videos/despiece/sfx/tic5.wav",
  /** clac fuerte del giro (vista de frente) */
  clacFuerte: "videos/despiece/sfx/clac-fuerte.wav",
  /** zumbido metálico seco: no gira */
  bzz: "videos/despiece/sfx/bzz.wav",
  /** ambiente de taller muy bajo (ruido rosa filtrado), 40 s */
  ambiente: "videos/despiece/sfx/ambiente.wav",
} as const;
export type SfxId = keyof typeof SFX;

/** volúmenes de mezcla (la voz va al frente; el ambiente, apenas presente) */
export const MEZCLA = { voz: 1, sfx: 0.55, ambiente: 0.12, ducking: 0.6 } as const;
