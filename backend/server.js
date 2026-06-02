import cors from 'cors';
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const { default: videoRoutes } = await import('./routes/video.routes.js');
const { default: chatRoutes }  = await import('./routes/chat.routes.js');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware 
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.disable('x-powered-by');

// ── Routes 
app.use('/api/v1/videos', videoRoutes);  // POST /api/v1/videos/analyze
app.use('/api/v1/chat',   chatRoutes);   // POST /api/v1/chat

app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 TechSolve RAG server running on http://localhost:${PORT}`);
});
