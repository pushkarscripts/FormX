import express from 'express';
import cors from 'cors';
import healthRouter from './routes/health.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/health', healthRouter);

export default app;
