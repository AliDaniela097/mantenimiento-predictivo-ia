import { ErrorRed, alVencerSesion, fijarToken, login, restaurarToken } from "./api.js";
import { mostrarError, ocultar } from "./ui.js";

const seccionLogin = document.getElementById("seccion-login");
const seccionApp = document.getElementById("seccion-app");
const botonSalir = document.getElementById("btn-salir");
const formLogin = document.getElementById("form-login");
const botonLogin = document.getElementById("btn-login");
const loginError = document.getElementById("login-error");

function mostrarApp() {
  seccionLogin.classList.add("oculto");
  seccionApp.classList.remove("oculto");
  botonSalir.classList.remove("oculto");
}

function mostrarLogin(mensaje) {
  seccionApp.classList.add("oculto");
  botonSalir.classList.add("oculto");
  seccionLogin.classList.remove("oculto");
  if (mensaje) mostrarError(loginError, mensaje);
  else ocultar(loginError);
}

export function iniciarSesionUI({ alIngresar, alSalir }) {
  const cerrar = (mensaje) => {
    fijarToken(null);
    alSalir();
    mostrarLogin(mensaje);
  };

  alVencerSesion(() => cerrar("Tu sesión venció, ingresa de nuevo."));

  formLogin.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    ocultar(loginError);
    botonLogin.disabled = true;
    botonLogin.textContent = "Ingresando…";

    const usuario = document.getElementById("usuario").value;
    const contrasena = document.getElementById("contrasena").value;

    try {
      const res = await login(usuario, contrasena);
      if (!res.ok) {
        mostrarError(
          loginError,
          res.status === 401 ? "Usuario o contraseña incorrectos." : "No se pudo iniciar sesión."
        );
        return;
      }
      fijarToken(res.datos.data.access_token);
      mostrarApp();
      alIngresar();
    } catch (err) {
      const sinRed = err instanceof ErrorRed;
      mostrarError(
        loginError,
        sinRed
          ? "No se pudo conectar con el servidor. Revisa que uvicorn esté corriendo."
          : "No se pudo iniciar sesión."
      );
    } finally {
      botonLogin.disabled = false;
      botonLogin.textContent = "Ingresar";
    }
  });

  botonSalir.addEventListener("click", () => cerrar());

  // Si la pestaña ya tenía sesión (recarga), se reutiliza el token guardado.
  if (restaurarToken()) {
    mostrarApp();
    alIngresar();
  }
}
