const formatoPorcentaje = new Intl.NumberFormat("es", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const formatoNumero = new Intl.NumberFormat("es", { maximumFractionDigits: 2 });

export function mostrarError(elemento, mensaje) {
  elemento.textContent = mensaje;
  elemento.classList.remove("oculto");
}

export function ocultar(elemento) {
  elemento.classList.add("oculto");
}

export function formatearPorcentaje(proporcion) {
  return formatoPorcentaje.format(proporcion).replace(/\s?%/, " %");
}

export function formatearNumero(valor) {
  return formatoNumero.format(valor);
}

export function formatearHora(iso) {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return "";
  return fecha.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });
}
