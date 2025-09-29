import express from 'express';
// Replace server memory sessions (bad on serverless) with cookie-based sessions
import cookieSession from 'cookie-session';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
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

// Behind Vercel proxies, trust X-Forwarded-* to set secure cookies etc.
app.set('trust proxy', 1);

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

// Static files - mount under a stable /assets path for Vercel/serverless
const publicDir = path.join(__dirname, '..', 'src', 'public');
app.use('/assets', express.static(publicDir, {
  maxAge: isProd ? '1y' : 0,
  etag: true
}));
// Back-compat: also serve /styles.css directly
app.use('/styles.css', express.static(publicDir, { index: 'styles.css', maxAge: isProd ? '1y' : 0 }));

// Explicit file handler to avoid any routing edge cases on Vercel
let stylesCache = '';
try {
  stylesCache = fs.readFileSync(path.join(publicDir, 'styles.css'), 'utf8');
} catch {}
app.get('/styles.css', (req, res) => {
  res.type('text/css');
  if (stylesCache) return res.status(200).send(stylesCache);
  try {
    const css = fs.readFileSync(path.join(publicDir, 'styles.css'), 'utf8');
    return res.status(200).send(css);
  } catch {
    return res.status(200).send('/* styles.css fallback served from server */');
  }
});

// Session configuration (cookie-based, compatible with serverless)
app.use(cookieSession({
  name: 'jdp.sid',
  keys: [process.env.SESSION_SECRET || 'development-secret-change-me'],
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  sameSite: 'lax',
  httpOnly: true,
  secure: isProd
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