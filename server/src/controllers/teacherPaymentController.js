import teacherSubjectService from "../services/teacherPaymentService.js";

/**
 * 🧩 Tạo mới thỏa thuận lương giữa giáo viên và môn học
 */
const createTeacherSubject = async (req, res) => {
  try {
    const data = await teacherSubjectService.createTeacherSubject(req.body);
    return res.status(201).json({
      message: "Tạo thỏa thuận lương thành công",
      data,
    });
  } catch (error) {
    // 💡 Cập nhật: Xử lý lỗi cụ thể (như trùng lặp, thiếu dữ liệu)
    
    // Kiểm tra lỗi thiếu dữ liệu (ví dụ: "Thiếu dữ liệu bắt buộc...")
    if (error.message.includes("Thiếu dữ liệu")) {
        return res.status(400).json({ // 400 Bad Request
            message: error.message,
        });
    }

    // Kiểm tra lỗi trùng lặp (ví dụ: "Thỏa thuận đã tồn tại!...")
    if (error.message.includes("đã tồn tại")) {
        return res.status(409).json({ // 409 Conflict
            message: error.message,
        });
    }

    // Mặc định cho các lỗi khác
    return res.status(400).json({ // Giữ nguyên 400 cho các lỗi validate chung khác
      message: error.message || "Không thể tạo thỏa thuận lương",
    });
  }
};

/**
 * 🧩 Lấy danh sách tất cả thỏa thuận lương
 */
const getAllTeacherSubjects = async (req, res) => {
  try {
    const data = await teacherSubjectService.getAllTeacherSubjects();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Lỗi khi lấy danh sách thỏa thuận lương",
    });
  }
};

/**
 * 🧩 Lấy chi tiết 1 thỏa thuận theo ID
 */
const getTeacherSubjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await teacherSubjectService.getTeacherSubjectById(id);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(404).json({
      message: error.message || "Không tìm thấy thỏa thuận lương này",
    });
  }
};

/**
 * 🧩 Cập nhật thông tin thỏa thuận lương
 */
const updateTeacherSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await teacherSubjectService.updateTeacherSubject(id, req.body);
    return res.status(200).json({
      message: "Cập nhật thỏa thuận lương thành công",
      data,
    });
  } catch (error) {
    
    // Kiểm tra lỗi không tìm thấy (Not Found)
    if (error.message.includes("Không tìm thấy thỏa thuận")) {
      return res.status(404).json({ // 404 Not Found
        message: error.message,
      });
    }

    // Kiểm tra lỗi trùng lặp (Conflict) do logic trong service đã thêm
    if (error.message.includes("đã tồn tại trong thỏa thuận khác")) {
      return res.status(409).json({ // 409 Conflict
        message: error.message,
      });
    }

    // Mặc định cho các lỗi validate hoặc database khác
    return res.status(400).json({ // 400 Bad Request
      message: error.message || "Cập nhật thỏa thuận lương thất bại",
    });
  }
};

/**
 * 🧩 Xóa thỏa thuận lương theo ID
 */
/**
 * 🧩 Xóa thỏa thuận lương theo ID
 */
const deleteTeacherSubject = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await teacherSubjectService.deleteTeacherSubject(id);

    return res.status(200).json({
      message: data.message,
      deletedId: data.deletedId,
    });
  } catch (error) {
    console.error("❌ Lỗi xóa thỏa thuận:", error.message);

    if (error.message.includes("không hợp lệ")) {
      return res.status(400).json({ message: error.message }); // Bad Request
    }

    if (error.message.includes("Không tìm thấy")) {
      return res.status(404).json({ message: error.message }); // Not Found
    }

    return res.status(500).json({
      message: error.message || "Lỗi máy chủ khi xóa thỏa thuận lương.",
    });
  }
};


/**
 * 🧩 Tìm kiếm thỏa thuận theo tên giáo viên hoặc tên môn học
 */
const searchTeacherSubjects = async (req, res) => {
  try {
    const keyword = req.query.keyword || "";
    const data = await teacherSubjectService.searchTeacherSubjects(keyword);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Lỗi khi tìm kiếm thỏa thuận lương",
    });
  }
};

export default {
  createTeacherSubject,
  getAllTeacherSubjects,
  getTeacherSubjectById,
  updateTeacherSubject,
  deleteTeacherSubject,
  searchTeacherSubjects,
};
