const API_BASE = "/api/v1";

let token = null;

const seccionLogin = document.getElementById("seccion-login");
const seccionApp = document.getElementById("seccion-app");
const formLogin = document.getElementById("form-login");
const loginError = document.getElementById("login-error");

const formPrediccion = document.getElementById("form-prediccion");
const resultadoDiv = document.getElementById("resultado");
const prediccionError = document.getElementById("prediccion-error");

const tablaHistorialBody = document.querySelector("#tabla-historial tbody");
const historialVacio = document.getElementById("historial-vacio");

function mostrarError(elemento, mensaje) {
  elemento.textContent = mensaje;
  elemento.classList.remove("oculto");
}

function ocultar(elemento) {
  elemento.classList.add("oculto");
}

formLogin.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  ocultar(loginError);

  const usuario = document.getElementById("usuario").value;
  const contrasena = document.getElementById("contrasena").value;

  try {
    const resp = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario, contrasena }),
    });
    const cuerpo = await resp.json();

    if (!resp.ok) {
      mostrarError(loginError, cuerpo.error || cuerpo.detail || "No se pudo iniciar sesión");
      return;
    }

    token = cuerpo.data.access_token;
    seccionLogin.classList.add("oculto");
    seccionApp.classList.remove("oculto");
    cargarHistorial();
  } catch (err) {
    mostrarError(loginError, "No se pudo conectar con el servidor (¿está corriendo uvicorn?)");
  }
});

document.getElementById("btn-salir").addEventListener("click", () => {
  token = null;
  seccionApp.classList.add("oculto");
  seccionLogin.classList.remove("oculto");
});

document.getElementById("btn-refrescar").addEventListener("click", cargarHistorial);

formPrediccion.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  ocultar(prediccionError);
  ocultar(resultadoDiv);

  const entrada = {
    tipo: document.getElementById("tipo").value,
    temperatura_aire_k: parseFloat(document.getElementById("temperatura_aire_k").value),
    temperatura_proceso_k: parseFloat(document.getElementById("temperatura_proceso_k").value),
    velocidad_rotacional_rpm: parseFloat(document.getElementById("velocidad_rotacional_rpm").value),
    torque_nm: parseFloat(document.getElementById("torque_nm").value),
    desgaste_herramienta_min: parseFloat(document.getElementById("desgaste_herramienta_min").value),
  };

  try {
    const resp = await fetch(`${API_BASE}/predicciones`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(entrada),
    });
    const cuerpo = await resp.json();

    if (!resp.ok) {
      mostrarError(prediccionError, cuerpo.error || cuerpo.detail || "No se pudo generar la predicción");
      return;
    }

    const datos = cuerpo.data;
    resultadoDiv.textContent =
      datos.prediccion === "Falla"
        ? `⚠ FALLA — probabilidad: ${(datos.probabilidad_falla * 100).toFixed(1)}%`
        : `✓ No falla — probabilidad de falla: ${(datos.probabilidad_falla * 100).toFixed(1)}%`;
    resultadoDiv.className = "resultado " + (datos.prediccion === "Falla" ? "falla" : "no-falla");
    resultadoDiv.classList.remove("oculto");

    cargarHistorial();
  } catch (err) {
    mostrarError(prediccionError, "No se pudo conectar con el servidor");
  }
});

async function cargarHistorial() {
  try {
    const resp = await fetch(`${API_BASE}/predicciones?page=1&limit=20`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!resp.ok) return;
    const cuerpo = await resp.json();
    const items = cuerpo.data.items;

    tablaHistorialBody.innerHTML = "";
    if (items.length === 0) {
      historialVacio.classList.remove("oculto");
      return;
    }
    historialVacio.classList.add("oculto");

    items
      .slice()
      .reverse()
      .forEach((item) => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
          <td>${item.id}</td>
          <td>${item.tipo}</td>
          <td>${item.temperatura_aire_k}</td>
          <td>${item.temperatura_proceso_k}</td>
          <td>${item.velocidad_rotacional_rpm}</td>
          <td>${item.torque_nm}</td>
          <td>${item.desgaste_herramienta_min}</td>
          <td>${item.prediccion}</td>
          <td>${(item.probabilidad_falla * 100).toFixed(1)}%</td>
        `;
        tablaHistorialBody.appendChild(fila);
      });
  } catch (err) {
    // silencioso: la tabla simplemente no se actualiza
  }
}
