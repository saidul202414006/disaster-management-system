@echo off
setlocal EnableDelayedExpansion
color 0B
title Disaster Management System - Setup Wizard

echo ===============================================================================
echo            DISASTER MANAGEMENT SYSTEM (DMS) - AUTO SETUP WIZARD
echo ===============================================================================
echo.

:: 1. Check for Node.js
echo [1/4] Checking for Node.js...
node -v >nul 2>&1
if %ERRORLEVEL% neq 0 (
    color 0C
    echo [X] Error: Node.js is not installed or not in PATH!
    echo Please download and install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%a in ('node -v') do set NODE_VER=%%a
    echo [OK] Node.js is installed !NODE_VER!
)
echo.

:: 2. Check for Oracle SQL*Plus
echo [2/4] Checking for Oracle SQL*Plus...
sqlplus -v >nul 2>&1
if %ERRORLEVEL% neq 0 (
    color 0E
    echo [!] Warning: Oracle SQL*Plus is not found in PATH!
    echo If you want to run the database locally, please install Oracle Database 21c XE.
    echo Download link: https://www.oracle.com/database/technologies/xe-downloads.html
    echo.
) else (
    echo [OK] Oracle SQL*Plus is installed!
)
echo.

:: 3. Setup Environment Variables
echo [3/4] Configuring Environment Variables...

:: Setup Backend .env
if not exist "backend\.env" (
    echo Creating backend\.env...
    echo We need your Oracle Database password (usually 'saidul' or 'system')
    set /p dbpass="Enter your Oracle DB Password for 'system' user: "
    
    echo DB_USER=system> backend\.env
    echo DB_PASSWORD=!dbpass!>> backend\.env
    echo DB_CONNECTION_STRING=localhost:1521/XE>> backend\.env
    echo PORT=5000>> backend\.env
    echo NODE_ENV=development>> backend\.env
    echo FRONTEND_URL=http://localhost:3000>> backend\.env
    echo JWT_SECRET=dms_bangladesh_jwt_secret_2024_xK9mP3nQ>> backend\.env
    
    echo.
    echo We also need a Gmail App Password to send OTP emails.
    echo If you don't have one right now, just press Enter and edit backend\.env later.
    set /p gmailuser="Enter your Gmail Address (leave blank to skip): "
    if "!gmailuser!"=="" (
        echo GMAIL_USER=your_email@gmail.com>> backend\.env
        echo GMAIL_APP_PASSWORD=your_app_password_here>> backend\.env
    ) else (
        set /p gmailpass="Enter your Gmail App Password: "
        echo GMAIL_USER=!gmailuser!>> backend\.env
        echo GMAIL_APP_PASSWORD=!gmailpass!>> backend\.env
    )
    echo [OK] Backend .env created successfully.
) else (
    echo [OK] backend\.env already exists, skipping creation.
)

:: Setup Frontend .env.local
if not exist "frontend\.env.local" (
    echo NEXT_PUBLIC_API_URL=http://localhost:5000/api> frontend\.env.local
    echo [OK] Frontend .env.local created successfully.
) else (
    echo [OK] frontend\.env.local already exists, skipping creation.
)
echo.

:: 4. Install Dependencies
echo [4/4] Installing NPM Dependencies...
echo.
echo Installing Backend dependencies...
cd backend
call npm install
cd ..

echo.
echo Installing Frontend dependencies...
cd frontend
call npm install --legacy-peer-deps
cd ..
echo.

:: 5. Database Seeding Prompt
sqlplus -v >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo ===============================================================================
    echo                       DATABASE SETUP
    echo ===============================================================================
    echo Would you like to automatically create the database tables now?
    echo (This will drop existing tables and create fresh ones)
    set /p rundb="Run database setup? (Y/N): "
    if /i "!rundb!"=="Y" (
        for /f "tokens=2 delims==" %%a in ('findstr DB_PASSWORD backend\.env') do set DBPASS=%%a
        echo Running SQL setup script...
        echo exit | sqlplus -S system/!DBPASS!@localhost:1521/XE @database\01_schema.sql
        echo exit | sqlplus -S system/!DBPASS!@localhost:1521/XE @database\06_app_user.sql
        echo [OK] Database schema initialized!
    )
)

echo.
echo ===============================================================================
echo                       SETUP COMPLETE!
echo ===============================================================================
echo.
echo To start the project:
echo 1. Just double-click the 'restart.bat' file in this folder.
echo 2. Open http://localhost:3000 in your browser.
echo.
pause
