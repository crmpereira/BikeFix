# 🚀 Guia de Deploy - BikeFix

## Pré-requisitos para Deploy

### 1. MongoDB Atlas
- Crie uma conta no [MongoDB Atlas](https://www.mongodb.com/atlas)
- Crie um cluster gratuito
- Configure o acesso de rede (0.0.0.0/0 para acesso público)
- Obtenha a string de conexão

### 2. Google Maps API
- Acesse o [Google Cloud Console](https://console.cloud.google.com/)
- Crie um projeto e habilite billing (recebe $300 grátis)
- Habilite as APIs: Maps JavaScript API, Geocoding API, Places API
- Crie uma chave API em "Credentials"
- Configure restrições para seu domínio

### 3. GitHub Repository
- Faça fork ou clone este repositório
- Configure as secrets do GitHub Actions (se usar)

## Deploy no Render.com

### Passo 1: Preparar o Repositório
```bash
# Clone o repositório
git clone https://github.com/seu-usuario/bikefix.git
cd bikefix

# Instale as dependências
npm run install:all

# Teste localmente
npm run dev:backend  # Terminal 1
npm run dev:frontend # Terminal 2
```

### Passo 2: Configurar no Render
1. Acesse [render.com](https://render.com) e faça login
2. Conecte seu repositório GitHub
3. O arquivo `render.yaml` já está configurado
4. Configure as variáveis de ambiente:

#### Backend (bikefix-backend):
```env
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/bikefix
JWT_SECRET=sua_chave_secreta_muito_forte_aqui
FRONTEND_URL=https://bikefix-frontend.onrender.com
```

#### Frontend (bikefix-frontend):
```env
REACT_APP_API_URL=https://bikefix-backend.onrender.com/api
REACT_APP_GOOGLE_MAPS_API_KEY=sua_chave_google_maps_aqui
```

### Passo 3: Deploy Automático
- O deploy acontece automaticamente a cada push na branch `main`
- Backend: https://bikefix-backend.onrender.com
- Frontend: https://bikefix-frontend.onrender.com

## Deploy no Vercel (Frontend) + Render (Backend)

### Backend no Render
1. Crie um novo Web Service
2. Conecte o repositório
3. Configure:
   - Build Command: `cd BikeFixBackEnd && npm install`
   - Start Command: `cd BikeFixBackEnd && npm start`
   - Root Directory: `BikeFixBackEnd`

### Frontend no Vercel
1. Instale a CLI do Vercel: `npm i -g vercel`
2. Na pasta do frontend:
```bash
cd BikeFixFrontEnd
vercel
```
3. Configure as variáveis de ambiente no dashboard do Vercel

## Variáveis de Ambiente Obrigatórias

### Backend (.env)
```env
# Database
MONGODB_URI=mongodb+srv://...

# JWT
JWT_SECRET=chave_secreta_forte
JWT_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://seu-frontend.vercel.app

# Email (opcional)
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua-senha-app
```

### Frontend (.env)
```env
# API
REACT_APP_API_URL=https://seu-backend.onrender.com/api

# Google Maps
REACT_APP_GOOGLE_MAPS_API_KEY=sua_chave_aqui
```

## Checklist de Deploy

- [ ] MongoDB Atlas configurado
- [ ] Google Maps API configurada
- [ ] Repositório GitHub atualizado
- [ ] Variáveis de ambiente configuradas
- [ ] Backend deployado e funcionando
- [ ] Frontend deployado e funcionando
- [ ] CORS configurado corretamente
- [ ] Teste de login funcionando
- [ ] Teste de cadastro funcionando
- [ ] Teste de busca de oficinas funcionando

## Troubleshooting

### Erro de CORS
- Verifique se `FRONTEND_URL` está configurado no backend
- Confirme se a URL do frontend está correta

### Erro de Conexão com MongoDB
- Verifique a string de conexão `MONGODB_URI`
- Confirme se o IP está liberado no MongoDB Atlas

### Google Maps não carrega
- Verifique se a chave API está correta
- Confirme se as APIs necessárias estão habilitadas
- Verifique as restrições de domínio

### Build falha
- Verifique se todas as dependências estão no package.json
- Confirme se não há erros de sintaxe
- Verifique os logs de build no Render/Vercel

## Monitoramento

- Health Check: `https://seu-backend.onrender.com/api/health`
- API Docs: `https://seu-backend.onrender.com/api-docs`
- Logs: Disponíveis no dashboard do Render/Vercel