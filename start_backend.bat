@echo off
title JANBHASHA Backend Server
echo ====================================================
echo   Starting JANBHASHA Local Backend Server...
echo ====================================================
cd /d "D:\Additional\PROJECT\JANBHASHA"
call venv\Scripts\activate
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
pause
