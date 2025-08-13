@echo off
echo 🚀 Opening Vision Platform...
echo.

echo 🌐 Opening main platform...
start http://localhost:80

timeout /t 2 /nobreak >nul

echo 🤖 Opening AI service...
start http://localhost:8000/docs

timeout /t 2 /nobreak >nul

echo 📊 Opening monitoring...
start http://localhost:3002

timeout /t 2 /nobreak >nul

echo 🔧 Opening API service...
start http://localhost:3001/

timeout /t 2 /nobreak >nul

echo 🌐 Opening web frontend...
start http://localhost:3000/

timeout /t 2 /nobreak >nul

echo 📊 Opening dashboard...
start http://localhost:3000/dashboard

timeout /t 2 /nobreak >nul

echo 📈 Opening analytics...
start http://localhost:3000/analytics

echo.
echo ✅ All services opened in your browser!
echo 🌐 Main platform: http://localhost:80
echo 💡 Use localhost:80 as your main entry point!
echo 📊 Dashboard: http://localhost:3000/dashboard
echo 📈 Analytics: http://localhost:3000/analytics
echo.
pause
