import { ErrorRed, listarPredicciones, sesionVencida } from "./api.js";
import { ETIQUETAS, clasificar } from "./riesgo.js";
import { formatearHora, formatearNumero, formatearPorcentaje, mostrarError, ocultar } from "./ui.js";

const LIMITE = 10;
const BLOQUE = 100;

const estado = { pagina: 1, paginas: 1, total: 0, items: [], soloFallas: false };
let alReusar = () => {};

const cuerpoTabla = document.querySelector("#tabla-historial tbody");
const tablaScroll = document.querySelector(".tabla-scroll");
const mensaje = document.getElementById("mensaje-historial");
const errorHistorial = document.getElementById("historial-error");
const paginacion = document.getElementById("paginacion");
const infoPagina = document.getElementById("pagina-info");
const botonRecientes = document.getElementById("btn-recientes");
const botonAntiguas = document.getElementById("btn-antiguas");
const filtroTodas = document.getElementById("filtro-todas");
const filtroFallas = document.getElementById("filtro-fallas");

function celda(texto, { etiqueta, clase } = {}) {
  const td = document.createElement("td");
  td.textContent = texto;
  if (etiqueta) td.dataset.etiqueta = etiqueta;
  if (clase) td.className = clase;
  return td;
}

function construirFila(item) {
  const nivel = clasificar(item);
  const fila = document.createElement("tr");
  fila.dataset.nivel = nivel;

  fila.append(celda(item.id, { etiqueta: "N.º", clase: "num" }));

  const tdResultado = celda("", { etiqueta: "Resultado" });
  const insignia = document.createElement("span");
  insignia.className = "insignia";
  insignia.textContent = ETIQUETAS[nivel];
  tdResultado.append(insignia);
  fila.append(tdResultado);

  fila.append(
    celda(formatearPorcentaje(item.probabilidad_falla), { etiqueta: "Prob. de falla", clase: "num" }),
    celda(item.tipo, { etiqueta: "Tipo" }),
    celda(formatearNumero(item.temperatura_aire_k), { etiqueta: "Aire (K)", clase: "num" }),
    celda(formatearNumero(item.temperatura_proceso_k), { etiqueta: "Proceso (K)", clase: "num" }),
    celda(formatearNumero(item.velocidad_rotacional_rpm), { etiqueta: "Velocidad (rpm)", clase: "num" }),
    celda(formatearNumero(item.torque_nm), { etiqueta: "Torque (Nm)", clase: "num" }),
    celda(formatearNumero(item.desgaste_herramienta_min), { etiqueta: "Desgaste (min)", clase: "num" }),
    celda(formatearHora(item.creado_en), { etiqueta: "Hora" })
  );

  const tdAccion = celda("");
  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = "boton secundario pequeno";
  boton.textContent = "Reusar";
  boton.setAttribute("aria-label", `Reusar los valores de la predicción n.º ${item.id}`);
  boton.addEventListener("click", () => alReusar(item));
  tdAccion.append(boton);
  fila.append(tdAccion);

  return fila;
}

function mostrarMensaje(texto) {
  if (texto) {
    mensaje.textContent = texto;
    mensaje.classList.remove("oculto");
  } else {
    mensaje.classList.add("oculto");
  }
}

function pintar() {
  cuerpoTabla.replaceChildren();
  const visibles = estado.soloFallas
    ? estado.items.filter((item) => item.prediccion === "Falla")
    : estado.items;

  visibles.forEach((item) => cuerpoTabla.append(construirFila(item)));
  tablaScroll.classList.toggle("oculto", visibles.length === 0);

  if (estado.total === 0) {
    mostrarMensaje("Aún no hay predicciones. Completa el formulario y presiona Predecir.");
  } else if (visibles.length === 0) {
    mostrarMensaje("No hay fallas en esta página.");
  } else if (estado.soloFallas) {
    mostrarMensaje("El filtro se aplica solo a las predicciones de esta página.");
  } else {
    mostrarMensaje("");
  }

  paginacion.classList.toggle("oculto", estado.total === 0);
  infoPagina.textContent = `Página ${estado.pagina} de ${estado.paginas}, ${estado.total} ${
    estado.total === 1 ? "predicción" : "predicciones"
  } en total`;
  botonRecientes.disabled = estado.pagina <= 1;
  botonAntiguas.disabled = estado.pagina >= estado.paginas;
}

// La API entrega el historial de la predicción más antigua a la más reciente, en
// bloques de hasta 100. La interfaz muestra primero lo último y cada página tiene
// LIMITE filas, así que se piden los bloques necesarios y se recorta aquí.
async function pedirBloque(numero) {
  const res = await listarPredicciones(numero, BLOQUE);
  if (sesionVencida(res)) return null;
  if (!res.ok) throw new Error("respuesta no válida");
  return res.datos.data;
}

export async function cargarHistorial({ irAPrimera = false } = {}) {
  if (irAPrimera) estado.pagina = 1;
  ocultar(errorHistorial);

  try {
    const primero = await pedirBloque(1);
    if (!primero) return;

    const total = primero.total;
    const paginas = Math.max(1, Math.ceil(total / LIMITE));
    estado.pagina = Math.min(estado.pagina, paginas);

    const mayor = total - 1 - (estado.pagina - 1) * LIMITE;
    const menor = Math.max(0, mayor - LIMITE + 1);
    const bloques = new Map([[1, primero.items]]);
    for (let n = Math.floor(menor / BLOQUE) + 1; n <= Math.floor(mayor / BLOQUE) + 1; n++) {
      if (mayor < 0 || bloques.has(n)) continue;
      const bloque = await pedirBloque(n);
      if (!bloque) return;
      bloques.set(n, bloque.items);
    }

    const items = [];
    for (let i = mayor; i >= menor && i >= 0; i--) {
      const registro = bloques.get(Math.floor(i / BLOQUE) + 1)?.[i % BLOQUE];
      if (registro) items.push(registro);
    }

    estado.total = total;
    estado.paginas = paginas;
    estado.items = items;
    pintar();
  } catch (err) {
    mostrarError(
      errorHistorial,
      err instanceof ErrorRed
        ? "No se pudo conectar con el servidor. Revisa que uvicorn esté corriendo."
        : "No se pudo cargar el historial."
    );
  }
}

export function limpiarHistorial() {
  Object.assign(estado, { pagina: 1, paginas: 1, total: 0, items: [], soloFallas: false });
  cuerpoTabla.replaceChildren();
  ocultar(errorHistorial);
  mostrarMensaje("");
  paginacion.classList.add("oculto");
  fijarFiltro(false);
}

function fijarFiltro(soloFallas) {
  estado.soloFallas = soloFallas;
  filtroTodas.setAttribute("aria-pressed", String(!soloFallas));
  filtroFallas.setAttribute("aria-pressed", String(soloFallas));
}

export function iniciarHistorial({ alReusar: reusar }) {
  alReusar = reusar;

  document.getElementById("btn-refrescar").addEventListener("click", () => cargarHistorial());
  botonRecientes.addEventListener("click", () => {
    estado.pagina -= 1;
    cargarHistorial();
  });
  botonAntiguas.addEventListener("click", () => {
    estado.pagina += 1;
    cargarHistorial();
  });
  filtroTodas.addEventListener("click", () => {
    fijarFiltro(false);
    pintar();
  });
  filtroFallas.addEventListener("click", () => {
    fijarFiltro(true);
    pintar();
  });
}
