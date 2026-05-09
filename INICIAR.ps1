# 🔒 Crédito Boltlock - Inicialização (PowerShell)

Write-Host @"
╔════════════════════════════════════════════════════════╗
║  🔒 CRÉDITO BOLTLOCK - INICIALIZAÇÃO                  ║
║  Sistema Unificado de Análise de Crédito              ║
╚════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

# Verificar Node.js
Write-Host "`n🔍 Verificando Node.js..." -ForegroundColor Yellow

$nodeVersion = node --version 2>$null

if ($null -eq $nodeVersion) {
    Write-Host "`n❌ Node.js não encontrado!" -ForegroundColor Red
    Write-Host "`n📥 Baixe em: https://nodejs.org/ (versão 18+)`n" -ForegroundColor Yellow
    Read-Host "Pressione Enter para abrir o navegador"
    Start-Process "https://nodejs.org/"
    exit
}

Write-Host "✅ Node.js $nodeVersion encontrado`n" -ForegroundColor Green

# Ir para pasta backend
$backendPath = "$PSScriptRoot\backend"

if (-not (Test-Path $backendPath)) {
    Write-Host "❌ Pasta 'backend' não encontrada!" -ForegroundColor Red
    exit
}

Set-Location $backendPath

# Instalar dependências
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
    npm install
    Write-Host "✅ Dependências instaladas`n" -ForegroundColor Green
}

# Iniciar backend em nova janela
Write-Host @"
╔════════════════════════════════════════════════════════╗
║  🚀 BACKEND INICIANDO...                              ║
║  Porta: http://localhost:3001                          ║
║  Deixe esta janela aberta                             ║
╚════════════════════════════════════════════════════════╝
"@ -ForegroundColor Green

$backendScript = {
    Set-Location "$PSScriptRoot\backend"
    npm run dev
}

Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendScript

# Aguardar backend iniciar
Write-Host "`n⏳ Aguardando backend iniciar..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Abrir frontend
Write-Host "`n🌐 Abrindo frontend no navegador..." -ForegroundColor Yellow

$frontendPath = "$PSScriptRoot\frontend\index.html"

if (Test-Path $frontendPath) {
    Start-Process $frontendPath
} else {
    Write-Host "⚠️  Frontend não encontrado em: $frontendPath" -ForegroundColor Yellow
    Write-Host "`n💡 Acesse manualmente: file:///$($frontendPath -replace '\\', '/')" -ForegroundColor Yellow
}

# Exibir informações de acesso
Write-Host @"

╔════════════════════════════════════════════════════════╗
║  ✅ SISTEMA INICIADO COM SUCESSO!                    ║
╚════════════════════════════════════════════════════════╝

📱 Frontend: file:///$frontendPath
📡 Backend: http://localhost:3001
🔌 API Health: http://localhost:3001/api/health

🧪 CREDENCIAIS DE TESTE:

   Admin (10.000 créditos):
   ├─ Email: admin@boltlock.com
   └─ Senha: Admin@123

   Correspondente (500 créditos):
   ├─ Email: correspondent1@boltlock.com
   └─ Senha: Corresp@123

💡 Dicas:

   1. Se a página não abrir, copie e cole na barra de endereço
   2. Deixe a janela do Backend aberta
   3. Abra as ferramentas de dev (F12) para debug
   4. Para integrar APIs reais, edite backend/.env

📚 Documentação:
   - README.md (instruções completas)
   - LEIA-ME-PRIMEIRO.txt (guia rápido)
   - integracao-apis.md (integração com Serpro, Infosimples, etc)

🔐 Segurança:
   - NÃO use em produção sem melhorias
   - Veja backend/integracao-apis.md para security checklist

"@ -ForegroundColor Green

Write-Host "`nPressione Ctrl+C para encerrar`n" -ForegroundColor Yellow

Read-Host "Enter para fechar"
