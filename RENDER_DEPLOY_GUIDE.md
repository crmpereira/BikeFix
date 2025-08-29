# 🚀 Guia de Deploy no Render.com - BikeFix

Este guia te ajudará a fazer o deploy completo da aplicação BikeFix no Render.com.

## 📋 Pré-requisitos

- [x] Conta no GitHub com o repositório BikeFix
- [x] Conta no Render.com conectada ao GitHub
- [ ] MongoDB Atlas configurado (ou outro MongoDB na nuvem)
- [ ] Chave do Google Maps API

## 🎯 Passo a Passo

### 1️⃣ **Preparar MongoDB Atlas** (se ainda não tiver)

1. Acesse [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Crie uma conta gratuita
3. Crie um cluster gratuito
4. Configure um usuário de banco de dados
5. Adicione seu IP à whitelist (ou 0.0.0.0/0 para acesso total)
6. Copie a string de conexão (será algo como: `mongodb+srv://usuario:senha@cluster.mongodb.net/bikefix`)

### 2️⃣ **Gerar JWT Secret**

Execute este comando no terminal para gerar uma chave segura:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Ou use um gerador online: https://generate-secret.vercel.app/32

### 3️⃣ **Deploy do Backend**

1. **No Render Dashboard:**
   - Clique em "New +" → "Web Service"
   - Conecte seu repositório GitHub `BikeFix`
   - Configure:
     - **Name**: `bikefix-backend`
     - **Root Directory**: `BikeFixBackEnd`
     - **Environment**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Plan**: `Free`

2. **Configurar Variáveis de Ambiente:**
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=sua_string_de_conexao_mongodb_atlas
   JWT_SECRET=sua_chave_jwt_gerada
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=https://bikefix-frontend.onrender.com
   ```

3. **Deploy**: Clique em "Create Web Service"

### 4️⃣ **Deploy do Frontend**

1. **No Render Dashboard:**
   - Clique em "New +" → "Static Site"
   - Conecte o mesmo repositório GitHub `BikeFix`
   - Configure:
     - **Name**: `bikefix-frontend`
     - **Root Directory**: `BikeFixFrontEnd`
     - **Build Command**: `npm install && npm run build`
     - **Publish Directory**: `build`

2. **Configurar Variáveis de Ambiente:**
   ```
   REACT_APP_API_URL=https://bikefix-backend.onrender.com/api
   REACT_APP_GOOGLE_MAPS_API_KEY=sua_chave_google_maps
   ```

3. **Deploy**: Clique em "Create Static Site"

### 5️⃣ **Atualizar URLs Cruzadas**

Após ambos os deploys:

1. **No Backend**: Atualize a variável `FRONTEND_URL` com a URL real do frontend
2. **No Frontend**: Verifique se `REACT_APP_API_URL` está com a URL real do backend

### 6️⃣ **Configurar Google Maps** (Opcional)

Se ainda não tiver:
1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um projeto
3. Habilite as APIs: Maps JavaScript API, Geocoding API, Places API
4. Crie uma chave API
5. Configure restrições de domínio para sua URL do Render

## 🔧 Configurações Importantes

### **Variáveis de Ambiente - Backend**
| Variável | Descrição | Exemplo |
|----------|-----------|----------|
| `NODE_ENV` | Ambiente de execução | `production` |
| `PORT` | Porta do servidor | `10000` |
| `MONGODB_URI` | String de conexão MongoDB | `mongodb+srv://...` |
| `JWT_SECRET` | Chave secreta JWT | `abc123...` |
| `JWT_EXPIRES_IN` | Expiração do token | `7d` |
| `FRONTEND_URL` | URL do frontend | `https://bikefix-frontend.onrender.com` |

### **Variáveis de Ambiente - Frontend**
| Variável | Descrição | Exemplo |
|----------|-----------|----------|
| `REACT_APP_API_URL` | URL da API backend | `https://bikefix-backend.onrender.com/api` |
| `REACT_APP_GOOGLE_MAPS_API_KEY` | Chave Google Maps | `AIza...` |

## 🚨 Troubleshooting

### **Backend não inicia**
- Verifique se `MONGODB_URI` está correto
- Verifique se `JWT_SECRET` está definido
- Veja os logs no Render Dashboard

### **Frontend não carrega dados**
- Verifique se `REACT_APP_API_URL` está correto
- Verifique se o backend está rodando
- Verifique CORS no backend

### **Google Maps não funciona**
- Verifique se `REACT_APP_GOOGLE_MAPS_API_KEY` está definido
- Verifique se as APIs estão habilitadas no Google Cloud
- Verifique as restrições de domínio

## 🎉 Verificação Final

Após o deploy, teste:
- [ ] Frontend carrega corretamente
- [ ] Login/cadastro funciona
- [ ] Busca de oficinas funciona
- [ ] Agendamentos funcionam
- [ ] Google Maps carrega (se configurado)

## 📱 URLs Finais

- **Frontend**: `https://bikefix-frontend.onrender.com`
- **Backend**: `https://bikefix-backend.onrender.com`
- **API Docs**: `https://bikefix-backend.onrender.com/api-docs`
- **Health Check**: `https://bikefix-backend.onrender.com/api/health`

---

**🔄 Deploy Automático**: Após a configuração inicial, qualquer push para a branch `main` fará deploy automático!

**💡 Dica**: O plano gratuito do Render pode "dormir" após 15 minutos de inatividade. O primeiro acesso após isso pode demorar ~30 segundos para "acordar".