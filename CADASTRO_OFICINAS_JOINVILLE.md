# 🏪 Cadastro de Oficinas em Joinville - MongoDB Atlas

## 📋 Resumo
Este documento contém instruções para cadastrar duas novas oficinas em Joinville, SC, diretamente no MongoDB Atlas.

## 🏢 Oficinas a Cadastrar

### 1️⃣ Bike Center Joinville
- **Nome**: Carlos Silva
- **Email**: carlos@bikejoinville1.com.br
- **Telefone**: (47) 3422-1234
- **CEP**: 89202-330
- **Endereço**: Rua das Palmeiras, 150 - América
- **Especialidades**: Mountain Bike, Bike Urbana, Speed
- **Avaliação**: 4.7 ⭐ (89 avaliações)

### 2️⃣ Oficina Bike Express Joinville
- **Nome**: Ana Costa
- **Email**: ana@bikejoinville2.com.br
- **Telefone**: (47) 3455-6789
- **CEP**: 89205-652
- **Endereço**: Avenida Santos Dumont, 890 - Zona Industrial Norte
- **Especialidades**: Bike Elétrica, Speed, Mountain Bike
- **Avaliação**: 4.9 ⭐ (156 avaliações)

## 🚀 Métodos de Cadastro

### Método 1: MongoDB Compass (Recomendado)

1. **Abrir MongoDB Compass**
   - Conectar ao cluster `bikefix-production`
   - Navegar para database `bikefix`
   - Selecionar collection `users`

2. **Importar Dados**
   - Clique em "ADD DATA" → "Import JSON or CSV file"
   - Selecione o arquivo `joinville-workshops.json`
   - Clique em "Import"

3. **Verificar Importação**
   - Filtrar por: `{"workshopData.address.city": "Joinville"}`
   - Deve mostrar 2 documentos

### Método 2: MongoDB Atlas Data Explorer

1. **Acessar Atlas Dashboard**
   - Login em [cloud.mongodb.com](https://cloud.mongodb.com)
   - Selecionar projeto `bikefix-app`
   - Clicar em "Browse Collections"

2. **Navegar para Collection**
   - Database: `bikefix`
   - Collection: `users`

3. **Inserir Documentos**
   - Clique em "INSERT DOCUMENT"
   - Cole o conteúdo do primeiro objeto do arquivo `joinville-workshops.json`
   - Repita para o segundo objeto

### Método 3: MongoDB Shell

```javascript
// Conectar ao cluster
mongo "mongodb+srv://bikefix-production.mongodb.net/bikefix" --username bikefix-app

// Usar database
use bikefix

// Inserir oficinas (cole o conteúdo do arquivo joinville-workshops-mongodb-script.js)
db.users.insertMany(joinvilleWorkshops);

// Verificar inserção
db.users.find({"workshopData.address.city": "Joinville"}).pretty();
```

## 📁 Arquivos Disponíveis

- `joinville-workshops.json` - Dados em formato JSON para importação
- `joinville-workshops-mongodb-script.js` - Script JavaScript para MongoDB Shell
- `BikeFixBackEnd/scripts/addJoinvilleWorkshops.js` - Script Node.js (requer conexão)

## ✅ Verificação do Cadastro

Após o cadastro, verifique se as oficinas aparecem:

1. **No Frontend**
   - Acesse: http://localhost:3000/workshops
   - Busque por "Joinville" ou CEPs "89202-330" e "89205-652"

2. **Na API**
   ```bash
   curl "https://bikefix-backend.onrender.com/api/workshops?city=Joinville"
   ```

3. **No MongoDB**
   ```javascript
   db.users.countDocuments({"workshopData.address.city": "Joinville"})
   // Deve retornar: 2
   ```

## 🔐 Credenciais de Login

### Bike Center Joinville
- **Email**: carlos@bikejoinville1.com.br
- **Senha**: BikeCenter2024!

### Oficina Bike Express Joinville
- **Email**: ana@bikejoinville2.com.br
- **Senha**: BikeExpress2024!

## 🛠️ Serviços Cadastrados

### Bike Center Joinville
- Manutenção Preventiva (R$ 85)
- Reparo de Freios (R$ 60)
- Troca de Pneus (R$ 50)
- Ajuste de Câmbio (R$ 40)
- Revisão Completa (R$ 120)
- Montagem de Bikes (R$ 100)

### Oficina Bike Express Joinville
- Manutenção de Bikes Elétricas (R$ 150)
- Reparo de Suspensão (R$ 120)
- Troca de Correntes (R$ 80)
- Ajuste de Freios a Disco (R$ 90)
- Limpeza e Lubrificação (R$ 70)
- Diagnóstico Eletrônico (R$ 100)

## 📍 Coordenadas GPS

- **Bike Center**: -26.3044, -48.8487
- **Bike Express**: -26.2775, -48.8589

## ⚠️ Observações Importantes

1. As senhas já estão criptografadas com bcrypt
2. As oficinas estão marcadas como verificadas (`isVerified: true`)
3. As oficinas estão ativas (`isActive: true`)
4. As oficinas estão aprovadas (`isApproved: true`)
5. Coordenadas GPS são aproximadas para Joinville, SC

## 🎯 Próximos Passos

Após o cadastro:
1. Testar login das oficinas no frontend
2. Verificar se aparecem na busca por localização
3. Testar agendamento de serviços
4. Confirmar integração com mapa

---

**Status**: ✅ Dados preparados e prontos para inserção
**Data**: Janeiro 2024
**Responsável**: Sistema BikeFix