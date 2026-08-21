@echo off
cd /d "%~dp0"
echo ========================================
echo  FRONTEND - The Great India News
echo ========================================
echo.
if not exist node_modules (
  echo Installing dependencies...
  call npm.cmd install
)
echo Starting frontend on http://localhost:5173
echo Make sure BACKEND is running on port 5000
echo.
call npm.cmd run dev
pause
