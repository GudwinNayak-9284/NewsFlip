@echo off
echo Stopping any running Metro bundler...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo Clearing Metro cache...
rd /s /q node_modules\.cache 2>nul
rd /s /q .expo 2>nul

echo Starting Expo with cleared cache...
npx expo start -c
