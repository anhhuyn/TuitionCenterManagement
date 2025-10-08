'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Room extends Model {
    static associate(models) {
      Room.hasMany(models.SubjectSchedule, { foreignKey: 'roomId' });
      Room.hasMany(models.Session, { foreignKey: 'roomId' });
    }
  }

  Room.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    seatCapacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Room',
    tableName: 'rooms',
    timestamps: true,
  });

  return Room;
};
