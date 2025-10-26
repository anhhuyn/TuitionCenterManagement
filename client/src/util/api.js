import axios from "./axios.customize";
import { loginSuccess, setLoading } from '../store/authSlice';

// Đăng ký (gửi OTP về email)
const registerApi = (data) => {
  const URL_API = "/v1/api/register";
  // Truyền toàn bộ đối tượng data vào body của request
  return axios.post(URL_API, data);
};

// Xác thực OTP
const verifyRegisterOtpApi = (email, otp) => {
  const URL_API = "/v1/api/verify-otp";
  return axios.post(URL_API, { email, otp });
};

// Đăng nhập
const loginApi = (email, password) => {
  const URL_API = "/v1/api/login";
  return axios.post(URL_API, { email, password });
};

// Lấy thông tin user
const getUserApi = () => {
  return axios.get("/v1/api/profile");
};

// Lấy thông tin người dùng qua token
const getAuthMe = () => {
  return axios.get("/v1/api/auth/me");
};

//Quên mật khẩu
const forgotPasswordApi = (email) => {
  return axios.post("/v1/api/forgot-password", { email });
};

const verifyOtpApi = (email, otp) => {
  return axios.post("/v1/api/forgot-password/verify-otp", { email, otp });
};

const resetPasswordApi = (email, otp, newPassword) => {
  return axios.post("/v1/api/reset-password", { email, otp, newPassword });
};

const fetchUserFromToken = async (dispatch) => {
  dispatch(setLoading(true));

  try {
    const res = await axios.get("/v1/api/auth/me", { withCredentials: true });
    if (res && res.user) {
      dispatch(loginSuccess(res.user));
    } else {
      dispatch(setLoading(false));
    }
  } catch (error) {
    dispatch(setLoading(false));
  }
};

const updateProfileApi = (formData) => {
  const URL_API = "/v1/api/profile/update";
  return axios.post(URL_API, formData);
};

const verifyEmailChangeOtpApi = (otp) => {
  // Gọi endpoint verify otp cho email đổi mới
  return axios.post("/v1/api/profile/verify-email-otp", { otp });
};

