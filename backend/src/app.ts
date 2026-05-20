import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import candidateRoutes from './routes/candidates';
import mockApiRoutes from './routes/mockApi';

const app = express();

// Configure CORS to allow your Vercel domain
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://vshield-in.vercel.app',  // Your Vercel domain
    'https://*.vercel.app'            // Allow all Vercel preview deployments
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/mock-api', mockApiRoutes); // Using mock routes directly here

export default app;
