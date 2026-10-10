import { vigilarServicio } from "./estado.js";
import { iniciarDiagnostico, mostrarDiagnostico, reiniciarDiagnostico } from "./diagnostico.js";
import { cargarEnFormulario, iniciarFormulario } from "./formulario.js";
import { cargarHistorial, iniciarHistorial, limpiarHistorial } from "./historial.js";
import { iniciarSesionUI } from "./sesion.js";

iniciarDiagnostico();

iniciarFormulario({
  alCrear: (prediccion) => {
    mostrarDiagnostico(prediccion);
    cargarHistorial({ irAPrimera: true });
  },
});

iniciarHistorial({ alReusar: cargarEnFormulario });

vigilarServicio();

// Va al final: si hay una sesión guardada, entra y carga el historial de inmediato.
iniciarSesionUI({
  alIngresar: () => cargarHistorial({ irAPrimera: true }),
  alSalir: () => {
    reiniciarDiagnostico();
    limpiarHistorial();
  },
});
