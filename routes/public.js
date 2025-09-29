import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../lib/database.js';
import { emailService } from '../lib/email.js';
import { reservationSchema, validateRequest } from '../lib/validation.js';
import { reservationLimiter } from '../middleware/rateLimiter.js';
import { asyncHandler, isBeforeSlotStart } from '../middleware/auth.js';

const router = express.Router();

// Branding constants
const BRAND = {
  name: "Jus de pomme des pionniers d'Ecaussinnes",
  primary: "#7B1E2B",
  accent: "#B23A48"
};

// Home page - list available slots
router.get('/', asyncHandler(async (req, res) => {
  const { date, lieu, month, year } = req.query;
  const slots = await db.listUpcomingSlots({ 
    dateFilter: date || null, 
    locationFilter: lieu || '' 
  });

  // Group by date -> location
  const grouped = {};
  for (const slot of slots) {
    const day = slot.start_at.slice(0, 10); // YYYY-MM-DD
    const location = slot.location;
    grouped[day] = grouped[day] || {};
    grouped[day][location] = grouped[day][location] || [];
    grouped[day][location].push(slot);
  }

  res.render('index', { 
    BRAND, 
    grouped, 
    groupedJson: JSON.stringify(grouped),
    query: { date: date || '', lieu: lieu || '', month: month || '', year: year || '' } 
  });
}));

// Show reservation form for a specific slot
router.get('/reserve/:slotId', asyncHandler(async (req, res) => {
  const slot = await db.getSlotById(Number(req.params.slotId));
  if (!slot) {
    return res.status(404).render('error', {
      BRAND,
      error: 'Créneau introuvable',
      details: null
    });
  }
  res.render('reserve', { BRAND, slot });
}));

// Process reservation
router.post('/reserve/:slotId', 
  reservationLimiter,
  validateRequest(reservationSchema),
  asyncHandler(async (req, res) => {
    const slotId = Number(req.params.slotId);
    const slot = await db.getSlotById(slotId);
    
    if (!slot) {
      return res.status(404).render('error', {
        BRAND,
        error: 'Créneau introuvable',
        details: null
      });
    }

    const { first_name, last_name, phone, quantity, comment, email } = req.validatedData;
    const token = uuidv4();

    const reservation = await db.createReservation({
      slot_id: slotId,
      first_name,
      last_name,
      phone,
      quantity,
      comment: comment || null,
      token
    });

    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
    
    // Prepare reservation data for email
    const reservationForEmail = {
      token,
      first_name,
      last_name,
      phone,
      quantity,
      comment: comment || '',
      start_at: slot.start_at,
      location: slot.presences.location,
      date: slot.presences.date
    };

    // Send confirmation email if email provided
    let emailSent = false;
    if (email) {
      try {
        await emailService.sendConfirmationEmail({
          to: email,
          reservation: reservationForEmail,
          baseUrl
        });
        emailSent = true;
      } catch (error) {
        console.error('Error sending email:', error);
        // Don't fail the reservation if email fails
      }
    }

    res.render('confirm', { 
      BRAND, 
      reservation: reservationForEmail, 
      baseUrl, 
      token, 
      emailSent 
    });
  })
);

// Show edit reservation form
router.get('/r/:token/edit', asyncHandler(async (req, res) => {
  const reservation = await db.getReservationByToken(req.params.token);
  
  if (!reservation) {
    return res.status(404).render('error', {
      BRAND,
      error: 'Réservation introuvable',
      details: null
    });
  }

  if (!isBeforeSlotStart(reservation.start_at)) {
    return res.status(403).render('error', {
      BRAND,
      error: 'Modification non autorisée',
      details: 'Le créneau a déjà commencé'
    });
  }

  res.render('modify', { BRAND, r: reservation });
}));

// Process reservation modification
router.post('/r/:token/edit', 
  validateRequest(reservationSchema),
  asyncHandler(async (req, res) => {
    const reservation = await db.getReservationByToken(req.params.token);
    
    if (!reservation) {
      return res.status(404).render('error', {
        BRAND,
        error: 'Réservation introuvable',
        details: null
      });
    }

    if (!isBeforeSlotStart(reservation.start_at)) {
      return res.status(403).render('error', {
        BRAND,
        error: 'Modification non autorisée',
        details: 'Le créneau a déjà commencé'
      });
    }

    const { first_name, last_name, phone, quantity, comment } = req.validatedData;
    
    await db.updateReservation(req.params.token, {
      first_name,
      last_name,
      phone,
      quantity,
      comment: comment || null
    });

    const updatedReservation = {
      ...reservation,
      first_name,
      last_name,
      phone,
      quantity,
      comment: comment || ''
    };

    res.render('modified', { BRAND, r: updatedReservation });
  })
);

// Show cancellation confirmation
router.get('/r/:token/cancel', asyncHandler(async (req, res) => {
  const reservation = await db.getReservationByToken(req.params.token);
  
  if (!reservation) {
    return res.status(404).render('error', {
      BRAND,
      error: 'Réservation introuvable',
      details: null
    });
  }

  if (!isBeforeSlotStart(reservation.start_at)) {
    return res.status(403).render('error', {
      BRAND,
      error: 'Annulation non autorisée',
      details: 'Le créneau a déjà commencé'
    });
  }

  res.render('cancel_confirm', { BRAND, r: reservation });
}));

// Process reservation cancellation
router.post('/r/:token/cancel', asyncHandler(async (req, res) => {
  const reservation = await db.getReservationByToken(req.params.token);
  
  if (!reservation) {
    return res.status(404).render('error', {
      BRAND,
      error: 'Réservation introuvable',
      details: null
    });
  }

  if (!isBeforeSlotStart(reservation.start_at)) {
    return res.status(403).render('error', {
      BRAND,
      error: 'Annulation non autorisée',
      details: 'Le créneau a déjà commencé'
    });
  }

  await db.deleteReservationByToken(req.params.token);
  res.render('canceled', { BRAND, r: reservation });
}));

export default router;