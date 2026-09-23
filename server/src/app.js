import express from 'express';
import cors from 'cors';
import healthRouter from './routes/health.js';
import authRouter from './routes/auth.js';
import formsRouter from './routes/forms.js';
import publicRouter from './routes/public.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '100kb' }));

// Routes
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/forms', formsRouter);
app.use('/api/public', publicRouter);

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({ error: 'Request body must contain valid JSON' });
  }
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request body is too large' });
  }
  console.error(error);
  return res.status(error.statusCode || 500).json({ error: error.statusCode ? error.message : 'Internal server error' });
});

export default app;
