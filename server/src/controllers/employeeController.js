import employeeService from "../services/employeeService.js";
// Lấy danh sách tất cả nhân viên
const handleGetAllTeachers = async (req, res) => {
  const { page = 1, limit = 10, name, specialty, gender } = req.query;

  const response = await employeeService.getAllTeachers(
    parseInt(page),
    parseInt(limit),
    { name, specialty, gender }
  );

  return res.status(200).json(response);
};



let handleCreateNewEmployee = async (req, res) => {
  console.log("BODY:", req.body);
  console.log("FILE:", req.file);

  const response = await employeeService.createNewEmployee(req.body, req.file);
  if (response.errCode === 0) {
    return res.status(201).json(response);
  } else {
    return res.status(400).json(response);
  }
};


const handleUpdateEmployee = async (req, res) => {
  const response = await employeeService.updateEmployeeData(req.body, req.file);
  return res.status(response.errCode === 0 ? 200 : 400).json(response);
};

// Xóa nhân viên
let handleDeleteEmployee = async (req, res) => {
  const id = req.params.id; // Sửa từ req.query.id → req.params.id
  if (!id) {
    return res.status(400).json({
      errCode: 1,
      message: "Thiếu ID nhân viên."
    });
  }
  const response = await employeeService.deleteEmployee(id);
  if (response.errCode === 0) {
    return res.status(200).json(response);
  } else {
    return res.status(400).json(response);
  }
};

const handleExportTeachersExcel = async (req, res) => {
  try {
    const { name, specialty, gender } = req.query;
    const buffer = await employeeService.exportTeachersToExcel({
      name,
      specialty,
      gender,
    });

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=danh-sach-giao-vien.xlsx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(buffer);
  } catch (e) {
    console.error("Lỗi khi xuất Excel:", e);
    res.status(500).json({ errCode: 500, message: "Xuất Excel thất bại" });
  }
};

// 🔹 Xóa nhiều giáo viên cùng lúc
const handleDeleteMultipleTeachers = async (req, res) => {
  const { ids } = req.body; // FE gửi danh sách userId (VD: [5, 6, 7])

  // Kiểm tra đầu vào
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({
      errCode: 1,
      message: "Danh sách ID giáo viên không hợp lệ!",
    });
  }

  try {
    // Gọi service xử lý
    const response = await employeeService.deleteMultipleTeachers(ids);

    if (response.errCode === 0) {
      return res.status(200).json(response);
    } else {
      return res.status(400).json(response);
    }
  } catch (error) {
    console.error("❌ Lỗi trong handleDeleteMultipleTeachers:", error);
    return res.status(500).json({
      errCode: 500,
      message: "Internal server error khi xóa nhiều giáo viên!",
    });
  }
};


// Lấy danh sách giáo viên (chỉ id, userId, fullName, email, specialty)
const handleGetTeacherBasicList = async (req, res) => {
  const response = await employeeService.getTeacherBasicList();
  return res.status(response.errCode === 0 ? 200 : 400).json(response);
};

export default {
  handleGetAllTeachers,
  handleCreateNewEmployee,
  handleUpdateEmployee,
  handleDeleteEmployee,
  handleGetTeacherBasicList,
  handleExportTeachersExcel,
  handleDeleteMultipleTeachers,
};