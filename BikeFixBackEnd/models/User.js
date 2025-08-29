const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Dados básicos
  name: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true,
    maxlength: [100, 'Nome não pode ter mais de 100 caracteres']
  },
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    unique: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  password: {
    type: String,
    minlength: [6, 'Senha deve ter pelo menos 6 caracteres'],
    select: false // Não retorna a senha por padrão
  },
  phone: {
    type: String,
    trim: true
  },
  avatar: {
    type: String, // URL da imagem
    default: null
  },
  
  // Tipo de usuário
  userType: {
    type: String,
    enum: ['cyclist', 'workshop', 'admin'],
    required: [true, 'Tipo de usuário é obrigatório']
  },
  
  // Status da conta
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: function() {
      // Workshops são verificados automaticamente
      return this.userType === 'workshop';
    }
  },
  
  // Dados específicos do ciclista
  cyclistData: {
    dateOfBirth: Date,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    },
    bikes: [{
      brand: String,
      model: String,
      year: Number,
      type: {
        type: String,
        enum: ['road', 'mountain', 'hybrid', 'electric', 'bmx', 'other']
      },
      serialNumber: String,
      purchaseDate: Date,
      lastMaintenance: Date,
      totalKm: {
        type: Number,
        default: 0
      }
    }],
    preferences: {
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true }
      },
      searchRadius: {
        type: Number,
        default: 10 // km
      }
    }
  },
  
  // Dados específicos da oficina
  workshopData: {
    businessName: String,
    cnpj: String,
    description: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    },
    workingHours: {
      monday: { open: String, close: String, isOpen: Boolean },
      tuesday: { open: String, close: String, isOpen: Boolean },
      wednesday: { open: String, close: String, isOpen: Boolean },
      thursday: { open: String, close: String, isOpen: Boolean },
      friday: { open: String, close: String, isOpen: Boolean },
      saturday: { open: String, close: String, isOpen: Boolean },
      sunday: { open: String, close: String, isOpen: Boolean }
    },
    services: [{
      name: String,
      description: String,
      basePrice: Number,
      estimatedTime: Number // em minutos
    }],
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 }
    },
    isApproved: {
      type: Boolean,
      default: false
    }
  },
  
  // Autenticação externa
  googleId: String,
  stravaId: String,
  stravaAccessToken: String,
  stravaRefreshToken: String,
  
  // Tokens de verificação
  verificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  // Timestamps
  lastLogin: Date
}, {
  timestamps: true
});

// Middleware para hash da senha antes de salvar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar senha
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Método para obter dados públicos do usuário
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.verificationToken;
  delete userObject.passwordResetToken;
  delete userObject.passwordResetExpires;
  delete userObject.stravaAccessToken;
  delete userObject.stravaRefreshToken;
  return userObject;
};

// Índices para performance
userSchema.index({ userType: 1 });
userSchema.index({ 'address.coordinates': '2dsphere' });
userSchema.index({ 'workshopData.businessName': 'text', 'workshopData.description': 'text' });
userSchema.index({ isActive: 1, isVerified: 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);