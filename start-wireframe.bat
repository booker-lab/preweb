@echo off
cd /d "C:\Develop\preweb\Wireframe"
echo Green Hub Wireframe starting...
start "" /min cmd /c "timeout /t 5 /nobreak > nul && start http://localhost:3000"
pnpm dev
pause
