// Español neutro con TUTEO (toda LATAM y España). Para pasar a voseo se cambia solo este archivo.
// `\n` = renglón fijo · `[frase]` = lo que señala un marcador · `{icono}` = ícono SVG.
import type { Textos } from "./tipos";

export const ES: Textos = {
  recreacion: "RECREACIÓN",
  caso: "CASO #001",
  siguiente: "CASO #002 →",
  rebobinando: "REBOBINANDO",
  gancho: { pregunta: "¿SE LO PASAS?", opciones: ["PASAR", "NO"] },
  telefono: { hora: "9:41", contacto: "Caro · vóley", estado: "en línea", inicial: "C", placeholder: "Mensaje" },
  notificacion: { app: "Mensajes", cuando: "ahora", texto: "Tu código de registro:", codigo: "482 913", copiar: "Copiar", copiado: "Copiado", pie: "No lo compartas." },
  mensajes: {
    b1: "¡Perdón! Te mandé\nun código\n[por error] {verguenza}",
    b2: "¿Me lo pasas?\n[Es urgente]",
    enviado: "482 913",
    horas: ["21:14", "21:14", "21:15"],
  },
  perdida: { banner: "Tu número se registró\nen otro teléfono", sello: "CUENTA PERDIDA" },
  segundo: { titulo: "Ingresa el código\nde 6 dígitos", numero: "+00 000 000 4821", grupo: "Familia", mensaje: "Hola, ¿me\nprestan plata\nhasta mañana?", autor: "Tú", hora: "21:17" },
  grafo: { titulo: "ASÍ SE CONTAGIA", caro: "Caro", tu: "Tú", familia: "Familia", voley: "Vóley" },
  vidrio: "chats anteriores:\nno los ve",
  defensa: { titulo: "Ajustes", ruta: "Ajustes › Cuenta ›\nVerificación en dos pasos", ajuste: "Verificación\nen dos pasos", detalle: "Pide tu PIN al registrar\ntu número" },
  ficha: { titulo: "SI YA TE PASÓ", lineas: ["Vuelve a entrar con un\ncódigo nuevo → se\ncierra su sesión.", "Si te piden PIN:\nespera 7 días."] },
  cierre: { cabecera: "MÁNDASELO A QUIEN\nDICE «YO NO CAIGO»", siguiente: "CASO #002 →\n«Hola, cambié de número»" },
  sponsor: { plantilla: "Este caso te lo trae {nombre} · {claim}", etiqueta: "PUBLICIDAD" },
  voz: {
    v01: { dicho: "Una amiga te pide un código que te llegó por error." },
    v02: { dicho: "¿Se lo pasas?" },
    v03: { dicho: "Si se lo pasaste, acabas de entregar tu WhatsApp." },
    v04: { dicho: "Rebobinemos." },
    v05: { dicho: "Ese código no es de ella. Es la llave de tu cuenta: alguien la está registrando en otro teléfono, ahora." },
    v06: { dicho: "¿Y por qué te escribe tu amiga? Porque a ella ya se la robaron. Así se contagia." },
    v07: { dicho: "La excusa llega antes que la duda." },
    v08: { dicho: "Y la prisa no te deja pensar." },
    v09: { dicho: "No puede leer tus chats viejos. No los necesita: escribe en tus grupos, con tu nombre." },
    v10: { dicho: "La defensa: un código nunca se pasa. Y activa la verificación en dos pasos: aunque te lo saquen, no les alcanza." },
    v11: { dicho: "Si ya te pasó, vuelve a entrar con un código nuevo y lo sacas." },
    v12: { dicho: "Mándaselo a quien siempre dice «yo no caigo»." },
  },
  enfasis: ["código", "llave", "contagia", "excusa", "prisa", "dos pasos"],
  remates: ["Rebobinemos."],
};
