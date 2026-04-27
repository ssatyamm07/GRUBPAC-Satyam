import sequelize from './database.js';

async function testDB() {
  try {
    await sequelize.authenticate();
    console.log('DB connected successfully');
  } catch (error) {
    console.error('DB connection failed:', error);
  }
}

testDB();
