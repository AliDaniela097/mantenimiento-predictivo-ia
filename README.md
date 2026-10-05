# Mantenimiento Predictivo con Machine Learning

Proyecto 1 — Clasificación con Machine Learning y Aplicación Web
Inteligencia Artificial · Sexto Semestre · Ingeniería en Sistemas de Información · PUCE

## Equipo
- Alisson Basantes — Datos (EDA y preparación)
- David — Modelos (entrenamiento y evaluación)
- Karol — Producto (app web e informe)

## Dataset
**AI4I 2020 Predictive Maintenance Dataset** (UCI Machine Learning Repository / Kaggle)
10,000 registros, 14 columnas. Predice si una máquina industrial va a fallar (`Machine failure`, binaria)
a partir de variables de operación (temperatura, velocidad rotacional, torque, desgaste de herramienta, tipo de máquina).

Fuente: https://archive.ics.uci.edu/dataset/601/ai4i+2020+predictive+maintenance+dataset

## Estructura del repositorio
```
notebook/   -> notebook .ipynb con todo el proceso de EDA, modelado y evaluación
app/        -> código de la aplicación web + modelo exportado + requirements.txt
informe/    -> informe PDF de la aplicación (máx. 5 páginas)
data/       -> dataset usado (ai4i2020.csv)
CONTRATO_EQUIPO.md -> contrato de equipo firmado
```

## Cómo ejecutar la app localmente
```bash
cd app
pip install -r requirements.txt
streamlit run app.py
```

## Estado del proyecto
- [ ] EDA y preparación de datos
- [ ] Entrenamiento y comparación de modelos
- [ ] Tuning de hiperparámetros
- [ ] Evaluación y selección del modelo final
- [ ] Aplicación web funcional
- [ ] Informe PDF
- [ ] Ensayo de sustentación
