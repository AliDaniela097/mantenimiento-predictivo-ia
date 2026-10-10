# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es

Proyecto universitario (PUCE, IA) de mantenimiento predictivo: un Random Forest tuneado (GridSearchCV) entrenado sobre el dataset AI4I 2020 (`ai4i2020.csv`, en la raíz) predice `Machine failure` (binaria). El modelo se sirve vía una API FastAPI que también hospeda un frontend estático. Documentación en español; mantén nombres de rutas, campos y mensajes en español como el resto del código.

## Comandos

Todo se ejecuta desde `backend/` (ver `APP_README.md`):

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload  # http://localhost:8000
```

- Frontend: `http://localhost:8000/` · Swagger: `/docs` · Redoc: `/redoc`
- Login de demostración: `equipo` / `mantenimiento2026`
- No hay tests, linter ni build configurados.

## Arquitectura

- **`backend/app/main.py`** — app FastAPI. Carga el modelo (`models/modelo_mantenimiento_predictivo.pkl`) con `joblib` al importar el módulo. Endpoints bajo `/api/v1`: `GET /salud` (público), `POST /auth/login` (público), `POST /predicciones` y `GET /predicciones?page&limit` (requieren JWT Bearer). Al final monta `frontend/` con `StaticFiles` en `/`, así que la API y la web comparten origen y el frontend usa rutas relativas (`API_BASE = "/api/v1"`).
- **`backend/app/schemas.py`** — modelos Pydantic (`EntradaPrediccion` con campos en español y snake_case con unidad, p. ej. `temperatura_aire_k`). Es la fuente de verdad de la forma de los datos.
- **`backend/app/auth.py`** — JWT (python-jose, HS256) con un único usuario hardcodeado. `SECRET_KEY` se lee de la variable de entorno del mismo nombre; el valor por defecto en el código es solo para desarrollo local. El despliegue en Render está descrito en `render.yaml` y `docs/despliegue_render.md`.
- **`frontend/`** — HTML/CSS/JS vanilla con módulos ES, sin build ni CDN (fuentes Barlow en `fonts/`). `js/api.js` es la única capa que llama a la API: agrega el Bearer, normaliza errores y trata 401/403 como sesión vencida; el token vive en `sessionStorage`. `js/riesgo.js` decide si una predicción se muestra como "No falla", "Vigilar" (≥ 20 %) o "Falla". `js/historial.js` pide bloques de 100 y pagina de 10 en 10 desde lo más reciente. Los estilos usan tokens en `css/tokens.css`. Diseño y requisitos en `docs/frontend_requerimientos_y_plan.md`.
- **`docs/contrato_api.md`** y **`docs/openapi.yaml`** — contrato de la API, diseñado antes del código; el backend debe seguir implementándolo tal cual. Si cambias endpoints o esquemas, actualiza ambos documentos.

### Puntos no obvios

- **Mapeo de columnas**: `_mapear_columnas()` en `main.py` traduce los campos en español de la API a los nombres originales del dataset (`Type`, `Air temperature [K]`, `Process temperature [K]`, `Rotational speed [rpm]`, `Torque [Nm]`, `Tool wear [min]`). El pipeline guardado en el `.pkl` espera exactamente esas columnas; si se reentrena con otras, hay que actualizar este mapeo.
- **`scikit-learn==1.6.1` está fijado** porque el `.pkl` es sensible a la versión con la que se serializó; no lo subas sin reexportar el modelo. No tiene instalador para Python 3.14: el backend se corre con Python 3.12 o 3.13 (`py -3.12 -m venv venv` dentro de `backend/`). Reexportar el modelo con scikit-learn más nuevo no sirve: con 1.9.1 el mismo Random Forest da otras métricas (recall 0.794, F1 0.617 en vez de 0.691 y 0.723), porque el bootstrap del bosque trata distinto los pesos de clase.
- **El historial es en memoria** (`historial` y `contador_id` globales): se pierde al reiniciar y no es seguro entre múltiples workers.
- **Errores de validación devuelven 400** (no el 422 por defecto de FastAPI) mediante un `exception_handler` personalizado, con forma `{status:"error", error, details}`. Las respuestas exitosas usan `{status:"ok", message, data}`.
- `FRONTEND_DIR` se resuelve relativo a `main.py` (`backend/../frontend`), por lo que el montaje funciona independientemente del cwd.

## Archivos desactualizados

- `README.md` (raíz) describe una app Streamlit en `app/` y una estructura (`CONTRATO_EQUIPO.md`, `notebook/`, `data/`) que no coincide con el estado real. `app/app.py` es un esqueleto Streamlit con TODOs, sin usar; la app real es `backend/` + `frontend/`.
- `notebook/` y `data/` solo contienen `.gitkeep`: el notebook de EDA/entrenamiento no está en el repo, solo el modelo ya exportado. El dataset está en la raíz, no en `data/`.
- `APP_README.md` menciona una carpeta `repo_skeleton/` que no existe en este repo.
