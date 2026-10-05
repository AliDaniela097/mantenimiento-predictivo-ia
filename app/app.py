# Esqueleto inicial de la app - Karol completa esto cuando el modelo final este listo
import streamlit as st
import pandas as pd
import joblib

st.title("Mantenimiento Predictivo - Prediccion de Falla de Maquina")

# TODO: una vez exportado el modelo final, descomentar esta linea
# modelo = joblib.load('modelo_mantenimiento.pkl')

st.write("Ingresa las condiciones de operacion de la maquina:")

tipo = st.selectbox("Tipo de maquina", ["L", "M", "H"])
temp_aire = st.number_input("Temperatura del aire [K]", value=300.0)
temp_proceso = st.number_input("Temperatura del proceso [K]", value=310.0)
velocidad = st.number_input("Velocidad rotacional [rpm]", value=1500)
torque = st.number_input("Torque [Nm]", value=40.0)
desgaste = st.number_input("Desgaste de herramienta [min]", value=0)

if st.button("Predecir"):
    st.write("TODO: cargar el modelo real y mostrar la prediccion aqui")
