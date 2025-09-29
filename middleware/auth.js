export function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) {
    return next();
  }
  return res.redirect('/admin/login');
}

export function isBeforeSlotStart(slotStartIso) {
  const now = new Date();
  const start = new Date(slotStartIso);
  return now < start;
}

export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function errorHandler(err, req, res, next) {
  console.error('Error:', err);
  
  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (res.headersSent) {
    return next(err);
  }

  res.status(500).render('error', {
    BRAND: {
      name: "Jus de pomme des pionniers d'Ecaussinnes",
      primary: "#7B1E2B",
      accent: "#B23A48"
    },
    error: isDevelopment ? err.message : 'Une erreur interne s\'est produite',
    details: isDevelopment ? err.stack : null
  });
}