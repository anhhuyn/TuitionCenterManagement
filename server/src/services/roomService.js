import db from "../models/index.js";

const { Room } = db;

const getAllRooms = async () => {
  try {
    const rooms = await Room.findAll({
      attributes: ["id", "name", "seatCapacity", "createdAt", "updatedAt"],
    });

    return rooms.map(room => ({
      id: room.id,
      name: room.name,
      seatCapacity: room.seatCapacity,
    }));
  } catch (error) {
    throw new Error(error.message);
  }
};

export default {
  getAllRooms,
};
