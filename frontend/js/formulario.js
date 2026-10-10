import { ErrorRed, crearPrediccion, sesionVencida } from "./api.js";
import { interpretarError } from "./errores.js";
import { formatearNumero, mostrarError, ocultar } from "./ui.js";

// Rangos típicos tomados de ai4i2020.csv (mínimo y máximo). La API acepta valores
// fuera de ese rango, así que solo se avisa. "regla" refleja schemas.py.
const CAMPOS = [
  { id: "temperatura_aire_k", nombre: "Temperatura del aire", unidad: "K", paso: 0.1, inicial: 300, tipico: [295.3, 304.5], barra: [294, 306], regla: { gt: 0 } },
  { id: "temperatura_proceso_k", nombre: "Temperatura del proceso", unidad: "K", paso: 0.1, inicial: 310, tipico: [305.7, 313.8], barra: [304, 315], regla: { gt: 0 } },
  { id: "velocidad_rotacional_rpm", nombre: "Velocidad rotacional", unidad: "rpm", paso: 1, inicial: 1500, tipico: [1168, 2886], barra: [1100, 2900], regla: { gt: 0 } },
  { id: "torque_nm", nombre: "Torque", unidad: "Nm", paso: 0.1, inicial: 40, tipico: [3.8, 76.6], barra: [0, 80], regla: { ge: 0 } },
  { id: "desgaste_herramienta_min", nombre: "Desgaste de la herramienta", unidad: "min", paso: 1, inicial: 100, tipico: [0, 253], barra: [0, 260], regla: { ge: 0 } },
];

const formulario = document.getElementById("form-prediccion");
const contenedorCampos = document.getElementById("campos-numericos");
const botonPredecir = document.getElementById("btn-predecir");
const errorGeneral = document.getElementById("prediccion-error");

const refs = {};

function textoRango(c) {
  return `Rango típico: ${formatearNumero(c.tipico[0])} a ${formatearNumero(c.tipico[1])} ${c.unidad}`;
}

function crear(etiqueta, atributos = {}, texto) {
  const el = document.createElement(etiqueta);
  for (const [clave, valor] of Object.entries(atributos)) el.setAttribute(clave, valor);
  if (texto !== undefined) el.textContent = texto;
  return el;
}

function construirCampos() {
  for (const c of CAMPOS) {
    const bloque = crear("div", { class: "campo" });

    const etiqueta = crear("label", { for: c.id }, c.nombre);
    etiqueta.append(" ", crear("span", { class: "unidad" }, c.unidad));

    const barra = crear("input", {
      type: "range",
      min: c.barra[0],
      max: c.barra[1],
      step: c.paso,
      value: c.inicial,
      tabindex: "-1",
      "aria-hidden": "true",
    });
    const numero = crear("input", {
      type: "number",
      id: c.id,
      step: "any",
      inputmode: "decimal",
      value: c.inicial,
      "aria-describedby": `ayuda-${c.id} error-${c.id}`,
    });
    const control = crear("div", { class: "control" });
    control.append(barra, numero);

    const ayuda = crear("p", { class: "ayuda", id: `ayuda-${c.id}` }, textoRango(c));
    const error = crear("p", { class: "error oculto", id: `error-${c.id}` });

    bloque.append(etiqueta, control, ayuda, error);
    contenedorCampos.append(bloque);
    refs[c.id] = { campo: c, barra, numero, ayuda, error };

    barra.addEventListener("input", () => {
      numero.value = barra.value;
      limpiarError(c.id);
      revisarRango(c.id);
    });
    numero.addEventListener("input", () => {
      barra.value = numero.value;
      limpiarError(c.id);
      revisarRango(c.id);
    });
  }
}

function revisarRango(id) {
  const { campo, numero, ayuda } = refs[id];
  const valor = numero.valueAsNumber;
  const fuera = Number.isFinite(valor) && (valor < campo.tipico[0] || valor > campo.tipico[1]);
  ayuda.textContent = fuera
    ? `Fuera del rango típico (${formatearNumero(campo.tipico[0])} a ${formatearNumero(campo.tipico[1])} ${campo.unidad}). El resultado puede ser poco fiable.`
    : textoRango(campo);
  ayuda.className = fuera ? "aviso" : "ayuda";
}

function marcarError(id, mensaje) {
  const { numero, error } = refs[id];
  numero.setAttribute("aria-invalid", "true");
  error.textContent = mensaje;
  error.classList.remove("oculto");
}

function limpiarError(id) {
  const { numero, error } = refs[id];
  numero.removeAttribute("aria-invalid");
  error.classList.add("oculto");
  error.textContent = "";
}

function limpiarErrores() {
  ocultar(errorGeneral);
  for (const id of Object.keys(refs)) limpiarError(id);
}

function leerEntrada() {
  const entrada = { tipo: formulario.querySelector('input[name="tipo"]:checked').value };
  for (const c of CAMPOS) entrada[c.id] = refs[c.id].numero.valueAsNumber;
  return entrada;
}

function validar(entrada) {
  const errores = {};
  for (const c of CAMPOS) {
    const valor = entrada[c.id];
    if (!Number.isFinite(valor)) errores[c.id] = "Ingresa un número";
    else if ("gt" in c.regla && !(valor > c.regla.gt)) errores[c.id] = `Debe ser mayor que ${c.regla.gt}`;
    else if ("ge" in c.regla && !(valor >= c.regla.ge)) errores[c.id] = `Debe ser mayor o igual a ${c.regla.ge}`;
  }
  return errores;
}

function mostrarErroresCampos(errores) {
  let primero = null;
  for (const [id, mensaje] of Object.entries(errores)) {
    if (!refs[id]) continue;
    marcarError(id, mensaje);
    if (!primero) primero = id;
  }
  if (primero) refs[primero].numero.focus();
}

export function cargarEnFormulario(item) {
  const radio = formulario.querySelector(`input[name="tipo"][value="${item.tipo}"]`);
  if (radio) radio.checked = true;
  for (const c of CAMPOS) {
    const { numero, barra } = refs[c.id];
    numero.value = item[c.id];
    barra.value = item[c.id];
    revisarRango(c.id);
  }
  limpiarErrores();
  refs[CAMPOS[0].id].numero.focus();
}

export function iniciarFormulario({ alCrear }) {
  construirCampos();

  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    limpiarErrores();

    const entrada = leerEntrada();
    const errores = validar(entrada);
    if (Object.keys(errores).length > 0) {
      mostrarErroresCampos(errores);
      mostrarError(errorGeneral, "Revisa los campos marcados.");
      return;
    }

    botonPredecir.disabled = true;
    botonPredecir.textContent = "Calculando…";
    try {
      const res = await crearPrediccion(entrada);
      if (sesionVencida(res)) return;
      if (!res.ok) {
        const { mensaje, campos } = interpretarError(res, "No se pudo generar la predicción.");
        mostrarErroresCampos(campos);
        mostrarError(errorGeneral, mensaje);
        return;
      }
      alCrear(res.datos.data);
    } catch (err) {
      mostrarError(
        errorGeneral,
        err instanceof ErrorRed
          ? "No se pudo conectar con el servidor. Revisa que uvicorn esté corriendo."
          : "No se pudo generar la predicción."
      );
    } finally {
      botonPredecir.disabled = false;
      botonPredecir.textContent = "Predecir";
    }
  });
}
