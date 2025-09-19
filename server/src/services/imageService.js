import fs from "fs";
import path from "path";

export const saveImage = (file, subDir = "uploads") => {
  if (!file) return null;

  const uploadDir = path.join(process.cwd(), "public", subDir);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const fileName = `${Date.now()}_${file.originalname}`;
  const filePath = path.join(uploadDir, fileName);

  if (file.buffer) {
    // Trường hợp dùng memoryStorage
    fs.writeFileSync(filePath, file.buffer);
  } else if (file.path) {
    // Trường hợp dùng diskStorage
    fs.renameSync(file.path, filePath);
  } else {
    throw new Error("File không hợp lệ, thiếu buffer hoặc path");
  }

  return `${subDir}/${fileName}`;
};

export const deleteImage = (relativePath) => {
  if (!relativePath) return;
  const filePath = path.join(process.cwd(), "public", relativePath);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};
