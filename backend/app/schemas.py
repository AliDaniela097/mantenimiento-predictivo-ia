"""
Esquemas reutilizables (components/schemas del contrato en docs/contrato_api.md).
Un solo lugar de verdad para la forma de los datos: se usan tanto en las
peticiones (POST /predicciones) como en las respuestas (GET /predicciones).
"""
from datetime import datetime
from typing import List, Literal

from pydantic import BaseModel, Field


class EntradaPrediccion(BaseModel):
    tipo: Literal["L", "M", "H"] = Field(
        ..., description="Calidad del producto: L=baja, M=media, H=alta"
    )
    temperatura_aire_k: float = Field(..., gt=0, description="Temperatura del aire (Kelvin)")
    temperatura_proceso_k: float = Field(..., gt=0, description="Temperatura del proceso (Kelvin)")
    velocidad_rotacional_rpm: float = Field(..., gt=0, description="Velocidad rotacional (RPM)")
    torque_nm: float = Field(..., ge=0, description="Torque (Newton-metro)")
    desgaste_herramienta_min: float = Field(..., ge=0, description="Desgaste de la herramienta (minutos)")


class PrediccionResultado(EntradaPrediccion):
    id: int
    prediccion: str
    probabilidad_falla: float
    creado_en: datetime


class LoginRequest(BaseModel):
    usuario: str
    contrasena: str


class TokenData(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expira_en_minutos: int


class ListaPredicciones(BaseModel):
    items: List[PrediccionResultado]
    pagina: int
    limite: int
    total: int
