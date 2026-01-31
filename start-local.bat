@echo off
chcp 65001 >nul
echo ========================================
echo   SINOTRUK HANOI - LOCAL SETUP
echo ========================================
echo.

REM Kiểm tra Docker Desktop đã chạy chưa
docker info >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker Desktop chưa được khởi động!
    echo Vui lòng mở Docker Desktop và chờ nó khởi động xong, sau đó chạy lại script này.
    pause
    exit /b 1
)

echo [1/4] Khởi động Database (PostgreSQL)...
docker-compose -f docker-compose.local.yml up -d

echo.
echo [2/4] Đợi Database khởi động hoàn tất (khoảng 30 giây)...
timeout /t 30 /nobreak >nul

echo.
echo [3/4] Kiểm tra kết nối Database...
docker exec sinotruk-db-local pg_isready -U postgres
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Database chưa sẵn sàng, đợi thêm 15 giây...
    timeout /t 15 /nobreak >nul
)

echo.
echo [3.5/4] Import database schema và dữ liệu...
echo Đang kiểm tra xem database đã có dữ liệu chưa...
docker exec sinotruk-db-local psql -U postgres -d sinotruk -c "SELECT COUNT(*) FROM products;" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Database trống, đang import dữ liệu...
    docker cp deploy\sinotruk_full_backup.sql sinotruk-db-local:/tmp/backup.sql >nul 2>&1
    docker exec sinotruk-db-local psql -U postgres -d sinotruk -f /tmp/backup.sql >nul 2>&1
    docker exec sinotruk-db-local rm /tmp/backup.sql >nul 2>&1
    echo Import hoàn tất!
) else (
    echo Database đã có dữ liệu, bỏ qua import.
)

echo.
echo ========================================
echo   CÀI ĐẶT DEPENDENCIES
echo ========================================
echo.

echo [4/5] Tạo file .env cho Server...
cd deploy\server
if not exist .env (
    echo Tạo file .env từ template...
    copy env.development.template .env >nul
    echo File .env đã được tạo với cấu hình development!
) else (
    echo File .env đã tồn tại, bỏ qua.
)

echo.
echo [5/5] Cài đặt dependencies cho Server...
if not exist node_modules (
    call npm install
)
cd ..\..

echo.
echo Cài đặt dependencies cho Frontend...
if not exist node_modules (
    call npm install
)

echo.
echo Cài đặt dependencies cho Admin UI...
cd admin_ui
if not exist node_modules (
    call npm install
)
cd ..

echo.
echo ========================================
echo   HOÀN TẤT CÀI ĐẶT!
echo ========================================
echo.
echo Database: PostgreSQL đang chạy trên cổng 5433
echo - Host: localhost
echo - Port: 5433
echo - Database: sinotruk
echo - Username: postgres
echo - Password: sinotruk123
echo.
echo Để khởi động các service, mở 3 cửa sổ terminal riêng biệt:
echo.
echo Terminal 1 - API Server:
echo   cd deploy\server
echo   npm run dev
echo   (Chạy tại http://localhost:3001)
echo.
echo Terminal 2 - Frontend:
echo   npm run dev
echo   (Chạy tại http://localhost:5173)
echo.
echo Terminal 3 - Admin UI:
echo   cd admin_ui
echo   npm run dev
echo   (Chạy tại http://localhost:5174/secret)
echo.
echo Hoặc chạy script: start-services.bat
echo.
pause

