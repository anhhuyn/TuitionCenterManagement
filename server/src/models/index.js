//index.js
import Sequelize from 'sequelize';
import userModel from './user.js';

const sequelize = new Sequelize('tuitioncentermanagement', 'root', '12345', {
  host: 'localhost',
  dialect: 'mysql' // hoặc 'postgres', 'sqlite', ...
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.User = userModel(sequelize, Sequelize.DataTypes);

export default db;
