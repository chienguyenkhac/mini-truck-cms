@echo off
REM ========================================
REM Script: Reset Database
REM Description: Drop and recreate database from backup
REM ========================================

echo.
echo ========================================
echo   RESET DATABASE
echo   WARNING: This will DELETE all data!
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

echo [WARNING] This will DELETE all existing data in the database!
echo.
set /p confirm="Are you sure you want to continue? (yes/no): "

if /i not "%confirm%"=="yes" (
    echo.
    echo [INFO] Operation cancelled.
    pause
    exit /b 0
)

echo.
echo [INFO] Step 1/3: Dropping existing database...
docker exec -i sinotruk-db-local psql -U postgres -c "DROP DATABASE IF EXISTS sinotruk;"

if %errorlevel% neq 0 (
    echo [ERROR] Failed to drop database!
    pause
    exit /b 1
)

echo [SUCCESS] Database dropped.
echo.
echo [INFO] Step 2/3: Creating new database...
docker exec -i sinotruk-db-local psql -U postgres -c "CREATE DATABASE sinotruk;"

if %errorlevel% neq 0 (
    echo [ERROR] Failed to create database!
    pause
    exit /b 1
)

echo [SUCCESS] Database created.
echo.
echo [INFO] Step 3/3: Restoring from backup (with brand column)...
docker exec -i sinotruk-db-local psql -U postgres -d sinotruk < deploy\sinotruk_full_backup.sql

if %errorlevel% neq 0 (
    echo [ERROR] Failed to restore backup!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   DATABASE RESET COMPLETED!
echo ========================================
echo.
echo Database has been recreated with updated schema (includes brand column).
echo.
echo Next steps:
echo 1. Restart API server if running (Ctrl+C and 'npm run dev')
echo 2. Restart Admin UI if running (Ctrl+C and 'npm run dev')
echo 3. Login again to Admin UI
echo.

pause

