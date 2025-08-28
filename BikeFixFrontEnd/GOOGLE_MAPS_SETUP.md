# Configuração do Google Maps API

Este guia explica como obter e configurar uma chave válida do Google Maps API para o projeto BikeFix.

## Pré-requisitos

- Conta Google
- Cartão de crédito (necessário para habilitar billing, mas você recebe $300 de crédito gratuito)

## Passo a Passo

### 1. Acesse o Google Cloud Console

1. Vá para [Google Cloud Console](https://console.cloud.google.com/)
2. Faça login com sua conta Google
3. Clique em "Get Started" se for seu primeiro acesso

### 2. Crie um Novo Projeto (se necessário)

1. No topo da página, clique no seletor de projeto
2. Clique em "New Project"
3. Digite um nome para o projeto (ex: "BikeFix-Maps")
4. Clique em "Create"

### 3. Habilite o Billing (Obrigatório)

⚠️ **IMPORTANTE**: O Google Maps API requer billing habilitado, mas você recebe $300 de crédito gratuito que dura 12 meses.

1. No menu lateral, vá em "Billing"
2. Clique em "Link a billing account" ou "Create billing account"
3. Preencha as informações solicitadas:
   - Informações pessoais/empresa
   - Endereço
   - Dados do cartão de crédito
4. Aceite os termos e clique em "Start my free trial"

### 4. Habilite as APIs Necessárias

1. No menu lateral, vá em "APIs & Services" > "Library"
2. Procure e habilite as seguintes APIs:
   - **Maps JavaScript API** (principal)
   - **Geocoding API** (para conversão de endereços)
   - **Places API** (para busca de locais)

### 5. Crie uma Chave API

1. Vá em "APIs & Services" > "Credentials"
2. Clique em "Create Credentials" > "API key"
3. Sua chave será gerada e exibida em um popup
4. **COPIE A CHAVE** - você precisará dela!

### 6. Restrinja a Chave API (Recomendado)

1. Clique em "Restrict Key" no popup ou edite a chave criada
2. Em "Application restrictions":
   - Selecione "HTTP referrers (web sites)"
   - Adicione os domínios:
     - `http://localhost:3000/*` (para desenvolvimento)
     - `https://seu-dominio.com/*` (para produção)
3. Em "API restrictions":
   - Selecione "Restrict key"
   - Marque apenas as APIs que você habilitou:
     - Maps JavaScript API
     - Geocoding API
     - Places API
4. Clique em "Save"

### 7. Configure no Projeto BikeFix

1. Abra o arquivo `.env` na pasta do frontend:
   ```
   c:\BikeFix\BikeFixFrontEnd\.env
   ```

2. Substitua a chave de exemplo pela sua chave real:
   ```
   REACT_APP_GOOGLE_MAPS_API_KEY=SUA_CHAVE_AQUI
   REACT_APP_API_URL=http://localhost:5000/api
   ```

3. Salve o arquivo

4. Reinicie o servidor de desenvolvimento:
   ```bash
   npm start
   ```

## Verificação

Após configurar a chave:

1. Acesse `http://localhost:3000/workshops`
2. O mapa deve carregar normalmente
3. Você deve ver os marcadores das oficinas
4. Não deve haver mensagens de erro relacionadas ao Google Maps

## Limites Gratuitos

- **$300 de crédito gratuito** por 12 meses
- **Maps JavaScript API**: $7 por 1.000 carregamentos de mapa
- **Geocoding API**: $5 por 1.000 solicitações
- **Places API**: $17 por 1.000 solicitações

Para um projeto pequeno/médio, o crédito gratuito é mais que suficiente.

## Solução de Problemas

### Erro: "This API project is not authorized to use this API"
- Verifique se você habilitou a Maps JavaScript API
- Aguarde alguns minutos para a API ser ativada

### Erro: "The provided API key is invalid"
- Verifique se copiou a chave corretamente
- Certifique-se de que não há espaços extras
- Verifique as restrições da chave

### Erro: "This page can't load Google Maps correctly"
- Verifique se o billing está habilitado
- Verifique se você não excedeu os limites
- Verifique as restrições de domínio

### Mapa não carrega
- Verifique sua conexão com a internet
- Abra o console do navegador (F12) para ver erros específicos
- Verifique se a chave está no arquivo `.env` correto

## Fallback Implementado

Caso o Google Maps não esteja disponível, o sistema automaticamente:
- Exibe uma mensagem informativa
- Mostra a lista de oficinas com endereços completos
- Mantém toda a funcionalidade de busca e filtros
- Permite navegar para os detalhes das oficinas

Isso garante que o sistema continue funcionando mesmo sem o mapa.

## Suporte

Se você continuar tendo problemas:
1. Verifique o console do navegador (F12)
2. Consulte a [documentação oficial do Google Maps](https://developers.google.com/maps/documentation)
3. Verifique o [status dos serviços Google](https://status.cloud.google.com/)