import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('tuitioncentermanagement', 'root', '@Thanh05052004', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false,
});

let connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Kết nối database thành công!');
  } catch (error) {
    console.error('Không thể kết nối database:', error);
  }
};

export default connectDB;
