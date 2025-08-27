const { body, param, query, validationResult } = require('express-validator');

// Middleware para processar resultados de validação
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    console.log('=== ERRO DE VALIDAÇÃO ===');
    console.log('Dados recebidos:', req.body);
    console.log('Erros de validação:', errors.array());
    console.log('========================');
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
};

// Validações para autenticação
const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres'),
  
  body('userType')
    .isIn(['cyclist', 'workshop'])
    .withMessage('Tipo de usuário deve ser cyclist ou workshop'),
  
  body('phone')
    .optional()
    .trim()
    .isLength({ min: 10, max: 20 })
    .withMessage('Telefone deve ter entre 10 e 20 caracteres'),
  
  handleValidationErrors
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  
  body('password')
    .notEmpty()
    .withMessage('Senha é obrigatória'),
  
  handleValidationErrors
];

const validateForgotPassword = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  
  handleValidationErrors
];

const validateResetPassword = [
  body('token')
    .notEmpty()
    .withMessage('Token é obrigatório'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número'),
  
  handleValidationErrors
];

// Validações para perfil de usuário
const validateUpdateProfile = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
  
  body('phone')
    .optional()
    .isMobilePhone('pt-BR')
    .withMessage('Telefone inválido'),
  
  body('address.street')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Endereço deve ter entre 5 e 200 caracteres'),
  
  body('address.city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Cidade deve ter entre 2 e 100 caracteres'),
  
  body('address.state')
    .optional()
    .trim()
    .isLength({ min: 2, max: 2 })
    .withMessage('Estado deve ter 2 caracteres'),
  
  body('address.zipCode')
    .optional()
    .matches(/^\d{5}-?\d{3}$/)
    .withMessage('CEP inválido'),
  
  handleValidationErrors
];

// Validações para dados de ciclista
const validateCyclistData = [
  body('cyclistData.bikes.*.brand')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Marca da bicicleta deve ter entre 1 e 50 caracteres'),
  
  body('cyclistData.bikes.*.model')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Modelo da bicicleta deve ter entre 1 e 50 caracteres'),
  
  body('cyclistData.bikes.*.type')
    .optional()
    .isIn(['road', 'mountain', 'hybrid', 'electric', 'bmx', 'other'])
    .withMessage('Tipo de bicicleta inválido'),
  
  body('cyclistData.bikes.*.year')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage('Ano da bicicleta inválido'),
  
  handleValidationErrors
];

// Validações para dados de oficina
const validateWorkshopData = [
  body('workshopData.businessName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome da empresa deve ter entre 2 e 100 caracteres'),
  
  body('workshopData.cnpj')
    .matches(/^(\d{14}|\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})$/)
    .withMessage('CNPJ inválido - deve conter 14 dígitos'),
  
  body('workshopData.description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Descrição deve ter no máximo 500 caracteres'),
  
  body('workshopData.services')
    .optional()
    .isArray()
    .withMessage('Serviços devem ser um array'),
  
  body('workshopData.workingHours.*.day')
    .optional()
    .isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
    .withMessage('Dia da semana inválido'),
  
  body('workshopData.workingHours.*.open')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Horário de abertura inválido'),
  
  body('workshopData.workingHours.*.close')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Horário de fechamento inválido'),
  
  handleValidationErrors
];

// Validações para agendamentos
const validateAppointment = [
  body('workshopId')
    .isMongoId()
    .withMessage('ID da oficina inválido'),
  
  body('appointmentDate')
    .isISO8601()
    .toDate()
    .custom(value => {
      if (value <= new Date()) {
        throw new Error('Data do agendamento deve ser futura');
      }
      return true;
    }),
  
  body('appointmentTime')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Horário inválido'),
  
  body('bikeInfo.brand')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Marca da bicicleta é obrigatória'),
  
  body('bikeInfo.model')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Modelo da bicicleta é obrigatório'),
  
  body('serviceType')
    .isIn(['basic', 'complete', 'custom'])
    .withMessage('Tipo de serviço inválido'),
  
  body('requestedServices')
    .isArray({ min: 1 })
    .withMessage('Pelo menos um serviço deve ser selecionado'),
  
  body('problemDescription')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Descrição do problema deve ter no máximo 500 caracteres'),
  
  handleValidationErrors
];

// Validações para orçamentos adicionais
const validateAdditionalBudget = [
  body('appointmentId')
    .isMongoId()
    .withMessage('ID do agendamento inválido'),
  
  body('services')
    .isArray({ min: 1 })
    .withMessage('Pelo menos um serviço deve ser incluído'),
  
  body('services.*.name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Nome do serviço é obrigatório'),
  
  body('services.*.price')
    .isFloat({ min: 0 })
    .withMessage('Preço deve ser um número positivo'),
  
  body('parts')
    .optional()
    .isArray(),
  
  body('parts.*.name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Nome da peça é obrigatório'),
  
  body('parts.*.price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Preço da peça deve ser um número positivo'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Descrição deve ter no máximo 500 caracteres'),
  
  handleValidationErrors
];

// Validações para parâmetros de rota
const validateMongoId = (paramName) => [
  param(paramName)
    .isMongoId()
    .withMessage(`${paramName} deve ser um ID válido`),
  
  handleValidationErrors
];

// Validações para queries de busca
const validateSearchQuery = [
  query('lat')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude inválida'),
  
  query('lng')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude inválida'),
  
  query('radius')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Raio deve ser entre 1 e 100 km'),
  
  query('services')
    .optional()
    .isArray()
    .withMessage('Serviços deve ser um array'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página deve ser um número positivo'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limite deve ser entre 1 e 50'),
  
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateUpdateProfile,
  validateCyclistData,
  validateWorkshopData,
  validateAppointment,
  validateAdditionalBudget,
  validateMongoId,
  validateSearchQuery
};