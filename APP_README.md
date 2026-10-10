# Cómo correr la app (backend + frontend)

## 1. Instalar dependencias

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
```

## 2. Levantar el servidor

```bash
# sigues dentro de backend/
uvicorn app.main:app --reload
```

Esto levanta todo en `http://localhost:8000`:
- Frontend (la página web): `http://localhost:8000/`
- Swagger (documentación interactiva): `http://localhost:8000/docs`
- Redoc: `http://localhost:8000/redoc`

## 3. Usar la app

1. Abre `http://localhost:8000/` en el navegador.
2. Inicia sesión con el usuario de demostración: `equipo` / `mantenimiento2026`
   (ver `docs/contrato_api.md`).
3. Llena el formulario de predicción y presiona "Predecir".
4. El historial de predicciones se actualiza automáticamente debajo.

## Estructura

```
repo_skeleton/
  backend/
    app/
      main.py      # endpoints de la API (FastAPI)
      auth.py       # login y JWT
      schemas.py    # esquemas de datos (Pydantic)
      models/
        modelo_mantenimiento_predictivo.pkl   # modelo entrenado (Random Forest tuneado)
    requirements.txt
  frontend/
    index.html
    style.css
    script.js
  docs/
    contrato_api.md   # contrato de la API, diseñado antes de programar
```

## Notas para la sustentación

- El modelo es el Random Forest tuneado (GridSearchCV): F1 falla = 0.723, recall falla = 0.691, accuracy = 0.982.
- La API sigue REST: sustantivos en plural en las rutas, verbos HTTP con su significado estándar
  (POST crea → 201, GET lee → 200), códigos de error (400/401), y paginación por query params.
- La seguridad usa JWT: el login es público, pero predecir y ver el historial requieren el token.
- El contrato (`docs/contrato_api.md`) se escribió antes del código, y el código lo implementa tal cual.
