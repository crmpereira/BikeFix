# 🚀 Instruções Específicas para Deploy no Render

## Passo a Passo Completo

### 1. Preparação Prévia (✅ Concluído)
- [x] Código commitado no GitHub
- [x] Arquivo `render.yaml` configurado
- [x] Documentação de deploy criada
- [x] Variáveis de ambiente mapeadas

### 2. Configurar MongoDB Atlas

#### 2.1 Criar Cluster
1. Acesse [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Crie uma conta gratuita
3. Crie um novo cluster (M0 Sandbox - Gratuito)
4. Escolha uma região próxima (ex: AWS - N. Virginia)

#### 2.2 Configurar Acesso
1. **Database Access**: Crie um usuário
   - Username: `bikefix-user`
   - Password: Gere uma senha forte
   - Database User Privileges: `Read and write to any database`

2. **Network Access**: Configure IP
   - Add IP Address: `0.0.0.0/0` (Allow access from anywhere)
   - Ou adicione IPs específicos do Render se preferir

#### 2.3 Obter String de Conexão
1. Clique em "Connect" no seu cluster
2. Escolha "Connect your application"
3. Copie a string de conexão:
   ```
   mongodb+srv://bikefix-user:<password>@cluster0.xxxxx.mongodb.net/bikefix?retryWrites=true&w=majority
   ```
4. Substitua `<password>` pela senha real
5. Substitua `bikefix` pelo nome do banco desejado

### 3. Configurar Google Maps API

#### 3.1 Criar Projeto no Google Cloud
1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto: "BikeFix"
3. Habilite billing (recebe $300 de crédito gratuito)

#### 3.2 Habilitar APIs
1. Vá para "APIs & Services" > "Library"
2. Habilite estas APIs:
   - Maps JavaScript API
   - Geocoding API
   - Places API

#### 3.3 Criar Chave API
1. Vá para "APIs & Services" > "Credentials"
2. Clique "Create Credentials" > "API Key"
3. Copie a chave gerada
4. Clique em "Restrict Key" e configure:
   - Application restrictions: HTTP referrers
   - Website restrictions: Adicione seus domínios:
     - `http://localhost:3000/*`
     - `https://seu-app.onrender.com/*`
     - `https://seu-app.vercel.app/*`

### 4. Deploy no Render

#### 4.1 Criar Conta e Conectar GitHub
1. Acesse [render.com](https://render.com)
2. Crie conta com GitHub
3. Conecte o repositório `BikeFix`

#### 4.2 Deploy do Backend
1. No dashboard do Render, clique "New +" > "Web Service"
2. Conecte o repositório `BikeFix`
3. Configure:
   - **Name**: `bikefix-backend`
   - **Region**: Oregon (US West)
   - **Branch**: `main`
   - **Root Directory**: `BikeFixBackEnd`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

4. **Environment Variables** (muito importante!):
   ```env
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=mongodb+srv://bikefix-user:SUA_SENHA@cluster0.xxxxx.mongodb.net/bikefix?retryWrites=true&w=majority
   JWT_SECRET=uma_chave_secreta_muito_forte_aqui_com_pelo_menos_32_caracteres
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=https://bikefix-frontend.onrender.com
   ```

5. Clique "Create Web Service"
6. Aguarde o deploy (5-10 minutos)
7. Anote a URL: `https://bikefix-backend.onrender.com`

#### 4.3 Deploy do Frontend
1. Clique "New +" > "Static Site"
2. Conecte o mesmo repositório
3. Configure:
   - **Name**: `bikefix-frontend`
   - **Branch**: `main`
   - **Root Directory**: `BikeFixFrontEnd`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`

4. **Environment Variables**:
   ```env
   REACT_APP_API_URL=https://bikefix-backend.onrender.com/api
   REACT_APP_GOOGLE_MAPS_API_KEY=sua_chave_google_maps_aqui
   ```

5. Clique "Create Static Site"
6. Aguarde o deploy (3-5 minutos)
7. Anote a URL: `https://bikefix-frontend.onrender.com`

#### 4.4 Atualizar FRONTEND_URL no Backend
1. Vá para o serviço do backend no Render
2. Clique em "Environment"
3. Edite `FRONTEND_URL` para: `https://bikefix-frontend.onrender.com`
4. Clique "Save Changes"
5. O backend será redployado automaticamente

### 5. Verificação e Testes

#### 5.1 Testar Backend
1. Acesse: `https://bikefix-backend.onrender.com/api/health`
2. Deve retornar: `{"status": "OK", "message": "Server is running"}`
3. Acesse: `https://bikefix-backend.onrender.com/api-docs`
4. Deve mostrar a documentação Swagger

#### 5.2 Testar Frontend
1. Acesse: `https://bikefix-frontend.onrender.com`
2. Deve carregar a página inicial
3. Teste o cadastro de usuário
4. Teste o login
5. Verifique se o Google Maps carrega

#### 5.3 Testar Integração
1. Faça login como ciclista
2. Teste a busca de oficinas
3. Teste o agendamento
4. Faça login como oficina
5. Verifique o painel da oficina

### 6. Configurações Adicionais

#### 6.1 Domínio Personalizado (Opcional)
1. No Render, vá para "Settings" > "Custom Domains"
2. Adicione seu domínio
3. Configure DNS conforme instruções
4. Atualize as variáveis de ambiente com o novo domínio

#### 6.2 Monitoramento
- Health Check automático: `/api/health`
- Logs disponíveis no dashboard do Render
- Alertas por email em caso de falha

### 7. Troubleshooting Comum

#### Backend não inicia
- Verifique se `MONGODB_URI` está correto
- Confirme se o IP está liberado no MongoDB Atlas
- Verifique os logs no Render

#### Frontend não carrega
- Verifique se `REACT_APP_API_URL` está correto
- Confirme se o backend está funcionando
- Verifique se não há erros de CORS

#### Google Maps não funciona
- Verifique se a chave API está correta
- Confirme se as APIs estão habilitadas
- Verifique as restrições de domínio

### 8. URLs Finais

Após o deploy completo:
- **Frontend**: https://bikefix-frontend.onrender.com
- **Backend**: https://bikefix-backend.onrender.com
- **API Docs**: https://bikefix-backend.onrender.com/api-docs
- **Health Check**: https://bikefix-backend.onrender.com/api/health

### 9. Credenciais de Teste

Usuários já criados para teste:
- **Ciclista**: `joao.ciclista@test.com` / `123456`
- **Oficina**: `contato@oficinabike.com` / `123456`

---

**🎉 Parabéns! Seu BikeFix está agora na nuvem!**

Lembre-se de:
- Monitorar os logs regularmente
- Fazer backup do banco de dados
- Atualizar as dependências periodicamente
- Configurar SSL/HTTPS (automático no Render)