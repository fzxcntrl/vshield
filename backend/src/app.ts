import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import candidateRoutes from './routes/candidates';
import mockApiRoutes from './routes/mockApi';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/mock-api', mockApiRoutes); // Using mock routes directly here

export default app;
