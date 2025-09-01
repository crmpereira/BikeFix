const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

// Configuração do MongoDB local
const MONGODB_URI = 'mongodb://localhost:27017/bikefix';

async function addJoinvilleWorkshops() {
    const client = new MongoClient(MONGODB_URI);
    
    try {
        console.log('🔌 Conectando ao MongoDB local...');
        await client.connect();
        
        const db = client.db('bikefix');
        const usersCollection = db.collection('users');
        
        // Dados das oficinas
        const workshops = [
            {
                name: 'Bike Center Joinville',
                email: 'carlos@bikejoinville1.com.br',
                password: await bcrypt.hash('BikeCenter2024!', 10),
                userType: 'workshop',
                phone: '(47) 3422-1234',
                address: {
                    street: 'Rua das Palmeiras, 150',
                    neighborhood: 'América',
                    city: 'Joinville',
                    state: 'SC',
                    zipCode: '89202-330',
                    coordinates: {
                        lat: -26.3044,
                        lng: -48.8487
                    }
                },
                workshopInfo: {
                    description: 'Oficina especializada em bicicletas urbanas e mountain bikes com mais de 15 anos de experiência em Joinville.',
                    services: [
                        'Manutenção preventiva',
                        'Reparo de freios',
                        'Troca de pneus',
                        'Ajuste de câmbio',
                        'Revisão completa',
                        'Montagem de bikes'
                    ],
                    specialties: ['Mountain Bike', 'Bike Urbana', 'Speed'],
                    openingHours: {
                        monday: '08:00-18:00',
                        tuesday: '08:00-18:00',
                        wednesday: '08:00-18:00',
                        thursday: '08:00-18:00',
                        friday: '08:00-18:00',
                        saturday: '08:00-12:00',
                        sunday: 'Fechado'
                    },
                    rating: 4.7,
                    reviewCount: 89,
                    priceRange: 'Médio',
                    acceptsEmergency: true
                },
                isActive: true,
                isVerified: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Oficina Bike Express Joinville',
                email: 'ana@bikejoinville2.com.br',
                password: await bcrypt.hash('BikeExpress2024!', 10),
                userType: 'workshop',
                phone: '(47) 3455-6789',
                address: {
                    street: 'Avenida Santos Dumont, 890',
                    neighborhood: 'Zona Industrial Norte',
                    city: 'Joinville',
                    state: 'SC',
                    zipCode: '89205-652',
                    coordinates: {
                        lat: -26.2775,
                        lng: -48.8589
                    }
                },
                workshopInfo: {
                    description: 'Oficina moderna com atendimento rápido e eficiente, especializada em bikes elétricas e de alta performance.',
                    services: [
                        'Manutenção de bikes elétricas',
                        'Reparo de suspensão',
                        'Troca de correntes',
                        'Ajuste de freios a disco',
                        'Limpeza e lubrificação',
                        'Diagnóstico eletrônico'
                    ],
                    specialties: ['Bike Elétrica', 'Speed', 'Mountain Bike'],
                    openingHours: {
                        monday: '07:30-17:30',
                        tuesday: '07:30-17:30',
                        wednesday: '07:30-17:30',
                        thursday: '07:30-17:30',
                        friday: '07:30-17:30',
                        saturday: '08:00-14:00',
                        sunday: 'Fechado'
                    },
                    rating: 4.9,
                    reviewCount: 156,
                    priceRange: 'Alto',
                    acceptsEmergency: true
                },
                isActive: true,
                isVerified: true,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];
        
        console.log('📝 Cadastrando oficinas...');
        
        for (const workshop of workshops) {
            // Verificar se já existe
            const existing = await usersCollection.findOne({ email: workshop.email });
            
            if (existing) {
                console.log(`⚠️  Oficina ${workshop.name} já existe (${workshop.email})`);
                continue;
            }
            
            // Inserir nova oficina
            const result = await usersCollection.insertOne(workshop);
            console.log(`✅ ${workshop.name} cadastrada com sucesso!`);
            console.log(`   📧 Email: ${workshop.email}`);
            console.log(`   📍 CEP: ${workshop.address.zipCode}`);
            console.log(`   🆔 ID: ${result.insertedId}`);
        }
        
        console.log('\n🎉 Cadastro concluído!');
        console.log('📋 Resumo:');
        console.log('   • 2 oficinas processadas');
        console.log('   • Localização: Joinville, SC');
        console.log('   • CEPs: 89202-330 e 89205-652');
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        await client.close();
        console.log('🔌 Conexão fechada.');
    }
}

// Executar
addJoinvilleWorkshops();