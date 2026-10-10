import { salud } from "./api.js";

const indicador = document.getElementById("estado-servicio");
const texto = document.getElementById("estado-texto");

function fijar(disponible) {
  indicador.dataset.estado = disponible ? "ok" : "caido";
  texto.textContent = disponible ? "Servicio disponible" : "Sin conexión con el servicio";
}

export async function comprobarServicio() {
  try {
    const res = await salud();
    fijar(res.ok);
  } catch (err) {
    fijar(false);
  }
}

export function vigilarServicio() {
  comprobarServicio();
  setInterval(() => {
    if (!document.hidden) comprobarServicio();
  }, 30000);
}
