# Configuração do Google OAuth no Render

## ⚠️ ERRO COMUM DE DEPLOY

Se você receber o erro:
```
TypeError: OAuth2Strategy requires a clientID option
```

Isso significa que as **variáveis de ambiente do Google OAuth não estão configuradas** no Render.

## Variáveis de Ambiente Obrigatórias

### Backend (bikefix-backend)

Configure as seguintes variáveis no painel do Render **ANTES** do deploy:

1. **GOOGLE_CLIENT_ID** ⚠️ **OBRIGATÓRIO**
   - Valor: Seu Client ID do Google OAuth Console
   - Obtenha em: https://console.cloud.google.com/apis/credentials

2. **GOOGLE_CLIENT_SECRET** ⚠️ **OBRIGATÓRIO**
   - Valor: Seu Client Secret do Google OAuth Console
   - Obtenha em: https://console.cloud.google.com/apis/credentials

3. **GOOGLE_CALLBACK_URL**
   - Valor: `https://bikefix-backend.onrender.com/api/auth/google/callback`
   - Esta é a URL que o Google redirecionará após a autenticação

4. **FRONTEND_URL**
   - Valor: `https://bikefix-frontend.onrender.com`
   - URL do frontend para redirecionamentos

### Frontend (bikefix-frontend)

As configurações do frontend já estão no arquivo `.env.production`:

- **REACT_APP_GOOGLE_CALLBACK_URL**: `https://bikefix-frontend.onrender.com/auth/callback`

## Configuração no Google OAuth Console

1. Acesse: https://console.cloud.google.com/apis/credentials
2. Selecione seu projeto ou crie um novo
3. Vá em "Credenciais" > "Criar credenciais" > "ID do cliente OAuth 2.0"
4. Configure:
   - **Tipo de aplicativo**: Aplicativo da Web
   - **Origens JavaScript autorizadas**:
     - `https://bikefix-frontend.onrender.com`
   - **URIs de redirecionamento autorizados**:
     - `https://bikefix-backend.onrender.com/api/auth/google/callback`

## Fluxo de Autenticação

1. Usuário clica em "Login com Google" no frontend
2. Frontend redireciona para: `https://bikefix-backend.onrender.com/api/auth/google`
3. Backend redireciona para o Google OAuth
4. Google autentica e redireciona para: `https://bikefix-backend.onrender.com/api/auth/google/callback`
5. Backend processa a autenticação e redireciona para: `https://bikefix-frontend.onrender.com/auth/callback?data=<dados_codificados>`
6. Frontend processa os dados e faz login do usuário

## Verificação

Após configurar todas as variáveis:

1. Faça deploy no Render
2. Teste o login com Google na aplicação em produção
3. Verifique os logs do backend para possíveis erros
4. Confirme que o redirecionamento funciona corretamente