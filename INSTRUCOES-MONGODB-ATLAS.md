# 🚀 Instruções para Configurar MongoDB Atlas - BikeFix

## ⚠️ AÇÃO NECESSÁRIA

Para completar a configuração do MongoDB Atlas como banco de produção, você precisa:

## 1. 📋 Obter Credenciais do MongoDB Atlas

### Se você JÁ tem uma conta MongoDB Atlas:
1. Acesse [MongoDB Atlas](https://cloud.mongodb.com)
2. Faça login na sua conta
3. Vá no seu cluster `bikefix-production` (ou crie um novo)
4. Clique em "Connect" → "Connect your application"
5. Copie a string de conexão

### Se você NÃO tem uma conta MongoDB Atlas:
1. Siga o guia completo em `MONGODB-ATLAS-SETUP.md`
2. Crie conta, cluster e usuário
3. Obtenha a string de conexão

## 2. 🔧 Configurar Variáveis de Ambiente

### Opção A: Arquivo .env (Desenvolvimento)

Crie/edite o arquivo `BikeFixBackEnd/.env`:

```env
# MongoDB Atlas - Produção
MONGODB_ATLAS_URI=mongodb+srv://bikefix-app:SUA_SENHA@bikefix-production.xxxxx.mongodb.net/bikefix?retryWrites=true&w=majority
MONGODB_URI=mongodb+srv://bikefix-app:SUA_SENHA@bikefix-production.xxxxx.mongodb.net/bikefix?retryWrites=true&w=majority

# MongoDB Local - Teste (opcional)
MONGODB_TEST_URI=mongodb://localhost:27017/bikefix
```

### Opção B: Variáveis de Sistema (Windows)

```powershell
# No PowerShell (como Administrador)
[Environment]::SetEnvironmentVariable("MONGODB_ATLAS_URI", "sua_string_aqui", "User")
[Environment]::SetEnvironmentVariable("MONGODB_URI", "sua_string_aqui", "User")
```

### Opção C: Render.com (Produção)

1. Acesse o dashboard do Render
2. Vá no serviço `bikefix-backend`
3. Em "Environment Variables":
   - `MONGODB_URI`: Sua string do Atlas
   - `MONGODB_ATLAS_URI`: Mesma string do Atlas

## 3. 🧪 Testar Configuração

Após configurar as credenciais:

```powershell
# No diretório BikeFixBackEnd
cd BikeFixBackEnd

# Testar conexão
node scripts/test-mongodb-atlas.js
```

## 4. 📦 Migrar Dados (Se Necessário)

Se você tem dados locais para migrar:

```powershell
# Configurar variáveis primeiro
$env:MONGODB_ATLAS_URI = "sua_string_do_atlas"
$env:MONGODB_TEST_URI = "mongodb://localhost:27017/bikefix"

# Executar migração
node scripts/setup-mongodb-atlas-production.js
```

## 5. ✅ Validar Produção

```powershell
# Executar migração de produção
node scripts/migrate-production.js
```

## 📝 Exemplo de String de Conexão

```
mongodb+srv://bikefix-app:MinhaSenh@123@bikefix-production.abc123.mongodb.net/bikefix?retryWrites=true&w=majority
```

**IMPORTANTE**:
- Substitua `MinhaSenh@123` pela sua senha real
- Substitua `abc123` pelo ID do seu cluster
- Mantenha o nome do banco como `bikefix`

## 🔒 Segurança

- ❌ NUNCA commite credenciais no Git
- ✅ Use variáveis de ambiente
- ✅ Configure IPs permitidos no Atlas
- ✅ Use senhas fortes

## 🆘 Problemas Comuns

### Erro de Conexão
```
connect ECONNREFUSED
```
**Solução**: Verificar se as credenciais estão configuradas

### Erro de Autenticação
```
authentication failed
```
**Solução**: Verificar usuário/senha na string de conexão

### Banco Não Encontrado
```
Database 'bikefix' not found
```
**Solução**: Executar script de migração para criar estrutura

---

## 🎯 Próximos Passos

1. ✅ Configure as credenciais do MongoDB Atlas
2. ✅ Execute o teste: `node scripts/test-mongodb-atlas.js`
3. ✅ Execute a migração: `node scripts/setup-mongodb-atlas-production.js`
4. ✅ Valide a produção: `node scripts/migrate-production.js`
5. ✅ Atualize o Render.com com as credenciais

**Status Atual**: ⏳ Aguardando configuração das credenciais do MongoDB Atlas