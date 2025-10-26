import studentService from "../services/studentService.js";


const handleGetAllStudents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      name,
      grade,
      schoolName,
      gender,
      subject, // ✅ thêm field subject
    } = req.query;

    // Gửi xuống service
    const response = await studentService.getAllStudents(
      parseInt(page),
      parseInt(limit),
      { name, grade, schoolName, gender, subject }
    );

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in handleGetAllStudents:", error);
    return res.status(500).json({
      errCode: 1,
      message: "Internal server error",
    });
  }
};
const handleCreateNewStudent = async (req, res) => {
  console.log("BODY:", req.body);
  console.log("FILE:", req.file);

  const response = await studentService.createNewStudent(req.body, req.file);
  if (response.errCode === 0) {
    return res.status(201).json(response);
  } else {
    return res.status(400).json(response);
  }
};
const handleUpdateStudent = async (req, res) => {
  try {
    const studentId = req.params.id; // userId của học viên
    const response = await studentService.updateStudent(
      studentId,
      req.body,
      req.file
    );
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in handleUpdateStudent:", error);
    return res.status(500).json({
      errCode: 1,
      message: "Internal server error",
    });
  }
};


// Xóa học viên
const handleDeleteStudent = async (req, res) => {
  const id = req.params.id; // Lấy id từ URL
  if (!id) {
    return res.status(400).json({
      errCode: 1,
      message: "Thiếu ID học viên.",
    });
  }

  try {
    const response = await studentService.deleteStudent(id);
    if (response.errCode === 0) {
      return res.status(200).json(response);
    } else {
      return res.status(400).json(response);
    }
  } catch (error) {
    console.error("Error in handleDeleteStudent:", error);
    return res.status(500).json({
      errCode: 500,
      message: "Internal server error",
    });
  }
};

// 🔹 Xóa nhiều học viên cùng lúc
const handleDeleteMultipleStudents = async (req, res) => {
  const { ids } = req.body; // FE gửi danh sách userId (VD: [12, 13, 14])

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({
      errCode: 1,
      message: "Danh sách ID học viên không hợp lệ!",
    });
  }

  try {
    const response = await studentService.deleteMultipleStudents(ids);
    if (response.errCode === 0) {
      return res.status(200).json(response);
    } else {
      return res.status(400).json(response);
    }
  } catch (error) {
    console.error("❌ Error in handleDeleteMultipleStudents:", error);
    return res.status(500).json({
      errCode: 500,
      message: "Internal server error khi xóa nhiều học viên!",
    });
  }
};

const handleGetStudentById = async (req, res) => {
  try {
    const studentId = req.params.id;
    const result = await studentService.getStudentById(studentId);
    return res.status(200).json(result);
  } catch (error) {
    console.error("❌ Lỗi controller getStudentById:", error);
    return res.status(500).json({
      errCode: 500,
      message: "Lỗi server khi lấy thông tin chi tiết học viên!",
    });
  }
};


export const handleExportStudentsExcel = async (req, res) => {
  try {
    const { name, grade, schoolName, gender } = req.query;

    const buffer = await studentService.exportStudentsToExcel({
      name,
      grade,
      schoolName,
      gender,
    });

    if (!buffer) {
      return res
        .status(404)
        .json({ errCode: 1, message: "Không có dữ liệu để xuất!" });
    }

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=danh-sach-hoc-vien.xlsx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.send(buffer);
  } catch (e) {
    console.error("❌ Lỗi khi xuất Excel học viên:", e);
    res.status(500).json({ errCode: 500, message: "Xuất Excel thất bại!" });
  }
};



const getStudentsByGrade = async (req, res) => {
  try {
    const { grade } = req.params;

    if (!grade) {
      return res.status(400).json({ message: "Thiếu grade" });
    }

    const students = await studentService.getStudentsByGrade(grade);

    return res.status(200).json({
      message: "Lấy danh sách học sinh theo khối thành công",
      data: students,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Có lỗi xảy ra khi lấy danh sách học sinh theo khối",
      error: error.message,
    });
  }
};

export default {
  handleGetAllStudents,
  handleCreateNewStudent,
  handleUpdateStudent,
  handleDeleteStudent,
  handleDeleteMultipleStudents,
  handleGetStudentById,
  handleExportStudentsExcel,
  getStudentsByGrade
};
