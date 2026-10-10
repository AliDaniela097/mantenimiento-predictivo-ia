const TRADUCCIONES = {
  missing: () => "Este campo es obligatorio",
  greater_than: (ctx) => `Debe ser mayor que ${ctx.gt}`,
  greater_than_equal: (ctx) => `Debe ser mayor o igual a ${ctx.ge}`,
  literal_error: () => "Elige L, M o H",
  float_parsing: () => "Ingresa un número",
  finite_number: () => "Ingresa un número válido",
};

/**
 * Convierte una respuesta de error de la API en un mensaje general y,
 * si la API indica el campo (400 con details[].loc), un mensaje por campo.
 */
export function interpretarError(res, mensajePorDefecto) {
  const datos = res.datos || {};
  const campos = {};

  if (Array.isArray(datos.details)) {
    for (const detalle of datos.details) {
      const campo = Array.isArray(detalle.loc) ? detalle.loc[detalle.loc.length - 1] : null;
      if (!campo || campos[campo]) continue;
      const traducir = TRADUCCIONES[detalle.type];
      campos[campo] = traducir ? traducir(detalle.ctx || {}) : detalle.msg;
    }
  }

  if (Object.keys(campos).length > 0) {
    return { mensaje: "Revisa los campos marcados.", campos };
  }

  const texto = typeof datos.error === "string" ? datos.error : typeof datos.detail === "string" ? datos.detail : null;
  return { mensaje: texto || mensajePorDefecto, campos };
}
