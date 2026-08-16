@echo off
echo Killing processes on ports 3000 and 5000...

FOR /F "tokens=5" %%T IN ('netstat -a -n -o ^| findstr :3000') DO (
    echo Killing PID %%T on port 3000
    taskkill /PID %%T /F >nul 2>&1
)

FOR /F "tokens=5" %%T IN ('netstat -a -n -o ^| findstr :5000') DO (
    echo Killing PID %%T on port 5000
    taskkill /PID %%T /F >nul 2>&1
)

echo Cleaning up Next.js cache to fix Turbopack error...
IF EXIST "frontend\.next" (
    rmdir /S /Q "frontend\.next"
    echo .next cache deleted.
)

echo Starting Backend...
start cmd /k "cd backend && npm run dev"

echo Starting Frontend...
start cmd /k "cd frontend && npm run dev"

echo Servers are starting in new windows. Done!
