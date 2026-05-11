import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import config from './config/index.js';
import { setupSwagger } from './swagger.js';

// ─── Route Imports ────────────────────────────────────────────────────────────
import authRoutes from './routes/auth.js';
import adminAuthRoutes from './routes/adminAuth.js';
import associateRoutes from './routes/associate.js';
import registrationRoutes from './routes/registration.js';
import genealogyRoutes from './routes/genealogy.js';
import incomeRoutes from './routes/income.js';
import publicRoutes from './routes/public.js';
import walletRoutes from './routes/wallet.js';
import propertiesRoutes from './routes/properties.js';
import documentsRoutes from './routes/documents.js';
import supportRoutes from './routes/support.js';
import notificationsRoutes from './routes/notifications.js';
import adminRoutes from './routes/admin/index.js';

const app = express();

// ─── Security & Logging ───────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: [config.APP_BASE_URL, config.ADMIN_BASE_URL],
  credentials: true,
}));
app.use(morgan(config.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ─── Body Parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Static Files (uploads) ───────────────────────────────────────────────────
app.use('/uploads', express.static('uploads'));

// ─── API v1 Health Check ──────────────────────────────────────────────────────
app.get('/api/v1', (req, res) => {
  res.json({ status: 'ok', message: 'Investors World Realty API v1' });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin/auth', adminAuthRoutes);
app.use('/api/v1/associate', associateRoutes);
app.use('/api/v1/registration', registrationRoutes);
app.use('/api/v1/genealogy', genealogyRoutes);
app.use('/api/v1/income', incomeRoutes);
app.use('/api/v1/public', publicRoutes);
app.use('/api/v1/wallet', walletRoutes);
app.use('/api/v1/properties', propertiesRoutes);
app.use('/api/v1/documents', documentsRoutes);
app.use('/api/v1/support', supportRoutes);
app.use('/api/v1/notifications', notificationsRoutes);
app.use('/api/v1/admin', adminRoutes);

// ─── Swagger API Docs (non-production only) ──────────────────────────────────
if (config.NODE_ENV !== 'production') {
  setupSwagger(app);
}

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Route not found', data: null });
});

// ─── Centralized Error Handler ────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = config.NODE_ENV === 'production' && statusCode === 500
    ? 'An unexpected error occurred'
    : err.message || 'An unexpected error occurred';

  if (statusCode === 500) console.error('[ERROR]', err);

  res.status(statusCode).json({ status: 'error', message, data: null });
});

export default app;
