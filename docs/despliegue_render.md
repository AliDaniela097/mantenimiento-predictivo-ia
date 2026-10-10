# Despliegue en Render (plan gratuito)

La app (API FastAPI y frontend) se despliega como un único servicio web. La configuración está en `render.yaml`, en la raíz del repo.

## Qué necesita

- Cuenta en https://render.com (se puede entrar con GitHub).
- El código en GitHub, en la rama que vas a desplegar, con `render.yaml` y los cambios del frontend. Conviene fusionar antes los pull requests pendientes a `main`.
- Render debe tener acceso al repositorio. El repo es de `AliDaniela097`: o ella autoriza a Render, o haces un fork en tu cuenta y despliegas desde ahí.

## Pasos con Blueprint (recomendado)

1. En Render: **New** → **Blueprint**.
2. Conecta tu cuenta de GitHub y elige el repositorio.
3. Elige la rama (normalmente `main`). Render lee `render.yaml` y muestra el servicio `mantenimiento-predictivo` con plan **Free**.
4. Pulsa **Apply**. Render genera `SECRET_KEY` automáticamente y empieza a construir (unos minutos).
5. Cuando el estado sea **Live**, abre la URL `https://mantenimiento-predictivo.onrender.com` (si el nombre ya existe, Render agrega un sufijo).

Si Render pide una tarjeta para el Blueprint, crea el servicio a mano (siguiente sección) y elige el plan Free.

## Pasos manuales (alternativa)

**New** → **Web Service** → elige el repositorio y rellena:

| Campo | Valor |
|---|---|
| Runtime | Python 3 |
| Build Command | `pip install -r backend/requirements.txt` |
| Start Command | `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| Instance type | Free |
| Health Check Path | `/api/v1/salud` |

En **Environment** agrega:

| Variable | Valor |
|---|---|
| `PYTHON_VERSION` | `3.12.10` |
| `SECRET_KEY` | un valor aleatorio, por ejemplo con `python -c "import secrets; print(secrets.token_urlsafe(48))"` |

## Comportamiento a tener en cuenta

- Tras unos 15 minutos sin visitas el servicio se duerme; la primera visita siguiente tarda cerca de un minuto en responder.
- El historial de predicciones está en memoria: se borra cada vez que el servicio se duerme, se reinicia o se vuelve a desplegar.
- El plan gratuito tiene 512 MB de RAM. La app usa unos 140 MiB con el modelo cargado.
- El usuario de demostración (`equipo` / `mantenimiento2026`) está prellenado, así que cualquiera con la URL puede entrar.
- Con `autoDeploy: true`, cada push a la rama desplegada reconstruye el servicio.
- Las condiciones del plan gratuito cambian: revisa https://render.com/pricing antes de crear la cuenta.

## Probado localmente

Se simuló el arranque de Render: puerto tomado de `PORT`, `SECRET_KEY` por variable de entorno y el comando de inicio ejecutado desde `backend/`. El health check, el frontend, el login y una predicción con el modelo real respondieron bien, y el token quedó firmado con la clave de la variable. El `render.yaml` se validó como YAML. **No** se probó en Render mismo.
