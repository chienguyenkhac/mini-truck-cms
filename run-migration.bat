@echo off
REM ========================================
REM Script: Run Database Migration
REM Description: Add brand column to categories table
REM ========================================

echo.
echo ========================================
echo   DATABASE MIGRATION
echo   Adding 'brand' column to categories
echo ========================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not running!
    echo Please start Docker Desktop first.
    pause
    exit /b 1
)

REM Check if database container is running
docker ps --filter "name=sinotruk-db-local" --format "{{.Names}}" | findstr "sinotruk-db-local" >nul
if %errorlevel% neq 0 (
    echo [ERROR] Database container 'sinotruk-db-local' is not running!
    echo.
    echo Please start the database first:
    echo   docker-compose -f docker-compose.local.yml up -d
    pause
    exit /b 1
)

echo [INFO] Running migration...
echo.

REM Run migration
docker exec -i sinotruk-db-local psql -U postgres -d sinotruk < deploy\server\migrations\add_brand_to_categories.sql

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo   MIGRATION COMPLETED SUCCESSFULLY!
    echo ========================================
    echo.
    echo Next steps:
    echo 1. Restart API server (Ctrl+C and run 'npm run dev' again)
    echo 2. Test creating/updating categories in Admin UI
    echo.
) else (
    echo.
    echo [ERROR] Migration failed!
    echo Please check the error message above.
    echo.
)

pause

