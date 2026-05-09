@echo off
chcp 65001 >nul
cls

echo ╔════════════════════════════════════════════╗
echo ║   🔒 CRÉDITO BOLTLOCK - INICIALIZAR       ║
echo ║   Sistema Unificado de Crédito             ║
echo ╚════════════════════════════════════════════╝
echo.

REM Verificar se Node.js está instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js não encontrado!
    echo.
    echo Baixe em: https://nodejs.org/ (versão 18+)
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js detectado
echo.

REM Iniciar Backend
echo 📡 Iniciando Backend na porta 3001...
echo.

cd /d "%~dp0backend"

if not exist "node_modules" (
    echo 📦 Instalando dependências...
    call npm install
    echo.
)

echo.
echo ╔════════════════════════════════════════════╗
echo ║  🚀 BACKEND RODANDO EM                     ║
echo ║  http://localhost:3001                     ║
echo ╚════════════════════════════════════════════╝
echo.
echo Deixe esta janela aberta...
echo.

start cmd /k npm run dev

timeout /t 2

REM Abrir Frontend
echo.
echo 🌐 Abrindo Frontend...
echo.

cd /d "%~dp0frontend"

start "" "index.html"

echo.
echo ╔════════════════════════════════════════════╗
echo ║  ✅ SISTEMA INICIADO COM SUCESSO           ║
echo ╚════════════════════════════════════════════╝
echo.
echo 📱 Frontend abriu no navegador
echo 📡 Backend rodando em http://localhost:3001
echo.
echo 🧪 Credenciais de teste:
echo    Email: admin@boltlock.com
echo    Senha: Admin@123
echo.
echo 💡 Se a página não abrir, visite:
echo    file:///C:/Users/{seu_usuario}/Desktop/Credito-Boltlock/frontend/index.html
echo.
pause
