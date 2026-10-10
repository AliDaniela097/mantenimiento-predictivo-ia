# Frontend — levantamiento de requerimientos y plan de implementación

Rama: `frontend` · Alcance: solo `frontend/` (HTML/CSS/JS sin build, servido por FastAPI en `/`). El backend no se toca salvo lo marcado como opcional.

## 1. Contexto del sistema

- **Qué es:** app que predice si una máquina industrial va a fallar a partir de 6 variables de operación (dataset AI4I 2020, 10 000 registros, 3.39 % de fallas). Modelo servido por API REST con JWT.
- **Quién la usa:**
  - *Técnico de mantenimiento* (usuario del producto): ingresa lecturas de una máquina y necesita saber, rápido y sin ambigüedad, si debe intervenir.
  - *Equipo y docentes* (usuario de la sustentación): necesitan ver que el flujo completo funciona (login, predicción, historial) y que la UI respeta el contrato de la API.
- **Trabajo principal de la pantalla:** pasar de "tengo estas lecturas" a "qué tan probable es una falla" en un solo gesto, y poder revisar lo consultado antes.
- **Datos reales del dominio** (calculados del `ai4i2020.csv`, sirven para límites y valores iniciales del formulario):

| Variable | Mín | Mediana | Máx |
|---|---|---|---|
| Temperatura del aire (K) | 295.3 | 300.1 | 304.5 |
| Temperatura del proceso (K) | 305.7 | 310.1 | 313.8 |
| Velocidad rotacional (rpm) | 1168 | 1503 | 2886 |
| Torque (Nm) | 3.8 | 40.1 | 76.6 |
| Desgaste de herramienta (min) | 0 | 108 | 253 |

  Tipo de producto: L 60 %, M 30 %, H 10 %.
- **Calidad del modelo que la UI debe respetar** (notebook): con tanto desbalance, el Random Forest base detecta solo 47 % de las fallas reales (recall) aunque acierta 89 % de las veces que alerta; el tuneado reporta recall 0.691 y F1 0.723 (notebook y `APP_README.md`). Esas cifras se midieron con el 20 % de prueba (2000 filas, solo 68 fallas) antes de reentrenar con el 100 % de los datos, así que el `.pkl` exportado no tiene métricas independientes. En la práctica, unas 3 de cada 10 fallas reales no se detectan. Un resultado "No falla" **no es una garantía**: la UI debe mostrar la probabilidad, no solo la etiqueta.

## 2. Requerimientos funcionales

