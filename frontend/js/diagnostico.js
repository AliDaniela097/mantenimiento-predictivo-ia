import { DETALLES, ETIQUETAS, ICONOS, clasificar } from "./riesgo.js";
import { formatearHora, formatearPorcentaje } from "./ui.js";

const NS = "http://www.w3.org/2000/svg";
const CX = 170;
const CY = 170;
const R = 130;

// 0 % queda a la izquierda y 100 % a la derecha, pasando por arriba.
const ZONAS = [
  { desde: 0, hasta: 0.2, clase: "ok" },
  { desde: 0.2, hasta: 0.5, clase: "vigilar" },
  { desde: 0.5, hasta: 1, clase: "falla" },
];
const MARCAS = [
  { valor: 0, texto: "0 %" },
  { valor: 0.2, texto: "20" },
  { valor: 0.5, texto: "50" },
  { valor: 1, texto: "100 %" },
];

const panel = document.getElementById("panel-diagnostico");
const porcentaje = document.getElementById("res-porcentaje");
const icono = document.getElementById("res-icono");
const etiqueta = document.getElementById("res-etiqueta");
const detalle = document.getElementById("res-detalle");
const meta = document.getElementById("res-meta");

let svg = null;
let aguja = null;

function punto(proporcion, radio) {
  const angulo = Math.PI * (1 - proporcion);
  return [CX + radio * Math.cos(angulo), CY - radio * Math.sin(angulo)];
}

function elemento(nombre, atributos) {
  const el = document.createElementNS(NS, nombre);
  for (const [clave, valor] of Object.entries(atributos)) el.setAttribute(clave, valor);
  return el;
}

function construir() {
  svg = elemento("svg", {
    class: "manometro",
    viewBox: "0 0 340 190",
    role: "img",
    "aria-label": "Manómetro de probabilidad de falla, sin lectura",
  });

  for (const zona of ZONAS) {
    const [x0, y0] = punto(zona.desde, R);
    const [x1, y1] = punto(zona.hasta, R);
    svg.append(elemento("path", { class: `zona ${zona.clase}`, d: `M ${x0} ${y0} A ${R} ${R} 0 0 1 ${x1} ${y1}` }));
  }

  for (const marca of MARCAS) {
    const [x, y] = punto(marca.valor, R + 26);
    const texto = elemento("text", { class: "marca", x, y, "text-anchor": "middle", dy: "0.35em" });
    texto.textContent = marca.texto;
    svg.append(texto);
  }

  aguja = elemento("g", { class: "aguja" });
  aguja.append(
    elemento("line", { x1: CX, y1: CY, x2: CX, y2: CY - (R - 6) }),
    elemento("circle", { cx: CX, cy: CY, r: 10 })
  );
  svg.append(aguja);

  document.getElementById("manometro").append(svg);
}

function moverAguja(proporcion) {
  aguja.style.transform = `rotate(${-90 + 180 * proporcion}deg)`;
}

export function reiniciarDiagnostico() {
  panel.dataset.nivel = "ninguno";
  moverAguja(0);
  svg.setAttribute("aria-label", "Manómetro de probabilidad de falla, sin lectura");
  porcentaje.textContent = "Sin datos";
  icono.textContent = "?";
  etiqueta.textContent = "Sin predicción";
  detalle.textContent = "Completa las condiciones y presiona Predecir.";
  meta.textContent = "";
}

export function mostrarDiagnostico(prediccion) {
  const nivel = clasificar(prediccion);
  const proporcion = Math.min(Math.max(prediccion.probabilidad_falla, 0), 1);
  const texto = formatearPorcentaje(proporcion);

  panel.dataset.nivel = nivel;
  moverAguja(proporcion);
  svg.setAttribute("aria-label", `Manómetro de probabilidad de falla: ${texto}`);
  porcentaje.textContent = texto;
  icono.textContent = ICONOS[nivel];
  etiqueta.textContent = ETIQUETAS[nivel];
  detalle.textContent = DETALLES[nivel];
  const hora = formatearHora(prediccion.creado_en);
  meta.textContent = `Predicción n.º ${prediccion.id}${hora ? `, ${hora}` : ""}`;
}

export function iniciarDiagnostico() {
  construir();
  reiniciarDiagnostico();
}
