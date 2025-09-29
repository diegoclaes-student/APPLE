import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import expressLayouts from 'express-ejs-layouts';

// Import routes
import publicRoutes from '../routes/public.js';
import adminRoutes from '../routes/admin.js';

// Import middleware
import { generalLimiter } from '../middleware/rateLimiter.js';
import { errorHandler } from '../middleware/auth.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: isProd ? process.env.ALLOWED_ORIGINS?.split(',') || false : true,
  credentials: true
}));

// Rate limiting
app.use(generalLimiter);

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'src', 'views'));
// Use express-ejs-layouts to wrap views with `layout.ejs`
app.use(expressLayouts);
app.set('layout', 'layout');

// Body parsing middleware
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));

// Static files
app.use(express.static(path.join(__dirname, '..', 'src', 'public'), {
  maxAge: isProd ? '1y' : 0,
  etag: true
}));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'development-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProd,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax'
  },
  name: 'jdp.sid' // Custom session name
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Routes
app.use('/', publicRoutes);
app.use('/admin', adminRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).render('error', {
    BRAND: {
      name: "Jus de pomme des pionniers d'Ecaussinnes",
      primary: "#7B1E2B",
      accent: "#B23A48"
    },
    error: 'Page non trouvée',
    details: `La page "${req.originalUrl}" n'existe pas.`
  });
});

// Error handler
app.use(errorHandler);

// Start server (only if not in Vercel environment)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔒 Security: ${isProd ? 'Production' : 'Development'} mode`);
  });
}

// Export for Vercel
export default app;