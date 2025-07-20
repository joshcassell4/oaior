@echo off
echo Starting Open AI Outreach Application...
echo.

REM Check if Docker is running
docker version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

echo Building Docker images...
docker-compose build

if %errorlevel% neq 0 (
    echo ERROR: Failed to build Docker images.
    pause
    exit /b 1
)

echo.
echo Starting containers...
docker-compose up -d

if %errorlevel% neq 0 (
    echo ERROR: Failed to start containers.
    pause
    exit /b 1
)

echo.
echo Application started successfully!
echo.
echo Access the application at: http://localhost
echo.
echo To view logs: docker-compose logs -f
echo To stop: docker-compose down
echo.
pause