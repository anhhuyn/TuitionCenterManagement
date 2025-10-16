import assignmentService from "../services/assignmentService.js";

const uploadAssignment = async (req, res) => {
  try {
    const assignment = await assignmentService.createAssignment(req.body, req.file);
    return res.status(200).json({ message: "Tạo assignment thành công", data: assignment });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const updated = await assignmentService.updateAssignment(assignmentId, req.body, req.file);
    return res.status(200).json({ message: "Cập nhật assignment thành công", data: updated });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    await assignmentService.deleteAssignment(assignmentId);
    return res.status(200).json({ message: "Xóa assignment thành công" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getAssignmentsBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const assignments = await assignmentService.getAssignmentsBySubject(subjectId);

    return res.status(200).json({
      message: "Lấy danh sách assignment theo môn thành công",
      data: assignments
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export default {
  uploadAssignment,
  updateAssignment,
  deleteAssignment,
  getAssignmentsBySubject
};
