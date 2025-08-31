# 🗑️ Guia de Limpeza do MongoDB Atlas

Este guia explica como limpar os dados do seu MongoDB Atlas de forma segura.

## 📋 Scripts Disponíveis

### 1. `view-mongodb-data.js` - Visualizar Dados
**Recomendado executar PRIMEIRO** para ver o que existe no banco.

```bash
node view-mongodb-data.js
```

**O que faz:**
- Conecta ao MongoDB Atlas
- Mostra quantos documentos existem em cada coleção
- Exibe exemplos dos dados (sem senhas)
- Não deleta nada - apenas visualiza

### 2. `clear-specific-collections.js` - Limpeza Seletiva
**Recomendado** para limpar apenas coleções específicas.

```bash
# Ver opções disponíveis
node clear-specific-collections.js

# Limpar apenas agendamentos
node clear-specific-collections.js appointments

# Limpar agendamentos e avaliações
node clear-specific-collections.js appointments reviews

# Limpar notificações e serviços
node clear-specific-collections.js notifications services
```

**Coleções disponíveis:**
- `appointments` - Agendamentos
- `reviews` - Avaliações
- `notifications` - Notificações
- `services` - Serviços
- `users` - Usuários

### 3. `clear-mongodb-data.js` - Limpeza Completa
**⚠️ CUIDADO** - Deleta TODOS os dados!

```bash
node clear-mongodb-data.js
```

**O que faz:**
- Deleta TODOS os documentos de TODAS as coleções
- Aguarda 5 segundos antes de executar (tempo para cancelar)
- Mostra relatório final

## 🛡️ Medidas de Segurança

### Antes de Executar:
1. **SEMPRE** execute `view-mongodb-data.js` primeiro
2. Certifique-se de que tem backup dos dados importantes
3. Confirme que está conectando ao banco correto
4. Use limpeza seletiva quando possível

### Durante a Execução:
- Os scripts mostram avisos antes de deletar
- Você tem alguns segundos para cancelar (Ctrl+C)
- Relatórios são exibidos durante o processo

## 📝 Exemplos de Uso Comum

### Cenário 1: Limpar dados de teste
```bash
# 1. Ver o que existe
node view-mongodb-data.js

# 2. Limpar apenas agendamentos de teste
node clear-specific-collections.js appointments
```

### Cenário 2: Reset completo para produção
```bash
# 1. Ver dados atuais
node view-mongodb-data.js

# 2. Limpar tudo (CUIDADO!)
node clear-mongodb-data.js
```

### Cenário 3: Limpar dados de usuários mas manter configurações
```bash
# Limpar dados de usuários mas manter serviços
node clear-specific-collections.js users appointments reviews notifications
```

## ⚙️ Configuração Necessária

### Arquivo .env
Certifique-se de que o arquivo `BikeFixBackEnd/.env` contém:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bikefix
```

### Dependências
Os scripts usam as dependências já instaladas no projeto:
- `mongoose`
- `dotenv`

## 🚨 Avisos Importantes

1. **BACKUP**: Sempre faça backup antes de limpar dados importantes
2. **AMBIENTE**: Confirme que está no ambiente correto (dev/prod)
3. **CONEXÃO**: Verifique se a string de conexão está correta
4. **IRREVERSÍVEL**: A limpeza é permanente - não há como desfazer

## 🔍 Troubleshooting

### Erro: "MONGODB_URI não encontrada"
- Verifique se o arquivo `.env` existe em `BikeFixBackEnd/`
- Confirme se a variável `MONGODB_URI` está definida

### Erro de conexão
- Verifique se a string de conexão está correta
- Confirme se o IP está na whitelist do MongoDB Atlas
- Teste a conexão com o aplicativo principal

### Script não executa
- Certifique-se de estar na pasta raiz do projeto (`C:\BikeFix`)
- Verifique se as dependências estão instaladas: `npm install`

## 📞 Suporte

Se encontrar problemas:
1. Execute `view-mongodb-data.js` para diagnosticar
2. Verifique os logs de erro
3. Confirme a configuração do `.env`
4. Teste a conexão com o aplicativo principal