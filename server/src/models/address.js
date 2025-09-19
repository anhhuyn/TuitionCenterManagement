'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Address extends Model {
    static associate(models) {
      Address.hasMany(models.Teacher, { foreignKey: 'addressId', as: 'teachers' });
      Address.hasMany(models.Student, { foreignKey: 'addressId' });
    }
  }

  Address.init({
    details: DataTypes.STRING,
    ward: DataTypes.STRING,
    province: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Address',
    timestamps: true, 
  });

  return Address;
};
