import rateLimit from 'express-rate-limit';

// Rate limiting for general API calls
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Trop de requêtes. Veuillez réessayer dans 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Stricter rate limiting for reservations
export const reservationLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // limit each IP to 5 reservation attempts per 5 minutes
  message: {
    error: 'Trop de tentatives de réservation. Veuillez réessayer dans 5 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting for admin login
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: {
    error: 'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});