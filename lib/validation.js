import Joi from 'joi';

export const reservationSchema = Joi.object({
  first_name: Joi.string().trim().min(1).max(50).required().messages({
    'string.empty': 'Le prénom est requis',
    'string.max': 'Le prénom ne peut pas dépasser 50 caractères'
  }),
  last_name: Joi.string().trim().min(1).max(50).required().messages({
    'string.empty': 'Le nom est requis',
    'string.max': 'Le nom ne peut pas dépasser 50 caractères'
  }),
  phone: Joi.string().trim().pattern(/^[\d\s\-\+\(\)]+$/).min(8).max(20).required().messages({
    'string.empty': 'Le numéro de téléphone est requis',
    'string.pattern.base': 'Format de téléphone invalide',
    'string.min': 'Le numéro de téléphone doit contenir au moins 8 caractères',
    'string.max': 'Le numéro de téléphone ne peut pas dépasser 20 caractères'
  }),
  quantity: Joi.number().integer().min(1).max(10).required().messages({
    'number.base': 'La quantité doit être un nombre',
    'number.min': 'La quantité doit être d\'au moins 1',
    'number.max': 'La quantité ne peut pas dépasser 10',
    'any.required': 'La quantité est requise'
  }),
  comment: Joi.string().trim().max(500).allow('').optional().messages({
    'string.max': 'Le commentaire ne peut pas dépasser 500 caractères'
  }),
  email: Joi.string().email().trim().max(100).allow('').optional().messages({
    'string.email': 'Format d\'email invalide',
    'string.max': 'L\'email ne peut pas dépasser 100 caractères'
  })
});

export const presenceSchema = Joi.object({
  location: Joi.string().trim().min(1).max(100).required().messages({
    'string.empty': 'Le lieu est requis',
    'string.max': 'Le lieu ne peut pas dépasser 100 caractères'
  }),
  date: Joi.date().iso().min('now').required().messages({
    'date.base': 'Date invalide',
    'date.min': 'La date ne peut pas être dans le passé',
    'any.required': 'La date est requise'
  }),
  start_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required().messages({
    'string.pattern.base': 'Format d\'heure invalide (HH:MM)',
    'any.required': 'L\'heure de début est requise'
  }),
  end_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required().messages({
    'string.pattern.base': 'Format d\'heure invalide (HH:MM)',
    'any.required': 'L\'heure de fin est requise'
  })
}).custom((value, helpers) => {
  const start = new Date(`1970-01-01T${value.start_time}:00`);
  const end = new Date(`1970-01-01T${value.end_time}:00`);
  
  if (start >= end) {
    return helpers.error('custom.timeOrder');
  }
  
  return value;
}, 'Time validation').messages({
  'custom.timeOrder': 'L\'heure de fin doit être après l\'heure de début'
});

export const loginSchema = Joi.object({
  password: Joi.string().min(1).required().messages({
    'string.empty': 'Le mot de passe est requis',
    'any.required': 'Le mot de passe est requis'
  })
});

export function validateRequest(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      return res.status(400).json({
        error: 'Données invalides',
        details: errorMessages
      });
    }

    req.validatedData = value;
    next();
  };
}