@echo off
chcp 65001 >nul
echo ========================================
echo   IMPORT DATABASE
echo ========================================
echo.

REM Kiểm tra Docker Desktop đã chạy chưa
docker info >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker Desktop chưa được khởi động!
    pause
    exit /b 1
)

REM Kiểm tra database container đã chạy chưa
docker ps | findstr sinotruk-db-local >nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Database container chưa chạy!
    echo Vui lòng chạy: docker-compose -f docker-compose.local.yml up -d
    pause
    exit /b 1
)

echo [INFO] Đang import database schema và dữ liệu...
echo Quá trình này có thể mất 1-2 phút...
echo.

docker cp deploy\server\init.sql sinotruk-db-local:/tmp/backup.sql
docker exec sinotruk-db-local psql -U postgres -d sinotruk -f /tmp/backup.sql
docker exec sinotruk-db-local rm /tmp/backup.sql

echo.
echo ========================================
echo   IMPORT HOÀN TẤT!
echo ========================================
echo.
echo Kiểm tra kết quả:
docker exec sinotruk-db-local psql -U postgres -d sinotruk -c "\dt public.*"
echo.
docker exec sinotruk-db-local psql -U postgres -d sinotruk -c "SELECT COUNT(*) as total_products FROM products;"
echo.
pause

