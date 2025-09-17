# Script para Iniciar MongoDB Local - BikeFix
# Execute este script antes de iniciar a aplicação

Write-Host "🚀 Iniciando MongoDB Local para BikeFix" -ForegroundColor Green
Write-Host "" 

# Verificar se MongoDB está instalado
$mongoPath = "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe"
if (!(Test-Path $mongoPath)) {
    Write-Host "❌ MongoDB não encontrado em: $mongoPath" -ForegroundColor Red
    Write-Host "💡 Certifique-se de que o MongoDB está instalado" -ForegroundColor Yellow
    exit 1
}

# Verificar se os diretórios existem
$dataDir = "c:\BikeFix\mongodb-data"
$logDir = "c:\BikeFix\mongodb-logs"

if (!(Test-Path $dataDir)) {
    Write-Host "📁 Criando diretório de dados: $dataDir" -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $dataDir -Force | Out-Null
}

if (!(Test-Path $logDir)) {
    Write-Host "📁 Criando diretório de logs: $logDir" -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

# Verificar se MongoDB já está rodando
$mongoProcess = Get-Process -Name "mongod" -ErrorAction SilentlyContinue
if ($mongoProcess) {
    Write-Host "✅ MongoDB já está rodando (PID: $($mongoProcess.Id))" -ForegroundColor Green
    Write-Host "📊 Porta: 27017" -ForegroundColor Cyan
    Write-Host "📁 Dados: $dataDir" -ForegroundColor Cyan
    Write-Host "📝 Logs: $logDir\mongod.log" -ForegroundColor Cyan
} else {
    Write-Host "🔄 Iniciando MongoDB..." -ForegroundColor Yellow
    
    # Iniciar MongoDB em background
    Write-Host "💻 Executando MongoDB com os parâmetros configurados" -ForegroundColor Gray
    
    # Iniciar MongoDB em background
    Start-Process -FilePath $mongoPath -ArgumentList "--dbpath", $dataDir, "--logpath", "$logDir\mongod.log", "--port", "27017" -WindowStyle Hidden
    
    # Aguardar inicialização
    Write-Host "⏳ Aguardando MongoDB inicializar..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
    
    # Verificar se iniciou
    $mongoProcess = Get-Process -Name "mongod" -ErrorAction SilentlyContinue
    if ($mongoProcess) {
        Write-Host "✅ MongoDB iniciado com sucesso!" -ForegroundColor Green
        Write-Host "📊 PID: $($mongoProcess.Id)" -ForegroundColor Cyan
        Write-Host "📊 Porta: 27017" -ForegroundColor Cyan
        Write-Host "📁 Dados: $dataDir" -ForegroundColor Cyan
        Write-Host "📝 Logs: $logDir\mongod.log" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Falha ao iniciar MongoDB" -ForegroundColor Red
        Write-Host "💡 Verifique os logs em: $logDir\mongod.log" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "" 
Write-Host "🎉 MongoDB configurado e rodando!" -ForegroundColor Green
Write-Host "" 
Write-Host "📋 Próximos passos:" -ForegroundColor White
Write-Host "   1. Execute: .\start-local-dev.ps1" -ForegroundColor Cyan
Write-Host "   2. Ou inicie manualmente:" -ForegroundColor Cyan
Write-Host "      - Backend: cd BikeFixBackEnd && npm run dev" -ForegroundColor Gray
Write-Host "      - Frontend: cd BikeFixFrontEnd && npm start" -ForegroundColor Gray
Write-Host "" 
Write-Host "🔗 URLs da aplicação:" -ForegroundColor White
Write-Host "   - Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "   - Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host "   - MongoDB: mongodb://localhost:27017/bikefix" -ForegroundColor Cyan
Write-Host "" 
Write-Host "Para parar o MongoDB: Get-Process mongod | Stop-Process" -ForegroundColor Yellow