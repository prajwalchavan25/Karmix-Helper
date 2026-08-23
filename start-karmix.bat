@echo off
title Karmix Helper Launcher
echo ===================================================
echo   Starting Karmix Helper Full-Stack Application...
echo   Tagline: Understand. Discover. Apply.
echo ===================================================

echo Starting Backend Server on http://localhost:5000...
start /min cmd /k "cd /d %~dp0backend && npm run dev"

echo Starting Frontend Server on http://localhost:3000...
start /min cmd /k "cd /d %~dp0frontend && npm run dev"

echo Waiting for servers to initialize...
timeout /t 3 /nobreak >nul

echo Opening browser...
start http://localhost:3000

echo ===================================================
echo   Karmix Helper is now live at http://localhost:3000!
echo ===================================================
