@echo off
echo ===================================================
echo  LIMPIEZA DE BASE DE DATOS - MAMA MIAN PIZZA
echo ===================================================
echo Este script eliminara todos los datos excepto usuarios y administradores.
echo.
echo Ejecutando script de limpieza...

node "%~dp0clean-db.js"

echo.
echo Finalizado.
pause
