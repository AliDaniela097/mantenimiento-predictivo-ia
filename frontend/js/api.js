const API_BASE = "/api/v1";
const CLAVE_TOKEN = "mp_token";

let token = null;
let alSesionVencida = () => {};

export class ErrorRed extends Error {}

function leerAlmacen() {
  try {
    return sessionStorage.getItem(CLAVE_TOKEN);
  } catch (err) {
    return null;
  }
}

function escribirAlmacen(valor) {
  try {
    if (valor) sessionStorage.setItem(CLAVE_TOKEN, valor);
    else sessionStorage.removeItem(CLAVE_TOKEN);
  } catch (err) {
    // sin almacenamiento: la sesión vive solo mientras no se recargue la página
  }
}

export function restaurarToken() {
  token = leerAlmacen();
  return token !== null;
}

export function fijarToken(nuevo) {
  token = nuevo;
  escribirAlmacen(nuevo);
}

export function alVencerSesion(manejador) {
  alSesionVencida = manejador;
}

export function sesionVencida(res) {
  return res.status === 401 || res.status === 403;
}

async function solicitar(ruta, { metodo = "GET", cuerpo, protegida = false } = {}) {
  const cabeceras = {};
  if (cuerpo !== undefined) cabeceras["Content-Type"] = "application/json";
  if (protegida) cabeceras.Authorization = `Bearer ${token}`;

  let resp;
  try {
    resp = await fetch(API_BASE + ruta, {
      method: metodo,
      headers: cabeceras,
      body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
    });
  } catch (err) {
    throw new ErrorRed("Sin conexión con el servidor");
  }

  let datos = null;
  try {
    datos = await resp.json();
  } catch (err) {
    // cuerpo vacío o no JSON
  }

  const res = { ok: resp.ok, status: resp.status, datos };
  if (protegida && sesionVencida(res)) alSesionVencida();
  return res;
}

export function salud() {
  return solicitar("/salud");
}

export function login(usuario, contrasena) {
  return solicitar("/auth/login", { metodo: "POST", cuerpo: { usuario, contrasena } });
}

export function crearPrediccion(entrada) {
  return solicitar("/predicciones", { metodo: "POST", cuerpo: entrada, protegida: true });
}

export function listarPredicciones(page, limit) {
  return solicitar(`/predicciones?page=${page}&limit=${limit}`, { protegida: true });
}
