# Script para Iniciar Desenvolvimento Local - BikeFix
# Execute este script para iniciar backend e frontend simultaneamente

Write-Host "Iniciando BikeFix - Desenvolvimento Local" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

# Verificar se Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "Node.js detectado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js nao encontrado. Instale Node.js primeiro." -ForegroundColor Red
    exit 1
}

# Função para iniciar o backend
function Start-Backend {
    Write-Host "Iniciando Backend..." -ForegroundColor Yellow
    Set-Location "BikeFixBackEnd"
    
    # Copiar configurações locais
    if (Test-Path ".env.local") {
        Copy-Item ".env.local" ".env" -Force
        Write-Host "Configuracoes locais aplicadas" -ForegroundColor Green
    }
    
    # Instalar dependências se necessário
    if (!(Test-Path "node_modules")) {
        Write-Host "Instalando dependencias do backend..." -ForegroundColor Yellow
        npm install
    }
    
    # Iniciar servidor
    Write-Host "Iniciando servidor backend na porta 5000..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev"
    
    Set-Location ".."
}

# Função para iniciar o frontend
function Start-Frontend {
    Write-Host "Iniciando Frontend..." -ForegroundColor Yellow
    Set-Location "BikeFixFrontEnd"
    
    # Instalar dependências se necessário
    if (!(Test-Path "node_modules")) {
        Write-Host "Instalando dependencias do frontend..." -ForegroundColor Yellow
        npm install
    }
    
    # Aguardar um pouco para o backend iniciar
    Start-Sleep -Seconds 3
    
    # Iniciar servidor
    Write-Host "Iniciando servidor frontend na porta 3000..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm start"
    
    Set-Location ".."
}

# Iniciar serviços
Start-Backend
Start-Frontend

Write-Host "" 
Write-Host "Servicos iniciados com sucesso!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host "" 
Write-Host "Dica: Aguarde alguns segundos para os servicos iniciarem completamente" -ForegroundColor Yellow
Write-Host "Para parar os servicos, feche as janelas do terminal que abriram" -ForegroundColor Yellow

# Aguardar e abrir o navegador
Start-Sleep -Seconds 5
Write-Host "Abrindo aplicacao no navegador..." -ForegroundColor Green
Start-Process "http://localhost:3000"