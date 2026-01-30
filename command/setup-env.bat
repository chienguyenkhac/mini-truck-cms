@echo off
chcp 65001 >nul
echo ========================================
echo   SETUP ENVIRONMENT FILES
echo ========================================
echo.

set ENV_TYPE=%1
if "%ENV_TYPE%"=="" set ENV_TYPE=development

echo Đang setup môi trường: %ENV_TYPE%
echo.

REM Setup API Server .env
echo [1/3] Setup API Server (.env)...
cd deploy\server

if exist .env (
    echo File .env đã tồn tại.
    choice /C YN /M "Bạn có muốn ghi đè không"
    if errorlevel 2 goto skip_api
)

if "%ENV_TYPE%"=="development" (
    copy env.development.template .env >nul
    echo ✅ Đã tạo .env cho DEVELOPMENT
) else if "%ENV_TYPE%"=="production" (
    copy env.production.template .env >nul
    echo ✅ Đã tạo .env cho PRODUCTION
    echo ⚠️  Hãy cập nhật DATABASE_URL và CORS_ORIGIN trong file .env
) else (
    echo ❌ ENV_TYPE không hợp lệ. Dùng: development hoặc production
    goto end
)

:skip_api
cd ..\..

echo.
echo ========================================
echo   HOÀN TẤT!
echo ========================================
echo.
echo File .env đã được tạo tại: deploy\server\.env
echo.
echo Để xem nội dung:
echo   type deploy\server\.env
echo.
echo Để chỉnh sửa:
echo   notepad deploy\server\.env
echo.
echo Các biến môi trường:
echo   - NODE_ENV: Môi trường (development/production)
echo   - PORT: Cổng server (3001)
echo   - DATABASE_URL: Kết nối database
echo   - CORS_ORIGIN: Các domain được phép
echo   - UPLOAD_DIR: Thư mục upload
echo   - MAX_FILE_SIZE: Kích thước file tối đa
echo   - LOG_LEVEL: Mức độ log
echo.

:end
pause

