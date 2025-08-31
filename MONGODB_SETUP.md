# Configuração do MongoDB Atlas

Este projeto requer uma conexão com MongoDB. Para desenvolvimento e produção, recomendamos usar o MongoDB Atlas (gratuito).

## Passo a Passo para Configurar MongoDB Atlas

### 1. Criar Conta no MongoDB Atlas
1. Acesse [https://cloud.mongodb.com](https://cloud.mongodb.com)
2. Clique em "Try Free" ou "Sign Up"
3. Crie sua conta gratuita

### 2. Criar um Cluster Gratuito (M0)
1. Após fazer login, clique em "Build a Database"
2. Selecione "M0 Sandbox" (Free Forever)
3. Escolha um provedor de nuvem (AWS, Google Cloud ou Azure)
4. Selecione uma região próxima ao Brasil
5. Dê um nome ao seu cluster (ex: "BikeFix-Cluster")
6. Clique em "Create Cluster"

### 3. Configurar Acesso ao Banco

#### 3.1 Criar Usuário do Banco
1. No painel do Atlas, vá em "Database Access" (menu lateral)
2. Clique em "Add New Database User"
3. Escolha "Password" como método de autenticação
4. Crie um username (ex: "bikefix-user")
5. Gere uma senha forte (anote-a!)
6. Em "Database User Privileges", selecione "Read and write to any database"
7. Clique em "Add User"

#### 3.2 Configurar IP de Acesso
1. Vá em "Network Access" (menu lateral)
2. Clique em "Add IP Address"
3. Para desenvolvimento, clique em "Allow Access from Anywhere" (0.0.0.0/0)
4. Para produção, adicione apenas os IPs específicos do Render
5. Clique em "Confirm"

### 4. Obter String de Conexão
1. Volte para "Database" (menu lateral)
2. No seu cluster, clique em "Connect"
3. Selecione "Drivers"
4. Escolha "Node.js" e a versão mais recente
5. Copie a string de conexão que aparece

### 5. Configurar no Projeto
1. Abra o arquivo `.env` no backend
2. Substitua a linha `MONGODB_URI` pela string copiada
3. Na string, substitua:
   - `<username>` pelo usuário criado no passo 3.1
   - `<password>` pela senha criada no passo 3.1
   - `<cluster-url>` já estará preenchido automaticamente

Exemplo:
```
MONGODB_URI=mongodb+srv://bikefix-user:suaSenhaAqui@bikefix-cluster.abc123.mongodb.net/bikefix?retryWrites=true&w=majority
```

### 6. Testar Conexão
1. Salve o arquivo `.env`
2. Reinicie o servidor backend
3. Verifique se a conexão foi estabelecida com sucesso

## Configuração para Produção (Render)

No Render, configure a variável de ambiente `MONGODB_URI` com a mesma string de conexão.

## Troubleshooting

### Erro de Autenticação
- Verifique se o username e password estão corretos
- Certifique-se de que o usuário tem permissões adequadas

### Erro de Conexão
- Verifique se o IP está na lista de acesso
- Para desenvolvimento, use "Allow Access from Anywhere"
- Aguarde alguns minutos após criar o cluster

### Caracteres Especiais na Senha
Se sua senha contém caracteres especiais, você precisa codificá-los:
- `@` → `%40`
- `:` → `%3A`
- `/` → `%2F`
- `?` → `%3F`
- `#` → `%23`
- `[` → `%5B`
- `]` → `%5D`

## Limites do Plano Gratuito
- 512 MB de armazenamento
- Máximo 500 conexões simultâneas
- Clusters podem ser pausados após 60 dias de inatividade
- Sem backups automáticos

Para este projeto, o plano gratuito é suficiente para desenvolvimento e testes iniciais.