import roomService from "../services/roomService.js";

const getAllRooms = async (req, res) => {
  try {
    const rooms = await roomService.getAllRooms();

    return res.status(200).json({
      message: "Lấy danh sách phòng học thành công",
      data: rooms,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Có lỗi xảy ra khi lấy danh sách phòng học",
      error: error.message,
    });
  }
};

export default {
  getAllRooms,
};
