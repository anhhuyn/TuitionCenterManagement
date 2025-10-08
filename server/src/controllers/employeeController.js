import employeeService from "../services/employeeService.js";

// Lấy danh sách tất cả nhân viên
const handleGetAllTeachers = async (req, res) => {
    const response = await employeeService.getAllTeachers();
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
  handleGetTeacherBasicList
};