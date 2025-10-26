import studentAssignmentService from '../services/studentAssignmentService.js';

const assignToStudents = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const result = await studentAssignmentService.assignToStudents(assignmentId);

    return res.status(200).json({
      message: `Gán assignment cho ${result.totalAssigned} học sinh thành công`,
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const getStudentAssignmentsByAssignmentId = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const result = await studentAssignmentService.getStudentAssignmentsByAssignmentId(assignmentId);

    return res.status(200).json({
      message: "Lấy danh sách học sinh theo assignment thành công",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateStudentAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { submittedStatus, feedback } = req.body;

    const updated = await studentAssignmentService.updateStudentAssignment(assignmentId, {
      submittedStatus,
      feedback,
    });

    return res.status(200).json({
      message: "Cập nhật trạng thái/feedback thành công",
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export default {
  assignToStudents,
  getStudentAssignmentsByAssignmentId,
  updateStudentAssignment,
};
