const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Verificar se as variáveis de ambiente do Google OAuth estão configuradas
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleCallbackUrl = process.env.GOOGLE_CALLBACK_URL || (process.env.NODE_ENV === 'production' 
  ? 'https://bikefix-backend.onrender.com/api/auth/google/callback'
  : 'http://localhost:3001/api/auth/google/callback');

// Só configurar Google OAuth se as variáveis estiverem definidas
if (googleClientId && googleClientSecret) {
  console.log('Configurando Google OAuth Strategy...');
  
  // Configuração da estratégia Google OAuth
  passport.use(new GoogleStrategy({
    clientID: googleClientId,
    clientSecret: googleClientSecret,
    callbackURL: googleCallbackUrl
  }, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('Google OAuth Profile:', profile);
    
    // Verificar se usuário já existe com este Google ID
    let user = await User.findOne({ googleId: profile.id });
    
    if (user) {
      // Usuário já existe, fazer login
      user.lastLogin = new Date();
      await user.save();
      return done(null, user);
    }
    
    // Verificar se já existe usuário com este email
    user = await User.findOne({ email: profile.emails[0].value });
    
    if (user) {
      // Usuário existe mas não tem Google ID, vincular conta
      user.googleId = profile.id;
      user.lastLogin = new Date();
      // Se não tem foto de perfil, usar a do Google
      if (!user.profilePicture && profile.photos && profile.photos[0]) {
        user.profilePicture = profile.photos[0].value;
      }
      await user.save();
      return done(null, user);
    }
    
    // Criar novo usuário
    const newUser = new User({
      googleId: profile.id,
      name: profile.displayName,
      email: profile.emails[0].value,
      profilePicture: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
      userType: 'cyclist', // Padrão para novos usuários via Google
      isEmailVerified: true, // Email já verificado pelo Google
      lastLogin: new Date()
    });
    
    await newUser.save();
    console.log('Novo usuário criado via Google OAuth:', newUser.email);
    
    return done(null, newUser);
    
  } catch (error) {
    console.error('Erro na autenticação Google:', error);
    return done(error, null);
  }
}));

} else {
  console.warn('⚠️  Google OAuth não configurado: GOOGLE_CLIENT_ID e/ou GOOGLE_CLIENT_SECRET não definidos');
  console.warn('   Para habilitar login com Google, configure essas variáveis de ambiente');
}

// Serialização do usuário para sessão
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialização do usuário da sessão
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;