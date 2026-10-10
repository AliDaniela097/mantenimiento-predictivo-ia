"""
Backend de la app de mantenimiento predictivo.
Implementa exactamente el contrato descrito en docs/contrato_api.md.
"""
from datetime import datetime, timezone
from pathlib import Path
from typing import List

import joblib
import pandas as pd
from fastapi import Depends, FastAPI, HTTPException, Query, Request, status
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from .auth import EXPIRA_MINUTOS, crear_token, obtener_usuario_actual, verificar_credenciales
from .schemas import EntradaPrediccion, LoginRequest

BASE_DIR = Path(__file__).resolve().parent
MODELO_PATH = BASE_DIR / "models" / "modelo_mantenimiento_predictivo.pkl"
FRONTEND_DIR = BASE_DIR.parent.parent / "frontend"

app = FastAPI(
    title="API de Prediccion de Fallas - Mantenimiento Predictivo",
    version="1.0.0",
    description=(
        "Expone el modelo de Random Forest (tuneado) entrenado sobre el dataset "
        "AI4I 2020 para predecir fallas de maquinas industriales. "
        "Contrato completo en docs/contrato_api.md."
    ),
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

modelo = joblib.load(MODELO_PATH)

historial: List[dict] = []
contador_id = 0


def _mapear_columnas(entrada: EntradaPrediccion) -> pd.DataFrame:
    return pd.DataFrame(
        [
            {
                "Type": entrada.tipo,
                "Air temperature [K]": entrada.temperatura_aire_k,
                "Process temperature [K]": entrada.temperatura_proceso_k,
                "Rotational speed [rpm]": entrada.velocidad_rotacional_rpm,
                "Torque [Nm]": entrada.torque_nm,
                "Tool wear [min]": entrada.desgaste_herramienta_min,
            }
        ]
    )


@app.exception_handler(RequestValidationError)
async def manejador_validacion(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"status": "error", "error": "Datos invalidos", "details": exc.errors()},
    )


@app.get("/api/v1/salud", tags=["sistema"])
def salud():
    return {"status": "ok", "message": "Servicio disponible", "data": None}


@app.post("/api/v1/auth/login", tags=["auth"])
def login(payload: LoginRequest):
    if not verificar_credenciales(payload.usuario, payload.contrasena):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales invalidas")
    token = crear_token(payload.usuario)
    return {
        "status": "ok",
        "message": "Autenticado",
        "data": {"access_token": token, "token_type": "bearer", "expira_en_minutos": EXPIRA_MINUTOS},
    }


@app.post("/api/v1/predicciones", status_code=status.HTTP_201_CREATED, tags=["predicciones"])
def crear_prediccion(entrada: EntradaPrediccion, usuario: str = Depends(obtener_usuario_actual)):
    global contador_id
    X = _mapear_columnas(entrada)
    pred = int(modelo.predict(X)[0])
    proba = float(modelo.predict_proba(X)[0][1])

    contador_id += 1
    registro = {
        **entrada.model_dump(),
        "id": contador_id,
        "prediccion": "Falla" if pred == 1 else "No falla",
        "probabilidad_falla": round(proba, 4),
        "creado_en": datetime.now(timezone.utc),
    }
    historial.append(registro)

    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        headers={"Location": f"/api/v1/predicciones/{contador_id}"},
        content={"status": "ok", "message": "Prediccion generada", "data": jsonable_encoder(registro)},
    )


@app.get("/api/v1/predicciones", tags=["predicciones"])
def listar_predicciones(
    usuario: str = Depends(obtener_usuario_actual),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    inicio = (page - 1) * limit
    fin = inicio + limit
    items = historial[inicio:fin]
    return {
        "status": "ok",
        "message": "Historial de predicciones",
        "data": {
            "items": jsonable_encoder(items),
            "pagina": page,
            "limite": limit,
            "total": len(historial),
        },
    }


if FRONTEND_DIR.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")
