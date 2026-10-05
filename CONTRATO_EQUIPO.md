# Contrato de Equipo — Proyecto 1: Clasificación con Machine Learning y Aplicación Web

**Asignatura:** Inteligencia Artificial · Sexto Semestre · Ingeniería en Sistemas de Información
**Pontificia Universidad Católica del Ecuador (PUCE)**
**Dataset elegido:** AI4I 2020 Predictive Maintenance Dataset (Kaggle / UCI Machine Learning Repository)
**Fecha máxima de entrega:** domingo 11 de octubre de 2026
**Valor del proyecto:** 12.5 puntos

---

## 1. Integrantes del equipo

| # | Nombre completo | Correo | Rol principal |
|---|---|---|---|
| 1 | Alisson Basantes | adbasantes2@gmail.com | Datos (EDA y preparación) |
| 2 | David ____________________ | ____________________ | Modelos (entrenamiento y evaluación) *(propuesto, ajustable)* |
| 3 | Karol ____________________ | ____________________ | Producto (app web e informe) *(propuesto, ajustable)* |

---

## 2. Objetivo del proyecto

Desarrollar un proyecto completo de machine learning supervisado sobre el dataset **AI4I 2020 Predictive Maintenance** (mantenimiento predictivo de máquinas industriales), cubriendo exploración de datos, entrenamiento y comparación de al menos dos algoritmos de clasificación, evaluación rigurosa, selección del mejor modelo, y despliegue en una aplicación web funcional que prediga si una máquina va a fallar a partir de sus condiciones de operación.

---

## 3. Responsabilidades por rol (mapeadas a la rúbrica, 12.5 pts)

### Persona 1 — Datos (Criterio 1: EDA y preparación de datos, 2.0 pts)
- Exploración completa del dataset: tipos de variable, valores faltantes/atípicos, distribución de la variable objetivo (`Machine failure`) y su desbalance de clases.
- Limpieza, codificación de variables categóricas (`Type`), escalado de variables numéricas.
- Al menos 3 visualizaciones relevantes.
- Define el pipeline de preprocesamiento (`ColumnTransformer`) que usará todo el equipo.

### Persona 2 — Modelos (Criterios 2 y 3: modelado, justificación y evaluación, 5.0 pts)
- Entrena y compara al menos dos algoritmos de clasificación (ej. Regresión Logística, Random Forest, SVM), con justificación razonada de por qué se eligieron.
- Tuning de hiperparámetros con `GridSearchCV` o `RandomizedSearchCV`.
- Evaluación con métricas apropiadas al desbalance de clases (precision, recall, F1, matriz de confusión, ROC/AUC).
- Selección justificada del mejor modelo y reentrenamiento final para exportación.

### Persona 3 — Producto (Criterios 4 y 6: app web e informe, 4.0 pts)
- Aplicación web (Streamlit u otro framework) que reciba las variables de entrada y muestre la predicción con su probabilidad.
- Informe PDF (máx. 5 páginas): arquitectura de la app, integración del modelo, capturas de pantalla, instrucciones de instalación/ejecución, limitaciones conocidas.
- Organización del repositorio de GitHub (estructura de carpetas, README, requirements.txt).

### Transversal — Documentación del notebook (Criterio 5, 1.5 pts)
Cada integrante comenta y documenta su propia sección del notebook con una narrativa clara que explique las decisiones tomadas.

---

## 4. Cronograma interno

| Fecha | Hito |
|---|---|
| Lunes | Validación del dataset con el docente, creación del repositorio, reparto de ramas en Git. |
| Martes–Miércoles | EDA y preprocesamiento completos. Esqueleto de la app en paralelo. |
| Jueves | Comparación de modelos y tuning de hiperparámetros finalizados. Modelo final exportado. |
| Viernes | Integración del modelo en la app web, pruebas de punta a punta. |
| Sábado | Informe PDF, comentarios del notebook, `requirements.txt`, commit final. |
| Domingo (antes de la entrega) | Ensayo cruzado de la sustentación: cada integrante debe poder explicar cualquier parte del proyecto. |

---

## 5. Reglas de trabajo en equipo

1. **Comunicación:** el equipo mantiene un chat activo (WhatsApp/Discord) y se reúne al menos 3 veces antes de la entrega (presencial o virtual) para revisar avances.
2. **GitHub:** cada integrante trabaja en su propia rama y fusiona a `main` mediante Pull Request. Los commits deben tener mensajes claros que describan el cambio.
3. **Plazos internos:** cada hito del cronograma debe cumplirse a más tardar al final del día indicado. Un atraso debe avisarse al equipo con anticipación, no el mismo día de la entrega.
4. **Entendimiento compartido:** dado que la sustentación incluye preguntas individuales sobre cualquier parte del proyecto, cada integrante se compromete a entender el trabajo completo, no solo su rol asignado, antes de la fecha de sustentación.
5. **Participación equitativa:** el equipo reconoce que, según la rúbrica, una participación desigual o la incapacidad de explicar su parte puede afectar la calificación individual dentro del grupo.
6. **Resolución de conflictos:** cualquier desacuerdo sobre el trabajo se discute primero entre los integrantes; si no se resuelve, se consulta al docente con anticipación suficiente para no comprometer la entrega.

---

## 6. Firmas

Al firmar, cada integrante confirma que ha leído y acepta los términos de este contrato de equipo.

| Integrante | Firma | Fecha |
|---|---|---|
| Alisson Basantes | ____________________ | ____________________ |
| ____________________ | ____________________ | ____________________ |
| ____________________ | ____________________ | ____________________ |
