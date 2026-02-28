@echo off
setlocal enabledelayedexpansion

:: Set project root directory
set PROJECT_ROOT=%~dp0
cd /d "%PROJECT_ROOT%"

echo ========================================
echo Starting automated build and deploy process
echo ========================================

:: Create timestamp for zip file
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
set "timestamp=%YYYY%%MM%%DD%_%HH%%Min%%Sec%"

echo Timestamp: %timestamp%
echo.

:: Clean deploy directory
echo [1/6] Cleaning deploy directory...
if exist "deploy\admin" (
    rmdir /s /q "deploy\admin"
    echo - Removed existing deploy\admin directory
)
if exist "deploy\client" (
    rmdir /s /q "deploy\client"
    echo - Removed existing deploy\client directory
)

:: Create deploy directories
mkdir "deploy\admin" 2>nul
mkdir "deploy\client" 2>nul
echo - Created deploy directories
echo.

:: Build admin UI
echo [2/6] Building admin UI...
cd admin_ui
echo - Installing dependencies for admin UI...
call npm install
if !errorlevel! neq 0 (
    echo ERROR: Failed to install admin UI dependencies
    pause
    exit /b 1
)

echo - Building admin UI...
call npm run build
if !errorlevel! neq 0 (
    echo ERROR: Failed to build admin UI
    pause
    exit /b 1
)

cd ..
echo - Admin UI build completed successfully
echo.

:: Copy admin UI dist to deploy/admin
echo [3/6] Copying admin UI files to deploy/admin...
if exist "admin_ui\dist" (
    xcopy "admin_ui\dist\*" "deploy\admin\" /E /I /Y /Q
    echo - Admin UI files copied successfully
) else (
    echo ERROR: admin_ui\dist directory not found
    pause
    exit /b 1
)
echo.

:: Build main project (client)
echo [4/6] Building main project (client)...
echo - Installing dependencies for main project...
call npm install
if !errorlevel! neq 0 (
    echo ERROR: Failed to install main project dependencies
    pause
    exit /b 1
)

echo - Building main project...
call npm run build
if !errorlevel! neq 0 (
    echo ERROR: Failed to build main project
    pause
    exit /b 1
)
echo - Main project build completed successfully
echo.

:: Copy main project dist to deploy/client
echo [5/6] Copying main project files to deploy/client...
if exist "dist" (
    xcopy "dist\*" "deploy\client\" /E /I /Y /Q
    echo - Main project files copied successfully
) else (
    echo ERROR: dist directory not found
    pause
    exit /b 1
)
echo.

:: Create zip file
echo [6/6] Creating deployment zip file...
set "zipname=deploy_%timestamp%.zip"

:: Use PowerShell to create zip file (available on Windows 10+)
powershell -command "Compress-Archive -Path 'deploy\*' -DestinationPath '%zipname%' -Force"
if !errorlevel! neq 0 (
    echo ERROR: Failed to create zip file
    pause
    exit /b 1
)

echo - Deployment zip created: %zipname%
echo.

:: Display summary
echo ========================================
echo BUILD AND DEPLOY COMPLETED SUCCESSFULLY
echo ========================================
echo.
echo Summary:
echo - Admin UI built and copied to deploy\admin
echo - Client UI built and copied to deploy\client
echo - Deployment package created: %zipname%
echo.
echo Deploy directory contents:
dir deploy /b
echo.
echo Zip file size:
for %%I in ("%zipname%") do echo - %zipname%: %%~zI bytes
echo.

:: Ask if user wants to open deploy folder
set /p "openFolder=Do you want to open the deploy folder? (y/n): "
if /i "%openFolder%"=="y" (
    explorer deploy
)

echo.
echo Press any key to exit...
pause >nul
