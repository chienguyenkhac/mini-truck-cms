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

REM Kiểm tra file init.sql có tồn tại không
if not exist "deploy\server\init.sql" (
    echo [ERROR] File deploy\server\init.sql không tồn tại!
    pause
    exit /b 1
)

echo [INFO] Đang import database schema và dữ liệu...
echo Quá trình này có thể mất 1-2 phút...
echo.

REM Copy file vào container
echo [INFO] Đang copy file vào container...
docker cp deploy\server\init.sql sinotruk-db-local:/tmp/backup.sql
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Không thể copy file vào container!
    pause
    exit /b 1
)

REM Kiểm tra file đã được copy thành công
echo [INFO] Đang kiểm tra file trong container...
docker exec sinotruk-db-local test -f /tmp/backup.sql
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] File không tồn tại trong container sau khi copy!
    pause
    exit /b 1
)

REM Import database
echo [INFO] Đang import database...
docker exec sinotruk-db-local psql -U postgres -d sinotruk -f /tmp/backup.sql
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Import database thất bại!
    docker exec sinotruk-db-local rm -f /tmp/backup.sql
    pause
    exit /b 1
)

REM Xóa file tạm
docker exec sinotruk-db-local rm -f /tmp/backup.sql

echo.
echo ========================================
echo   IMPORT HOÀN TẤT!
echo ========================================
echo.
echo Kiểm tra kết quả:
docker exec sinotruk-db-local psql -U postgres -d sinotruk -c "\dt"
echo.
docker exec sinotruk-db-local psql -U postgres -d sinotruk -c "SELECT COUNT(*) as total_products FROM products;"
echo.
pause

