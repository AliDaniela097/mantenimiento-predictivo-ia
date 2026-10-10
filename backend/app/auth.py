"""
Seguridad con JWT (ver docs/contrato_api.md, seccion "security").

Proyecto academico sin base de datos de usuarios: se usa un unico usuario
de demostracion para todo el equipo. Antes de un uso real fuera del aula,
SECRET_KEY debe moverse a una variable de entorno y las credenciales a una
base de datos con contrasenas hasheadas (bcrypt/argon2).
"""
import os
from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

# En un despliegue publico se define la variable de entorno SECRET_KEY; el valor
# por defecto solo sirve para desarrollo local.
SECRET_KEY = os.environ.get("SECRET_KEY", "cambia-esta-clave-por-una-propia-antes-de-publicar-el-repo")
ALGORITHM = "HS256"
EXPIRA_MINUTOS = 60

USUARIO_DEMO = "equipo"
CONTRASENA_DEMO = "mantenimiento2026"

bearer_scheme = HTTPBearer()


def crear_token(usuario: str) -> str:
    expira = datetime.now(timezone.utc) + timedelta(minutes=EXPIRA_MINUTOS)
    payload = {"sub": usuario, "exp": expira}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def verificar_credenciales(usuario: str, contrasena: str) -> bool:
    return usuario == USUARIO_DEMO and contrasena == CONTRASENA_DEMO


def obtener_usuario_actual(
    credenciales: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> str:
    token = credenciales.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        usuario = payload.get("sub")
        if usuario is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token invalido")
        return usuario
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token invalido o expirado")
