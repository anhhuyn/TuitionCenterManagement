import db from '../models/index.js';
import fs from 'fs';
import path from 'path';

const getMaterialsBySubjectId = async (subjectId) => {
  const materials = await db.Material.findAll({
    where: { subjectId },
    include: [
      { model: db.User, attributes: ['id', 'fullName', 'email'] },
      { model: db.Subject, attributes: ['id', 'name'] }
    ],
    order: [['uploadedAt', 'DESC']],
  });

  // Tính dung lượng file (MB)
  const materialsWithSize = materials.map(mat => {
    try {
      const filePath = path.join(process.cwd(), 'public', mat.fileURL);
      const stats = fs.statSync(filePath);
      const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
      return { ...mat.toJSON(), fileSize: `${fileSizeInMB} MB` };
    } catch (err) {
      return { ...mat.toJSON(), fileSize: 'Không xác định' };
    }
  });

  return materialsWithSize;
};

//  Hàm lấy đuôi file làm type (không cần nhóm loại)
const getFileExtension = (fileName) => {
  return path.extname(fileName).replace('.', '').toLowerCase(); // ví dụ ".PDF" => "pdf"
};

const createMaterial = async (data, file) => {
  if (!file) throw new Error("Chưa có file tài liệu được tải lên.");

  const fileURL = `/uploads/materials/${file.filename}`;
  const type = getFileExtension(file.originalname); 

  const material = await db.Material.create({
    title: data.title,
    subjectId: data.subjectId,
    uploadedBy: data.userId,
    fileURL,
    type, // ví dụ "pdf"
    uploadedAt: new Date()
  });

  return material;
};

const updateMaterialFile = async (materialId, file, newTitle) => {
  const material = await db.Material.findByPk(materialId);
  if (!material) throw new Error("Không tìm thấy tài liệu");

  const updates = { uploadedAt: new Date() };

  // Nếu có file mới => cập nhật fileURL và type
  if (file) {
    if (material.fileURL) {
      const oldFilePath = path.join(process.cwd(), 'public', material.fileURL);
      if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
    }

    const fileURL = `/uploads/materials/${file.filename}`;
    const type = getFileExtension(file.originalname); 

    updates.fileURL = fileURL;
    updates.type = type;
  }

  // Nếu có title mới => cập nhật
  if (newTitle) {
    updates.title = newTitle;
  }

  await material.update(updates);
  return material;
};

const deleteMaterial = async (materialId) => {
  const material = await db.Material.findByPk(materialId);
  if (!material) throw new Error("Không tìm thấy tài liệu");

  // Xóa file cũ trên server nếu tồn tại
  if (material.fileURL) {
    const filePath = path.join(process.cwd(), 'public', material.fileURL);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  // Xóa record trong DB
  await material.destroy();

  return;
};

export default {
  deleteMaterial,
  getMaterialsBySubjectId,
  createMaterial,
  updateMaterialFile
};
