import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
  'microSocialNetwork',
  'postgres',
  '2190',
  {
    host: '127.0.0.1',
    port: 5432,
    dialect: 'postgres',
    logging: false,
  }
);

export default sequelize;