const updateImageApi = (file) => {
  const formData = new FormData();
  formData.append("image", file);

  return axios.put("/v1/api/profile/image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
const getSubjectsApi = async ({ page = 1, limit = 15, status = null } = {}) => {
  const params = { page, limit };
  if (status) params.status = status;
  const res = await axios.get("/v1/api/subjects", { params });
  return res;
};

const createSubjectApi = async (formData) => {
  try {
    const res = await axios.post("/v1/api/subjects", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res; // interceptor đã xử lý trả về res.data
  } catch (error) {
    console.error("Lỗi API createSubjectApi:", error);
    throw error;
  }
};

// Xóa môn học theo id
const deleteSubjectApi = async (id) => {
  try {
    const res = await axios.delete(`/v1/api/subjects/${id}`);
    return res; // interceptor đã xử lý trả về res.data
  } catch (error) {
    console.error("Lỗi API deleteSubjectApi:", error);
    throw error;
  }
};

// Lấy danh sách giáo viên cơ bản
const getTeacherBasicListApi = async () => {
  const res = await axios.get("/v1/api/teachers/basic");
  return res;
};

const updateSubjectApi = (id, updatedData) => {
  return axios.put(`/v1/api/subjects/${id}`, updatedData);
};

const getStudentsBySubjectIdApi = async (subjectId) => {
  try {
    const res = await axios.get(`/v1/api/subject-students/${subjectId}`);
    if (res && Array.isArray(res.data)) {
      return res.data;
    }
  } catch (error) {
    console.error("Lỗi API getStudentsBySubjectIdApi:", error);
    return [];
  }
};
const removeStudentFromSubjectApi = async (studentId, subjectId) => {
  const response = await axios.delete(`v1/api/subject-students`, {
    data: {
      studentId,
      subjectId,
    },
  });
  return response.data;
};
const getStudentsByGradeApi = async (grade) => {
  try {
    const res = await axios.get(`/v1/api/students/by-grade/${grade}`);
    return Array.isArray(res?.data) ? res.data : [];
  } catch (err) {
    console.error("getStudentsByGradeApi error:", err);
    return [];
  }
};

const addStudentToSubjectApi = async (studentId, subjectId, enrollmentDate = null) => {
  try {
    const res = await axios.post("/v1/api/subject-students", {
      studentId,
      subjectId,
      enrollmentDate,
    });
    return res.data;
  } catch (err) {
    console.error("addStudentToSubjectApi error:", err);
    throw err;
  }
};

// Lấy danh sách phòng
const getRoomsApi = async () => {
  const res = await axios.get("/v1/api/rooms");
  return res.data || [];
};

// Tạo buổi học thủ công
const createManualSessionApi = async (subjectId, formData) => {
  const body = { subjectId, ...formData };
  const res = await axios.post("/v1/api/manual-session", body);
  return res;
};

const getScheduleBySubjectId = async (subjectId) => {
  try {
    const res = await axios.get(`/v1/api/schedule/${subjectId}`);
    return res;
  } catch (error) {
    console.error("Lỗi API getScheduleBySubjectId:", error);
    return null;
  }
};

// Xóa một buổi học (session) theo id
const deleteSessionApi = async (sessionId) => {
  const res = await axios.delete(`/v1/api/session/${sessionId}`);
  return res;
};

// Lấy chi tiết một session theo id
const fetchSessionById = async (sessionId) => {
  try {
    const res = await axios.get(`/v1/api/session/${sessionId}`);
    return res.session;
  } catch (error) {
    console.error("Lỗi lấy chi tiết session:", error);
    throw error;
  }
};

//Chỉnh sửa một session
const updateSessionApi = (sessionId, updatedData) => {
  return axios.put(`/v1/api/session/${sessionId}`, updatedData);
};

const createSessionApi = (data) =>
  axios.post(`/v1/api/manual-session`, data);


const getAttendanceBySubjectIdApi = async (subjectId) => {
  return await axios.get(`/v1/api/subject/${subjectId}/attendance`);
};

// Cập nhật trạng thái điểm danh
const updateAttendanceStatusApi = async (sessionId, studentId, status) => {
  return await axios.put(`/v1/api/attendance/status`, { sessionId, studentId, status });
};

// Cập nhật ghi chú điểm danh
const updateAttendanceNoteApi = async (sessionId, studentId, note) => {
  return await axios.put(`/v1/api/attendance/note`, { sessionId, studentId, note });
};

// lấy tài liệu theo môn học
const getMaterialsBySubjectIdApi = async (subjectId) => {
  try {
    const res = await axios.get(`/v1/api/materials/subject/${subjectId}`);
    return res; // đã được xử lý interceptor nên là res.data
  } catch (err) {
    console.error("Lỗi khi gọi API getMaterialsBySubjectIdApi:", err);
    return { success: false, data: [] };
  }
};

// Thêm mới tài liệu
const createMaterialApi = async (formData) => {
  try {
    const res = await axios.post("/v1/api/materials", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res; // interceptor đã xử lý sẵn .data
  } catch (err) {
    console.error("Lỗi khi gọi API createMaterialApi:", err);
    throw err;
  }
};

const updateMaterialApi = async (materialId, formData) => {
  const res = await axios.put(`/v1/api/materials/${materialId}/file`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res;
};

const deleteMaterialApi = (materialId) => {
  return axios.delete(`/v1/api/materials/${materialId}`);
};

const getAssignmentsBySubjectIdApi = async (subjectId) => {
  try {
    const res = await axios.get(`/v1/api/assignments/subject/${subjectId}`);
    return res.data || [];
  } catch (error) {
    console.error("Lỗi API getAssignmentsBySubjectIdApi:", error);
    return [];
  }
};

// Xóa bài tập theo ID
const deleteAssignmentApi = async (assignmentId) => {
  try {
    const res = await axios.delete(`/v1/api/assignments/${assignmentId}`);
    return res.data;
  } catch (error) {
    console.error("Lỗi API deleteAssignmentApi:", error);
    throw error;
  }
};

// Tạo mới assignment
const createAssignmentApi = async (formData) => {
  try {
    const res = await axios.post(`/v1/api/assignments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data;
  } catch (error) {
    console.error("Lỗi API createAssignmentApi:", error);
    throw error;
  }
};

// Cập nhật assignment
const updateAssignmentApi = async (assignmentId, formData) => {
  try {
    const res = await axios.put(`/v1/api/assignments/${assignmentId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data;
  } catch (error) {
    console.error("Lỗi API updateAssignmentApi:", error);
    throw error;
  }
};

const getSubjectByIdApi = async (id) => {
    return await axios.get(`/v1/api/subjects/${id}`);
};

// Gán assignment cho học sinh theo assignmentId
const assignToStudentsApi = async (assignmentId) => {
  try {
    const res = await axios.post(`/v1/api/assign/${assignmentId}`);
    return res;
  } catch (error) {
    console.error("Lỗi API assignToStudentsApi:", error);
    throw error;
  }
};

// Lấy danh sách học sinh đã được gán assignment
const getStudentAssignmentsByAssignmentIdApi = async (assignmentId) => {
  try {
    const res = await axios.get(`/v1/api/by-assignment/${assignmentId}`);
    return res;
  } catch (error) {
    console.error("Lỗi API getStudentAssignmentsByAssignmentIdApi:", error);
    throw error;
  }
};

const updateStudentAssignmentApi = async (assignmentId, data) => {
  try {
    const res = await axios.put(`/v1/api/assign/update/${assignmentId}`, data);
    return res;
  } catch (error) {
    console.error("Lỗi API updateStudentAssignmentApi:", error);
    throw error;
  }
};
// Lấy danh sách thỏa thuận (teacher-subject)
const getAllTeacherSubjectsApi = async () => {
  try {
    const res = await axios.get("/v1/api/teacher-subjects");
    return res.data || [];
  } catch (err) {
    console.error("Lỗi khi gọi API getAllTeacherSubjectsApi:", err);
    return [];
  }
};
const getTeacherSubjectByIdApi = async (id) => {
  try {
    const res = await axios.get(`/v1/api/teacher-subjects/${id}`);
    return res;
  } catch (err) {
    console.error("Lỗi khi gọi API getTeacherSubjectByIdApi:", err);
    throw err;
  }
};

const createTeacherSubjectApi = async (data) => {
  try {
    const res = await axios.post("/v1/api/teacher-subjects", data);
    return res.data;
  } catch (err) {
    console.error("Lỗi khi gọi API createTeacherSubjectApi:", err);
    throw err; // Quan trọng: ném lỗi ra ngoài để component có thể bắt và hiển thị thông báo trùng lặp (409)
  }
};
// Cập nhật thỏa thuận (teacher-subject)
const updateTeacherSubjectApi = async (id, data) => {
  try {
    const res = await axios.put(`/v1/api/teacher-subjects/${id}`, data);
    return res.data;
  } catch (err) {
    console.error("Lỗi khi gọi API updateTeacherSubjectApi:", err);
    throw err; // Ném lỗi ra để component có thể bắt
  }
};

// 📅 Lấy danh sách lương theo tháng & năm
const getTeacherPaymentsByMonth = (month, year) => {
  return axios.get(`/v1/api/teacher-payments?month=${month}&year=${year}`);
};

// 💾 Tạo bảng lương
const createTeacherPayments = (data) => {
  return axios.post("/v1/api/teacher-payments", data);
};

// 🔍 Lấy chi tiết lương 1 giáo viên
const getTeacherSalaryDetail = (teacherId, month, year) => {
  return axios.get(`/v1/api/teacher-payments/${teacherId}?month=${month}&year=${year}`);
};

// 💰 Thanh toán lương giáo viên
const payTeacherSalary = (teacherId, month, year) => {
  return axios.put(`/v1/api/teacher-payments/${teacherId}/pay`, { month, year });
};

export {
  createSubjectApi, deleteSubjectApi,
  getSubjectByIdApi,
  createAssignmentApi,
  updateAssignmentApi,
  deleteAssignmentApi,
  getAssignmentsBySubjectIdApi,
  deleteMaterialApi,
  updateMaterialApi,
  createMaterialApi,
  getMaterialsBySubjectIdApi,
  updateAttendanceStatusApi,
  updateAttendanceNoteApi,
  getAttendanceBySubjectIdApi,
  createSessionApi,
  updateSessionApi,
  fetchSessionById,
  deleteSessionApi,
  getScheduleBySubjectId,
  getRoomsApi,
  createManualSessionApi,
  addStudentToSubjectApi, getStudentsByGradeApi, removeStudentFromSubjectApi, getStudentsBySubjectIdApi, getTeacherBasicListApi, updateSubjectApi, updateImageApi, verifyEmailChangeOtpApi, updateProfileApi, registerApi, verifyRegisterOtpApi, loginApi, getUserApi, getAuthMe, fetchUserFromToken, forgotPasswordApi, verifyOtpApi, resetPasswordApi, getSubjectsApi,
  updateStudentAssignmentApi,
  assignToStudentsApi,
  getStudentAssignmentsByAssignmentIdApi,
  getAllTeacherSubjectsApi,
  getTeacherSubjectByIdApi,
  createTeacherSubjectApi,
  updateTeacherSubjectApi,

  getTeacherPaymentsByMonth,
  createTeacherPayments,
  getTeacherSalaryDetail,
  payTeacherSalary,
};

