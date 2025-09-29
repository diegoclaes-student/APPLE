import express from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../lib/database.js';
import { presenceSchema, validateRequest } from '../lib/validation.js';
import { requireAdmin, asyncHandler } from '../middleware/auth.js';
import { loginLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Branding constants
const BRAND = {
  name: "Jus de pomme des pionniers d'Ecaussinnes",
  primary: "#7B1E2B",
  accent: "#B23A48"
};

// Login form
router.get('/login', (req, res) => {
  if (req.session && req.session.isAdmin) {
    return res.redirect('/admin');
  }
  res.render('admin/login', { BRAND, error: null });
});

// Process login
router.post('/login', 
  loginLimiter,
  asyncHandler(async (req, res) => {
    const { password } = req.body || {};
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

    let isValidPassword = false;

    if (adminPasswordHash) {
      // Use bcrypt for hashed password
      isValidPassword = await bcrypt.compare(password, adminPasswordHash);
    } else if (adminPassword) {
      // Fallback to plain text comparison (not recommended for production)
      isValidPassword = password === adminPassword;
    }

    if (isValidPassword) {
      req.session.isAdmin = true;
      req.session.loginTime = new Date().toISOString();
      return res.redirect('/admin');
    }

    res.status(401).render('admin/login', { 
      BRAND, 
      error: 'Mot de passe incorrect' 
    });
  })
);

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/admin/login');
  });
});

// Dashboard
router.get('/', requireAdmin, asyncHandler(async (req, res) => {
  const presences = await db.listPresences();
  const today = new Date().toISOString().slice(0, 10);
  const todayReservations = await db.listReservations({ date: today });
  
  res.render('admin/dashboard', { 
    BRAND, 
    presences, 
    todayReservations,
    stats: {
      totalPresences: presences.length,
      todayReservations: todayReservations.length,
      totalReservationsToday: todayReservations.reduce((sum, r) => sum + r.quantity, 0)
    }
  });
}));

// New presence form
router.get('/presences/new', requireAdmin, (req, res) => {
  res.render('admin/presences_new', { BRAND, error: null });
});

// Create new presence
router.post('/presences/new', 
  requireAdmin,
  validateRequest(presenceSchema),
  asyncHandler(async (req, res) => {
    const { location, date, start_time, end_time } = req.validatedData;
    
    try {
      await db.createPresence({
        location,
        date,
        startTime: start_time,
        endTime: end_time
      });
      res.redirect('/admin?success=presence-created');
    } catch (error) {
      console.error('Error creating presence:', error);
      res.render('admin/presences_new', { 
        BRAND, 
        error: 'Erreur lors de la création de la présence' 
      });
    }
  })
);

// List all reservations
router.get('/reservations', requireAdmin, asyncHandler(async (req, res) => {
  const { date, lieu } = req.query;
  const reservations = await db.listReservations({ 
    date: date || null, 
    location: lieu || '' 
  });
  
  res.render('admin/reservations', { 
    BRAND, 
    reservations, 
    query: { date: date || '', lieu: lieu || '' },
    totalQuantity: reservations.reduce((sum, r) => sum + r.quantity, 0)
  });
}));

// Delete reservation
router.post('/reservations/delete', requireAdmin, asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (token) {
    try {
      await db.deleteReservationByToken(token);
      res.redirect('/admin/reservations?success=reservation-deleted');
    } catch (error) {
      console.error('Error deleting reservation:', error);
      res.redirect('/admin/reservations?error=delete-failed');
    }
  } else {
    res.redirect('/admin/reservations?error=no-token');
  }
}));

// API endpoint for dashboard stats (for AJAX updates)
router.get('/api/stats', requireAdmin, asyncHandler(async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const todayReservations = await db.listReservations({ date: today });
  const presences = await db.listPresences();
  
  res.json({
    totalPresences: presences.length,
    todayReservations: todayReservations.length,
    totalQuantityToday: todayReservations.reduce((sum, r) => sum + r.quantity, 0),
    lastUpdate: new Date().toISOString()
  });
}));

export default router;