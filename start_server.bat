@echo off
title JANBHASHA AI Cloud Server
cd /d " %~dp0\
echo ===================================================
echo JANBHASHA AI Dual-Mode Cloud Backend Server
echo Listening on: http://0.0.0.0:8000
echo Wi-Fi URL : http://10.17.86.216:8000
echo USB ADB URL : http://localhost:8000
echo ===================================================
call .\venv\Scripts\activate.bat
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
pause
