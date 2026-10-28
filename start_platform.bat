@echo off
echo ============================================================
echo Starting BuildIntel AI - Multimodal Construction Platform
echo ============================================================

start cmd /k "echo Starting FastAPI Backend on Port 8000... && cd /d %~dp0 && python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 3 /nobreak >nul

start cmd /k "echo Starting Vite React Frontend on Port 5173... && cd /d %~dp0frontend && npm run dev"

echo.
echo Servers launched!
echo Backend Swagger API: http://127.0.0.1:8000/docs
echo Frontend Dashboard:  http://localhost:5173
echo ============================================================