| ID | Requerimiento | Fuente / criterio de aceptación |
|---|---|---|
| RF-01 | Iniciar sesión con usuario y contraseña contra `POST /api/v1/auth/login`; guardar el token y enviarlo como `Authorization: Bearer`. | Login fallido muestra el motivo (401) sin borrar lo escrito. |
| RF-02 | Cerrar sesión: descarta el token y vuelve al login. | |
| RF-03 | Detectar token vencido (401 o 403 en cualquier llamada protegida; expira a los 60 min) y volver al login con el mensaje "Tu sesión venció, ingresa de nuevo". | Contrato: `expira_en_minutos`. Se acepta 403 porque `requirements.txt` pide `fastapi>=0.110` y versiones antiguas devuelven 403 sin token; con la 0.141.1 instalada es 401. |
| RF-04 | Formulario de predicción con los 6 campos de `EntradaPrediccion`: `tipo` (L/M/H), `temperatura_aire_k`, `temperatura_proceso_k`, `velocidad_rotacional_rpm`, `torque_nm`, `desgaste_herramienta_min`. | Mismos nombres y reglas que `schemas.py` (>0 para temperaturas y rpm, ≥0 para torque y desgaste). |
| RF-05 | Validar en el cliente antes de enviar (campo vacío, fuera de regla del contrato) y mostrar el error junto al campo. Mostrar el rango típico del dataset como ayuda, sin bloquear valores válidos fuera de rango (la API los acepta). | Evita 400 evitables. |
| RF-06 | Enviar `POST /api/v1/predicciones` y mostrar el resultado: etiqueta ("Falla" / "No falla") **y** `probabilidad_falla` en porcentaje con indicador visual. | Respuesta 201 con `prediccion`, `probabilidad_falla`. |
| RF-07 | Mostrar errores 400 de la API (`error` + `details[]`) asociándolos al campo cuando se pueda (`details[].loc`). | `manejador_validacion` en `main.py`. |
| RF-08 | Mostrar el historial (`GET /api/v1/predicciones?page&limit`) con todas las entradas, resultado y probabilidad; más recientes primero. | La API devuelve orden de creación (antiguo → nuevo); el cliente invierte. |
| RF-09 | Paginar el historial usando `pagina`, `limite`, `total` (limit máx. 100). | Hoy el cliente pide solo la página 1 con 20 y pierde el resto. |
| RF-10 | Actualizar el historial automáticamente tras cada predicción y con un botón manual. | Ya existe; se conserva. |
| RF-11 | Resaltar en el historial las predicciones de falla y permitir filtrar "solo fallas" (en cliente, sobre la página cargada). | Facilita la revisión. |
| RF-12 | Poder volver a cargar en el formulario los valores de una fila del historial para repetir o ajustar una consulta. | Ahorra reescribir 6 campos al comparar escenarios. |
| RF-13 | Estados vacíos y de carga: historial sin registros, botón "Predecir" deshabilitado mientras se espera respuesta, error de red ("No se pudo conectar con el servidor"). | |
| RF-14 | Mostrar el estado del servicio con `GET /api/v1/salud` (disponible / no disponible) en el encabezado. | Endpoint público ya existente. |

## 3. Requerimientos no funcionales

| ID | Requerimiento |
|---|---|
| RNF-01 | Sin paso de build ni dependencias de Node: HTML/CSS/JS estáticos servidos por `StaticFiles`. Rutas relativas (`/api/v1`). |
| RNF-02 | Responsive desde 360 px hasta escritorio; sin scroll horizontal de página (la tabla puede desplazarse dentro de su contenedor o colapsar a filas apiladas). |
| RNF-03 | Accesible: foco de teclado visible, `label` asociado a cada campo, resultado anunciado con `aria-live`, contraste AA, el estado no depende solo del color (siempre texto + icono), respeta `prefers-reduced-motion`. |
| RNF-04 | Funciona sin internet en la sustentación: fuentes e iconos autoalojados en `frontend/`, sin CDN. |
| RNF-05 | Idioma español, texto en sentence case, verbos de acción consistentes ("Predecir" produce "Predicción generada"). |
| RNF-06 | Seguridad básica del cliente: escapar o usar `textContent` al pintar datos de la API (hoy `innerHTML` interpola datos sin escapar en `script.js:128-138`; el riesgo actual es bajo porque la API valida `tipo` y los números, pero el patrón es frágil); el token no va en la URL. |
| RNF-07 | Rendimiento: primera pantalla útil < 1 s en local; sin librerías de más de unas decenas de KB. |

## 4. Restricciones y hallazgos de la API (afectan al frontend)

- No hay endpoint para borrar, editar ni obtener una predicción por id. El header `Location: /api/v1/predicciones/{id}` apunta a una ruta que **no existe** en `main.py`. → el frontend no debe seguirlo.
- El historial es **global y en memoria**: se pierde al reiniciar el servidor y lo comparten todos los usuarios. La UI no debe prometer persistencia.
- No hay endpoint de métricas del modelo ni de umbral de decisión: el backend usa `predict()` sin umbral propio (`main.py:92`); que el corte sea 0.5 se infiere y no está verificado (el notebook no analiza umbrales ni usa `predict_proba`). Cualquier banda de "vigilar" en la UI es una decisión de presentación, no del modelo (ver preguntas abiertas).
- Un único usuario de demostración (`equipo`); no hay registro ni roles.
- La respuesta de error de validación usa 400 y forma `{status, error, details}`; el de login/token usa el `detail` por defecto de FastAPI (401). El manejo de errores del cliente debe leer ambas formas (ya lo hace parcialmente con `cuerpo.error || cuerpo.detail`).
- `docs/openapi.yaml` no coincide con el código: declara 422 para validación y no declara 400 ni 401, mientras el backend devuelve 400 (`main.py:63-68`) y 401, y `docs/contrato_api.md` documenta 400/401. El cliente debe seguir el código, no el YAML. Corregir o regenerar el YAML es un cambio opcional fuera del frontend.
- `details[]` de Pydantic es una lista de objetos, no texto: hoy la UI mostraría "[object Object]" si `error` faltara; debe formatearse.

