import dotenv from 'dotenv';
import app from './src/app.js';
import { sequelize } from './src/config/database.js';

dotenv.config();

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection established.');

    // Sync database (create tables if they don't exist)
    await sequelize.sync({ alter: false });
    console.log('Database models synchronized.');

    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
}

startServer();
