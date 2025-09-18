import jwt from "jsonwebtoken";
import db from "../models/index.js"; // Sequelize models (chứa User)

const verifyToken = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Thiếu token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Query DB để lấy user mới nhất
    const user = await db.User.findOne({
      where: { id: decoded.id },
      attributes: ["id", "email", "fullName", "image"]
    });

    if (!user) {
      return res.status(401).json({ message: "Người dùng không tồn tại" });
    }

    req.user = user; // gán user mới nhất
    next();
  } catch (error) {
    console.error("verifyToken error:", error);
    return res.status(401).json({ message: "Token không hợp lệ" });
  }
};

export default verifyToken;