## 5. Fuera de alcance

Registro de usuarios, gráficos del EDA, comparación de modelos, edición/borrado del historial, persistencia entre reinicios, internacionalización, modo oscuro (puede evaluarse después).

## 6. Decisiones tomadas

1. **Sesión al recargar:** el token se guarda en `sessionStorage` (se borra al cerrar la pestaña). Implementado en `frontend/js/api.js`.
2. **Banda intermedia de riesgo:** se muestra "Vigilar" cuando el modelo dice "No falla" pero la probabilidad es ≥ 20 %. Es una decisión de presentación (constante `UMBRAL_VIGILAR` en `frontend/js/riesgo.js`), no del modelo; conviene validarla con quien entrenó el modelo antes de la sustentación.
3. **Credenciales prellenadas:** se mantienen en el login para la demo. Quitarlas antes de publicar el repo (`frontend/index.html`, campos `usuario` y `contrasena`).
4. **Fuentes autoalojadas:** Barlow y Barlow Semi Condensed (subconjunto latino, licencia OFL) en `frontend/fonts/`; la app no depende de internet.

## 7. Dirección de diseño (skill frontend-design)

**Sujeto:** panel de planta para técnicos de mantenimiento. **Pieza memorable (única):** un manómetro de riesgo —semicírculo con aguja— que se mueve hasta la probabilidad de falla al recibir la respuesta. El resto de la interfaz es sobria.

**Primer borrador descartado:** consola oscura con acento verde ácido y etiquetas monoespaciadas en mayúsculas. Es el look genérico de "dashboard técnico" y no sale del sujeto. Se reemplazó por el lenguaje de la señalización industrial (chapa clara, amarillo de seguridad, verde y rojo con significado fijo), que sí viene de una planta.

**Color** (tokens en `:root`):

| Nombre | Hex | Uso |
|---|---|---|
| Acero | `#E7EAEC` | fondo de página |
| Chapa | `#F7F8F9` | superficies (paneles) |
| Grafito | `#1D272E` | texto y trazo principal |
| Amarillo de seguridad | `#F2B705` | acción principal (texto grafito encima, contraste ≥ 9:1) |
| Verde de seguridad | `#2E7D4F` | "No falla" (el mismo verde del notebook) |
| Rojo de seguridad | `#C0392B` | "Falla" (el mismo rojo del notebook) |

El ámbar de la banda "Vigilar" (si se aprueba) reutiliza el amarillo con texto grafito; nunca va solo.

**Tipografía:** una sola familia, **Barlow** (derivada de la señalización vial de California): Barlow Semi Condensed para títulos y cifras (con `font-variant-numeric: tabular-nums`), Barlow regular para formularios y tabla. Escala 14 / 16 / 20 / 28 / 56 px; el porcentaje del manómetro es el único texto grande. Sin mayúsculas sostenidas, sin etiquetas decorativas sobre los títulos. Líneas de texto < 70 caracteres.

**Layout** (alineado a la izquierda, rejilla de 12 columnas, máx. 1120 px):

