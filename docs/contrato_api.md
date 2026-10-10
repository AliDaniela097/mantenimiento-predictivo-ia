# Contrato de API — Mantenimiento Predictivo (v1)

> **Archivo formal (OpenAPI 3.1, YAML):** `docs/openapi.yaml` — generado automaticamente desde el backend implementado (fuente unica de verdad). Este documento es la version legible/explicada del mismo contrato.

Diseñado primero (enfoque API-first), antes de programar el backend, siguiendo los
principios de diseño de contratos: nombres coherentes, versión explícita en la ruta,
esquemas reutilizables y compatibilidad hacia atrás.

## info
- Título: API de Predicción de Fallas — Mantenimiento Predictivo (AI4I 2020)
- Versión: v1
- Descripción: expone el modelo de Random Forest (tuneado) entrenado para predecir
  si una máquina va a fallar, a partir de sus condiciones de operación.

## servers
- `http://localhost:8000/api/v1` (desarrollo local)

## security
- Esquema: JWT (Bearer Token), obtenido con `POST /auth/login`.
- Pública (sin token), equivalente al "catálogo público": `GET /salud`.
- Protegidas (token obligatorio), equivalente a "operaciones críticas": `POST /predicciones`, `GET /predicciones`.
- Usuario de demostración del equipo (proyecto académico, sin base de datos de usuarios):
  `usuario: equipo` / `contrasena: mantenimiento2026`.

## components/schemas

### EntradaPrediccion (reutilizado en POST y en cada ítem de GET)
| Campo | Tipo | Regla |
|---|---|---|
| tipo | string | uno de `L`, `M`, `H` (calidad del producto) |
| temperatura_aire_k | number | > 0 |
| temperatura_proceso_k | number | > 0 |
| velocidad_rotacional_rpm | number | > 0 |
| torque_nm | number | >= 0 |
| desgaste_herramienta_min | number | >= 0 |

### RespuestaExito
`{ "status": "ok", "message": string, "data": object|null }`

### RespuestaError
`{ "status": "error", "error": string, "details": object|null }`

## paths

### POST /auth/login
Pública. Autentica y devuelve un token JWT.

Request:
```json
{ "usuario": "equipo", "contrasena": "mantenimiento2026" }
```
- 200 OK → `{ "status":"ok", "message":"Autenticado", "data": { "access_token": "...", "token_type":"bearer", "expira_en_minutos":60 } }`
- 401 → credenciales inválidas

### GET /salud
Pública. Chequeo de disponibilidad del servicio.
- 200 OK → `{ "status":"ok", "message":"Servicio disponible", "data": null }`

### POST /predicciones
Protegida (Bearer token). Crea una predicción nueva a partir de `EntradaPrediccion`.
- 201 Created (header `Location: /api/v1/predicciones/{id}`) →
  `{ "status":"ok", "message":"Predicción generada", "data": { "id", "prediccion": "Falla"|"No falla", "probabilidad_falla", "creado_en", ...EntradaPrediccion } }`
- 400 → datos inválidos (ej. `tipo` fuera de L/M/H, valores negativos)
- 401 → token ausente o inválido

### GET /predicciones?page=1&limit=20
Protegida (Bearer token). Lista el historial de predicciones, paginado (query params, no en la ruta).
- 200 OK → `{ "status":"ok", "message":"Historial de predicciones", "data": { "items":[...], "pagina", "limite", "total" } }`
- 401 → token ausente o inválido

## Versionamiento
- Prefijo `/api/v1` en todas las rutas.
- Agregar campos opcionales nuevos no rompe compatibilidad; quitar o renombrar un campo sí,
  y se avisaría con cabeceras `Deprecation`/`Sunset` si llegara a pasar.

## Documentación interactiva
Generada automáticamente desde este mismo contrato implementado en FastAPI:
- Swagger UI: `http://localhost:8000/docs`
- Redoc: `http://localhost:8000/redoc`
- JSON OpenAPI: `http://localhost:8000/openapi.json`
