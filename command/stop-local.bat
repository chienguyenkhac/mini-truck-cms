@echo off
chcp 65001 >nul
echo ========================================
echo   DỪNG TẤT CẢ SERVICES
echo ========================================
echo.

echo [INFO] Dừng Database container...
docker-compose -f docker-compose.local.yml down

echo.
echo [INFO] Database đã được dừng.
echo.
echo Lưu ý: Dữ liệu vẫn được lưu trong Docker volume 'postgres_data_local'
echo Để xóa hoàn toàn database (bao gồm dữ liệu):
echo   docker-compose -f docker-compose.local.yml down -v
echo.
pause