```
┌ Mantenimiento predictivo                 ● Servicio disponible   Cerrar sesión ┐
├──────────────────────────────┬───────────────────────────────────────────────┤
│ Condiciones de la máquina    │            ╭────── manómetro ──────╮           │
│  Tipo        [ M ▾ ]         │            │   aguja → 12,4 %      │           │
│  Temp. aire  [slider][ 300 ] │            ╰───────────────────────╯           │
│  Temp. proc. [slider][ 310 ] │   No falla — probabilidad de falla 12,4 %      │
│  Velocidad   [slider][1500 ] │   Una predicción sin falla no la descarta.     │
│  Torque      [slider][ 40  ] │                                                │
│  Desgaste    [slider][ 100 ] │                                                │
│  [ Predecir ]                │                                                │
├──────────────────────────────┴───────────────────────────────────────────────┤
│ Historial   (Todas | Solo fallas)                          Actualizar         │
│  #  Hora  Tipo  Aire  Proceso  rpm  Torque  Desgaste  Resultado  Prob.  [↺]   │
│  ...                                                  ‹ 1 2 3 ›               │
└──────────────────────────────────────────────────────────────────────────────┘
```

En móvil: una columna (formulario → manómetro → historial); la tabla pasa a filas apiladas con el resultado como primera línea.

**Movimiento:** solo uno, la aguja del manómetro al llegar la respuesta (≈ 700 ms, `ease-out`); con `prefers-reduced-motion` salta directo al valor. Sin entradas animadas de secciones ni hovers decorativos.

**Estructura como información:** una sola separación fuerte (formulario | resultado) porque son dos momentos distintos; el historial va abajo porque es consulta. Sin numeración (el contenido no es una secuencia).

**Texto:** botón "Predecir" → mensaje de estado "Predicción generada"; error de red "No se pudo conectar con el servidor. Revisa que uvicorn esté corriendo."; historial vacío "Aún no hay predicciones. Completa el formulario y presiona Predecir."

## 8. Plan de implementación

Orden pensado para que cada fase deje la app funcionando.

| Fase | Entregable | Archivos | Verificación |
|---|---|---|---|
| 0. Base | Reorganizar `frontend/` sin cambiar comportamiento: separar tokens, base y componentes CSS; separar JS en módulos ES (`api.js`, `sesion.js`, `formulario.js`, `historial.js`, `main.js`). | `frontend/css/*.css`, `frontend/js/*.js`, `index.html` | Login → predecir → historial igual que antes. |
| 1. Cliente de API | Capa `api.js` única: agrega el Bearer, normaliza errores (400 con `details`, 401 por token vencido, red), maneja 401 → RF-03. | `js/api.js` | Forzar 401 (token inválido) y 400 (torque negativo); ver mensajes correctos. |
| 2. Sistema visual | Tokens de color y tipografía, fuentes autoalojadas (si se aprueba), componentes: panel, campo, botón, insignia de resultado, tabla. | `css/tokens.css`, `css/base.css`, `css/componentes.css`, `fonts/` | Captura a 1280 px y 375 px; contraste AA revisado. |
| 3. Formulario | Campos con slider + número sincronizados, rangos típicos como ayuda, validación en cliente, errores por campo, estado "enviando". | `js/formulario.js`, `index.html` | RF-04, 05, 07, 13. Teclado completo. |
| 4. Manómetro | Componente SVG con aguja animada, texto de resultado, `aria-live`, versión sin animación. | `js/manometro.js`, `css/componentes.css` | RF-06; probar 0 %, 50 %, 100 % y reduced-motion. |
| 5. Historial | Tabla con orden reciente-primero, paginación real, filtro "solo fallas", botón de reutilizar fila, pintado con `textContent` (RNF-06), vista apilada en móvil. | `js/historial.js` | RF-08 a 12; crear > 20 predicciones para probar paginación. |
| 6. Sesión y estado | Chequeo de `/salud`, decisión sobre `sessionStorage` (pregunta 1), cierre de sesión limpio. | `js/sesion.js`, `js/main.js` | RF-01 a 03, 14; detener uvicorn y ver el aviso. |
| 7. Pulido y revisión | Revisión de accesibilidad, responsive y copy; actualizar `APP_README.md` y `CLAUDE.md` si cambia la estructura. | docs | Recorrido completo en 360, 768 y 1280 px; Lighthouse accesibilidad. |

