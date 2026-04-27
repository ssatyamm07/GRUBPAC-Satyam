import express from 'express';
import dotenv from 'dotenv';
import sequelize from './src/config/database.js';
import './src/models/index.js';
import authRoutes from './src/routes/authRoutes.js';
import contentRoutes from './src/routes/contentRoutes.js';
import approvalRoutes from './src/routes/approvalRoutes.js';
import publicRoutes from './src/routes/publicRoutes.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/approval', approvalRoutes);
app.use('/api/public', publicRoutes);
app.get('/', (req, res) => {
  res.send('API running 🚀');
});

const PORT = process.env.PORT;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ DB connected');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ DB connection failed:', error);
  }
}

startServer();