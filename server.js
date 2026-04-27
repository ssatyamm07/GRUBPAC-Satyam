import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './src/config/database.js';
import './src/models/index.js';
import authRoutes from './src/routes/authRoutes.js';
import contentRoutes from './src/routes/contentRoutes.js';
import approvalRoutes from './src/routes/approvalRoutes.js';
import publicRoutes from './src/routes/publicRoutes.js';
import scheduleRoutes from './src/routes/scheduleRoutes.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/approval', approvalRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/schedule', scheduleRoutes);
app.get('/', (req, res) => {
  res.send('API running');
});

const PORT = Number(process.env.PORT) || 5000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('DB connected');
  } catch (error) {
    console.error('DB connection failed:', error);
    process.exit(1);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();