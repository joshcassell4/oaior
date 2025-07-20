@echo off
echo Checking Docker status...
echo.

docker version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not running or not installed.
    echo.
    echo Please ensure Docker Desktop is installed and running:
    echo 1. Download Docker Desktop from https://www.docker.com/products/docker-desktop/
    echo 2. Install and start Docker Desktop
    echo 3. Wait for Docker to fully start (system tray icon shows "Docker Desktop is running")
    echo 4. Run this script again
    exit /b 1
) else (
    echo Docker is running successfully!
    echo.
    docker version
)