// Decisión de presentación, no del modelo: por debajo de este valor una
// predicción "No falla" se muestra como "Vigilar". El modelo detecta cerca de
// 7 de cada 10 fallas reales, así que "No falla" no es una garantía.
export const UMBRAL_VIGILAR = 0.2;

export function clasificar(prediccion) {
  if (prediccion.prediccion === "Falla") return "falla";
  return prediccion.probabilidad_falla >= UMBRAL_VIGILAR ? "vigilar" : "ok";
}

export const ETIQUETAS = {
  ok: "No falla",
  vigilar: "Vigilar",
  falla: "Falla",
};

export const ICONOS = {
  ok: "✓",
  vigilar: "!",
  falla: "✕",
};

export const DETALLES = {
  ok: "El modelo no anticipa una falla. Eso no la descarta: detecta cerca de 7 de cada 10 fallas reales.",
  vigilar: "El modelo no marca falla, pero la probabilidad es intermedia. Conviene revisar la máquina.",
  falla: "El modelo anticipa una falla. Conviene programar una revisión.",
};
