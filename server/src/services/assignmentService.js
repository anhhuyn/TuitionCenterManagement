import db from '../models/index.js';
import path from 'path';
import fs from 'fs';

const getFileExtension = (fileName) => {
  return path.extname(fileName).replace('.', '').toLowerCase();
};

// Tạo mới Assignment (có thể có file)
const createAssignment = async (data, file) => {
  const fileURL = file ? `/uploads/assignments/${file.filename}` : null;

  const assignment = await db.Assignment.create({
    sessionId: data.sessionId,
    title: data.title,
    description: data.description,
    dueDate: data.dueDate,
    file: fileURL
  });

  return assignment;
};

// Cập nhật file và/hoặc dữ liệu assignment
const updateAssignment = async (assignmentId, newData, file) => {
  const assignment = await db.Assignment.findByPk(assignmentId);
  if (!assignment) throw new Error("Không tìm thấy assignment");

  const updates = { ...newData };

  if (file) {
    if (assignment.file) {
      const oldFilePath = path.join(process.cwd(), 'public', assignment.file);
      if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
    }
    updates.file = `/uploads/assignments/${file.filename}`;
  }

  await assignment.update(updates);
  return assignment;
};

// Xóa assignment và file đính kèm
const deleteAssignment = async (assignmentId) => {
  const assignment = await db.Assignment.findByPk(assignmentId);
  if (!assignment) throw new Error("Không tìm thấy assignment");

  if (assignment.file) {
    const filePath = path.join(process.cwd(), 'public', assignment.file);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  await assignment.destroy();
};

// Lấy assignments theo subjectId
const getAssignmentsBySubject = async (subjectId) => {
  const assignments = await db.Assignment.findAll({
    include: [
      {
        model: db.Session,
        where: { subjectId },
        attributes: ['id', 'sessionDate', 'startTime', 'endTime']
      }
    ],
    order: [['dueDate', 'ASC']],
  });

  return assignments.map((ass) => {
    const fileSize = (() => {
      if (ass.file) {
        const filePath = path.join(process.cwd(), 'public', ass.file);
        if (fs.existsSync(filePath)) {
          const stats = fs.statSync(filePath);
          return `${(stats.size / (1024 * 1024)).toFixed(2)} MB`;
        }
      }
      return 'Không xác định';
    })();

    return {
      ...ass.toJSON(),
      fileSize
    };
  });
};

export default {
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getAssignmentsBySubject
};
