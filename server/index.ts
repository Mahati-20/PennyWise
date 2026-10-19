import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import 'dotenv/config';
import { initDatabase } from './db.js';
import authRouter from './routes/auth.js';
import financialsRouter from './routes/financials.js';

const app = express();
const PORT = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === 'production';
// Render terminates HTTPS at its proxy. Trust that hop so express-session
// recognizes forwarded HTTPS requests when issuing Secure cookies.
app.set('trust proxy', 1);
const sessionSecret = process.env.SESSION_SECRET;
if (isProd && (!sessionSecret || sessionSecret.length < 32)) {
  throw new Error('Production requires SESSION_SECRET with at least 32 characters.');
}
const trustedOrigins = (process.env.TRUSTED_ORIGINS || (isProd ? '' : [
  'http://localhost:5173', 'http://127.0.0.1:5173',
  'http://localhost:4173', 'http://127.0.0.1:4173',
].join(','))).split(',').map(origin => origin.trim()).filter(Boolean);
if (isProd && trustedOrigins.length === 0) {
  throw new Error('Production requires TRUSTED_ORIGINS with comma-separated frontend origins.');
}

// Initialize SQLite Database
initDatabase();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || trustedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origin is not allowed by CORS.'));
    }
  },
  credentials: true,
}));

// Session configuration using HTTP-only cookies
app.use(session({
  name: 'pennywise.sid',
  secret: sessionSecret || 'local-development-only-session-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: isProd, // True only if HTTPS in production
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
}));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Pennywise Backend API',
    database: 'SQLite WAL mode connected',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routers
app.use('/api/auth', authRouter);
app.use('/api/financials', financialsRouter);

// Serve compiled frontend in production if dist/ exists
import path from 'path';
import fs from 'fs';

const distPath = path.join(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(` Pennywise Backend Server Running on Port ${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/api/health`);
  console.log(`===============================================`);
});

export default app;

