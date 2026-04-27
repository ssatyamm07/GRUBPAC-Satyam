import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL?.trim();

const common = {
  logging: false,
};

let sequelize;

if (databaseUrl) {
  const isRenderInternal = databaseUrl.includes('.render.internal');
  const useSsl =
    !isRenderInternal &&
    process.env.DATABASE_SSL !== 'false' &&
    (process.env.DATABASE_SSL === 'true' ||
      databaseUrl.includes('render.com') ||
      databaseUrl.includes('amazonaws.com'));

  sequelize = new Sequelize(databaseUrl, {
    ...common,
    dialectOptions: useSsl
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        }
      : {},
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
      ...common,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
    }
  );
}

export default sequelize;
