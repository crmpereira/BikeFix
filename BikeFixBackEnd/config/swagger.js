const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BikeFix API',
      version: '1.0.0',
      description: 'API para o sistema de gerenciamento de bicicletas e oficinas BikeFix',
      contact: {
        name: 'BikeFix Team',
        email: 'contato@bikefix.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Servidor de desenvolvimento'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'ID único do usuário'
            },
            name: {
              type: 'string',
              description: 'Nome completo do usuário'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email do usuário'
            },
            userType: {
              type: 'string',
              enum: ['customer', 'workshop'],
              description: 'Tipo de usuário'
            },
            bikes: {
              type: 'array',
              items: { $ref: '#/components/schemas/Bike' },
              description: 'Lista de bicicletas do usuário'
            },
            preferences: {
              type: 'object',
              description: 'Preferências do usuário'
            },
            workshopData: {
              type: 'object',
              description: 'Dados específicos da oficina (se aplicável)'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criação'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de última atualização'
            }
          }
        },
        Bike: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'ID único da bicicleta'
            },
            brand: {
              type: 'string',
              description: 'Marca da bicicleta'
            },
            model: {
              type: 'string',
              description: 'Modelo da bicicleta'
            },
            year: {
              type: 'integer',
              description: 'Ano de fabricação'
            },
            type: {
              type: 'string',
              description: 'Tipo da bicicleta'
            },
            serialNumber: {
              type: 'string',
              description: 'Número de série'
            },
            color: {
              type: 'string',
              description: 'Cor da bicicleta'
            },
            description: {
              type: 'string',
              description: 'Descrição adicional'
            }
          },
          required: ['brand', 'model', 'year', 'type']
        },
        Workshop: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'ID único da oficina'
            },
            name: {
              type: 'string',
              description: 'Nome da oficina'
            },
            address: {
              type: 'string',
              description: 'Endereço da oficina'
            },
            phone: {
              type: 'string',
              description: 'Telefone da oficina'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email da oficina'
            },
            services: {
              type: 'array',
              items: { type: 'string' },
              description: 'Lista de serviços oferecidos'
            },
            rating: {
              type: 'number',
              minimum: 0,
              maximum: 5,
              description: 'Avaliação média da oficina'
            },
            location: {
              type: 'object',
              properties: {
                lat: { type: 'number' },
                lng: { type: 'number' }
              },
              description: 'Coordenadas geográficas'
            }
          }
        },
        Appointment: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'ID único do agendamento'
            },
            userId: {
              type: 'string',
              description: 'ID do usuário'
            },
            workshopId: {
              type: 'string',
              description: 'ID da oficina'
            },
            bikeId: {
              type: 'string',
              description: 'ID da bicicleta'
            },
            serviceType: {
              type: 'string',
              description: 'Tipo de serviço'
            },
            date: {
              type: 'string',
              format: 'date-time',
              description: 'Data e hora do agendamento'
            },
            status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'completed', 'cancelled'],
              description: 'Status do agendamento'
            },
            description: {
              type: 'string',
              description: 'Descrição do problema'
            },
            estimatedPrice: {
              type: 'number',
              description: 'Preço estimado'
            }
          }
        },
        Review: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'ID único da avaliação'
            },
            userId: {
              type: 'string',
              description: 'ID do usuário'
            },
            workshopId: {
              type: 'string',
              description: 'ID da oficina'
            },
            appointmentId: {
              type: 'string',
              description: 'ID do agendamento'
            },
            rating: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
              description: 'Nota da avaliação'
            },
            comment: {
              type: 'string',
              description: 'Comentário da avaliação'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criação'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Mensagem de erro'
            },
            error: {
              type: 'string',
              description: 'Detalhes do erro'
            }
          }
        }
      }
    }
  },
  apis: ['./routes/*.js', './controllers/*.js']
};

const specs = swaggerJSDoc(options);

module.exports = {
  swaggerUi,
  specs
};