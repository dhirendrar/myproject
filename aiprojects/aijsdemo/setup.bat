@echo off
REM AI Agentic System - Windows Setup Script
REM This script helps setup the development environment on Windows

echo ========================================
echo AI Agentic System - Setup Script
echo ========================================
echo.

REM Check Node.js installation
echo [1/6] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js found: 
node --version
echo.

REM Check npm installation
echo [2/6] Checking npm installation...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed!
    pause
    exit /b 1
)
echo npm found:
npm --version
echo.

REM Install dependencies
echo [3/6] Installing dependencies...
echo This may take a few minutes...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies!
    pause
    exit /b 1
)
echo Dependencies installed successfully!
echo.

REM Setup environment file
echo [4/6] Setting up environment configuration...
if not exist .env (
    if exist .env.example (
        copy .env.example .env
        echo .env file created from .env.example
        echo IMPORTANT: Please edit .env file and add your API keys!
    ) else (
        echo ERROR: .env.example not found!
        pause
        exit /b 1
    )
) else (
    echo .env file already exists, skipping...
)
echo.

REM Check PostgreSQL
echo [5/6] Checking PostgreSQL...
psql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: PostgreSQL not found in PATH
    echo.
    echo You have two options:
    echo   1. Install PostgreSQL locally from https://www.postgresql.org/download/windows/
    echo   2. Use Docker: docker run --name ai-postgres -e POSTGRES_PASSWORD=mysecret -e POSTGRES_DB=ai_agent_db -p 5432:5432 -d pgvector/pgvector:pg16
    echo.
) else (
    echo PostgreSQL found:
    psql --version
    echo.
    echo To setup the database, run:
    echo   psql -U postgres -d ai_agent_db -f config\database_setup.sql
)
echo.

REM Build TypeScript
echo [6/6] Building TypeScript...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: TypeScript build failed!
    pause
    exit /b 1
)
echo Build completed successfully!
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo   1. Edit .env file and add your API keys
echo   2. Setup PostgreSQL database (see above)
echo   3. Run: npm run dev
echo   4. Test: curl http://localhost:3000/health
echo.
echo Documentation:
echo   - Quick Start: QUICKSTART.md
echo   - Full Guide: README.md
echo   - Testing: TESTING.md
echo.
echo Happy coding!
echo.
pause