**Cómo se prueba:** levantar `uvicorn app.main:app --reload` en `backend/`, abrir `http://localhost:8000/` en el navegador integrado, y verificar con capturas por fase. El repo no tiene tests; la verificación es manual por fase, con la lista de criterios de la tabla.

**Cambios opcionales en backend (solo si el equipo los pide):** exponer `GET /api/v1/predicciones/{id}` (hoy el header `Location` apunta a una ruta inexistente) y un endpoint de métricas del modelo para mostrarlas en la UI.

**Riesgos:** (a) la tipografía depende de descargar archivos; (b) historial en memoria vuelve vacía la demo tras reiniciar; (c) la banda "Vigilar" puede contradecir las métricas del informe si no se valida con quien entrenó el modelo.

## 9. Estado de la implementación

Las fases 0 a 7 están implementadas en la rama `frontend`. Diferencias respecto al plan:

- Los módulos JS quedaron como `api.js`, `errores.js`, `riesgo.js`, `ui.js`, `estado.js`, `sesion.js`, `formulario.js`, `diagnostico.js` (el manómetro), `historial.js` y `main.js`.
- El historial pide bloques de 100 a la API y recorta 10 filas por página en el cliente, para que la página 1 siempre muestre las 10 predicciones más recientes aunque la API pagine desde la más antigua.
- RF-12 (reusar valores) se implementó como botón "Reusar" en cada fila.

**Pruebas realizadas** (navegador integrado contra el backend real con un modelo falso, ver nota):

| Prueba | Resultado |
|---|---|
| Login con clave incorrecta y correcta; reutilizar la sesión al recargar; cerrar sesión limpia diagnóstico e historial | Correcto |
| Token inválido o vencido vuelve al login con "Tu sesión venció, ingresa de nuevo." | Correcto |
| Validación en cliente (vacío, torque negativo), foco al primer error, aviso fuera de rango típico, barra y número sincronizados | Correcto |
| Predicciones normal / a vigilar / falla: clasificación, ángulo de la aguja, porcentaje, `aria-label` | Correcto |
| Historial con 117 registros: 12 páginas, página que cruza dos bloques (ids 107 a 98 sin huecos), última página de 7 filas, filtro "Solo fallas", "Reusar" | Correcto |
| Servidor apagado: mensaje de conexión, tabla conservada, estado "Sin conexión con el servicio" | Correcto |
| Contraste WCAG AA (14 pares calculados; el mínimo es 3,62:1 en bordes de control) | Correcto |
| Orden de tabulación, foco visible, sin desbordamiento horizontal a 375 px | Correcto |

**No probado:** `prefers-reduced-motion` (solo revisado en el CSS), lector de pantalla real, navegadores distintos al integrado, y el modelo real (ver nota).

> **Nota sobre el modelo.** `modelo_mantenimiento_predictivo.pkl` se serializó con scikit-learn 1.6.1, que no tiene instalador para Python 3.14. Las primeras pruebas usaron el backend real con un modelo falso. Después se instaló Python 3.12 y se repitió con el modelo original: el backend arranca sin errores, 40 de 40 filas con falla real salen como "Falla", 0 de 40 filas sin falla se marcan, y cada predicción tarda unos 0,24 s. Esas filas formaban parte del entrenamiento (el modelo final usa el 100 % de los datos), así que confirman que el modelo carga y predice con sentido, no su capacidad de generalizar.
>
> Con probabilidades reales, "Vigilar" aparece poco: los casos sin falla suelen dar menos de 3 % y los de falla más de 58 %. El umbral de 20 % sigue siendo una decisión de presentación pendiente de validar.
>
> Se probó también reexportar el modelo con scikit-learn 1.9.1 y se descartó: el mismo Random Forest dio recall 0.794 y F1 0.617 en vez de 0.691 y 0.723.
