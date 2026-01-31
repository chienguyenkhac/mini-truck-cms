@echo off
chcp 65001 >nul
echo ========================================
echo   KHỞI ĐỘNG CÁC SERVICES
echo ========================================
echo.

REM Kiểm tra Database đã chạy chưa
docker ps | findstr sinotruk-db-local >nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Database chưa được khởi động!
    echo Đang khởi động Database...
    docker-compose -f docker-compose.local.yml up -d
    echo Đợi Database khởi động...
    timeout /t 30 /nobreak >nul
)

echo [INFO] Mở 3 terminal windows để chạy các service...
echo.

REM Mở terminal cho API Server
start "SINOTRUK API Server" cmd /k "cd /d %~dp0deploy\server && echo [API SERVER - Port 3001] && npm run dev"

REM Đợi 2 giây trước khi mở terminal tiếp theo
timeout /t 2 /nobreak >nul

REM Mở terminal cho Frontend
start "SINOTRUK Frontend" cmd /k "cd /d %~dp0 && echo [FRONTEND - Port 5173] && npm run dev"

REM Đợi 2 giây trước khi mở terminal tiếp theo
timeout /t 2 /nobreak >nul

REM Mở terminal cho Admin UI
start "SINOTRUK Admin UI" cmd /k "cd /d %~dp0admin_ui && echo [ADMIN UI - Port 5174] && npm run dev"

echo.
echo ========================================
echo   ĐÃ MỞ CÁC TERMINAL SERVICES!
echo ========================================
echo.
echo API Server:  http://localhost:3001
echo Frontend:    http://localhost:5173
echo Admin UI:    http://localhost:5174/secret
echo.
echo Để dừng tất cả service, đóng các terminal window đó.
echo Để dừng Database: docker-compose -f docker-compose.local.yml down
echo.

