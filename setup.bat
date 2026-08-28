@echo off
echo =========================================================
echo       JANBHASHA - Offline Educational Platform
echo      "Teach in Hindi. Learn in Your Mother Tongue."
echo             Developed by Team Xerses
echo =========================================================
echo.

echo [1/3] Setting up Python virtual environment...
python -m venv venv
call venv\Scripts\activate

echo [2/3] Installing Python backend dependencies...
pip install -r requirements.txt

echo [3/3] Setting up React Native Expo frontend...
cd frontend
npm install
cd ..

echo.
echo =========================================================
echo Setup Complete!
echo.
echo To start Backend:
echo   call venv\Scripts\activate
echo   cd backend
echo   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
echo.
echo To start Frontend:
echo   cd frontend
echo   npm start
echo =========================================================
pause
