import express from 'express';
import bodyParser from 'body-parser';
import prisma from './config/database';
import authRoutes from './routes/auth';
import budgetRoutes from './routes/budgets';
import transactionRoutes from './routes/transactions';
import userRoutes from './routes/users';
import { config } from 'dotenv';

config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database connection test
prisma.$connect()
  .then(() => console.log('Database connected successfully'))
  .catch((err: Error) => console.error('Database connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/users', userRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});