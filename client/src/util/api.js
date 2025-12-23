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
    withCredentials: true,
  });
};
const getSubjectsApi = async ({ page = 1, limit = 12, status = null } = {}) => {
  const params = { page, limit };
  if (status) params.status = status;
  const res = await axios.get("/v1/api/subjects", { params });
  return res;
};

// Lấy tất cả subjects (KHÔNG phân trang)
const getAllSubjectsApi = async ({ status = null } = {}) => {
  const params = {};
  if (status) params.status = status;

  const res = await axios.get("/v1/api/subjects/all", { params });
  return res;
};


// Lấy danh sách môn học theo userId của giáo viên
const getSubjectsByTeacherApi = async ({
  userId,
  page = 1,
  limit = 12,
  status = null
} = {}) => {

  if (!userId) throw new Error("userId is required");

  const params = { page, limit };
  if (status) params.status = status;

  const res = await axios.get(`/v1/api/subjects/teacher/${userId}`, { params });
  return res; // interceptor sẽ trả về res.data
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
// 📅 1. Lấy danh sách lương theo tháng & năm
// Backend: GET /v1/api/payments/list?month=X&year=Y
const getTeacherPaymentsByMonth = (month, year) => {
  return axios.get("/v1/api/payments/list", {
    params: { month, year }
  });
};

// 💾 2. Tạo bảng lương
// Backend: POST /v1/api/payments/create?month=X&year=Y&notes=Z
// Lưu ý: Backend dùng @RequestParam nên phải gửi qua `params`, body để null
const createTeacherPayments = (data) => {
  // data = { month, year, notes }
  return axios.post("/v1/api/payments/create", null, {
    params: data
  });
};

// 🔍 3. Lấy chi tiết lương 1 giáo viên
// Backend: GET /v1/api/payments/detail?teacherId=X&month=Y&year=Z
const getTeacherSalaryDetail = (teacherId, month, year) => {
  return axios.get("/v1/api/payments/detail", {
    params: { teacherId, month, year }
  });
};

// 💸 4. Thanh toán lương giáo viên
// Backend: POST /v1/api/payments/pay (Body: { teacherId, month, year })
const payTeacherSalary = (data) => {
  // data = { teacherId, month, year }
  return axios.post("/v1/api/payments/pay", data);
};

// Thông báo
const getAnnouncementsApi = async ({ page = 0, limit = 10 } = {}) => {
  try {
    const res = await axios.get('/v1/api/announcements', { params: { page, size: limit } });
    return res; // interceptor của axios đã trả về res.data
  } catch (err) {
    console.error('Error fetching announcements:', err);
    return { content: [], last: true }; // trả về giống server nếu lỗi
  }
};


const createAnnouncementApi = async (formData) => {
  try {
    const res = await axios.post('/v1/api/announcements', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res; // axios interceptor sẽ trả res.data
  } catch (err) {
    console.error('Error creating announcement:', err);
    return { success: false, error: err.response?.data || err.message };
  }
};

const updateAnnouncementApi = async (id, formData) => {
  try {
    const res = await axios.put(`/v1/api/announcements/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res;
  } catch (err) {
    console.error("Error updating announcement:", err);
    return { success: false, error: err.response?.data || err.message };
  }
};

const deleteAnnouncementApi = async (id) => {
  try {
    const res = await axios.delete(`/v1/api/announcements/${id}`);
    return res;
  } catch (err) {
    console.error('Error deleting announcement:', err);
    return { success: false, error: err.response?.data || err.message };
  }
};

// Lấy lịch phòng theo roomId và khoảng ngày
const getRoomScheduleApi = async (roomId, startDate, endDate) => {
  try {
    const res = await axios.get(`/v1/api/rooms/${roomId}/schedule`, {
      params: {
        startDate, // yyyy-MM-dd
        endDate    // yyyy-MM-dd
      }
    });
    return res; // nếu dùng instance.interceptors.response như bạn thì res.data đã là data
  } catch (err) {
    console.error('Error fetching room schedule:', err);
    return { success: false, error: err.response?.data || err.message };
  }
};

// Tạo phòng
export const createRoomApi = async (room) => {
  const res = await axios.post("/v1/api/rooms", room);
  return res.data;
  // res.data = { message, data: room }
};

// Cập nhật phòng
export const updateRoomApi = async (roomId, room) => {
  const res = await axios.put(`/v1/api/rooms/${roomId}`, room);
  return res.data;
};


// Xóa phòng
export const deleteRoomApi = async (roomId) => {
  const res = await axios.delete(`/v1/api/rooms/${roomId}`);
  return res.data;
};

/**
 * Lấy lịch dạy của giáo viên theo teacherId và khoảng ngày
 * @param {number} teacherId 
 * @param {string} startDate - yyyy-MM-dd
 * @param {string} endDate - yyyy-MM-dd
 * @returns {Promise<Object>} - mảng TeacherScheduleDTO
 */
export const getTeacherScheduleApi = async (teacherId, startDate, endDate) => {
  try {
    const res = await axios.get(`/v1/api/teachers/${teacherId}/schedule`, {
      params: {
        startDate,
        endDate
      }
    });
    return res; // nếu dùng interceptors.response thì res đã là data
  } catch (err) {
    console.error('Error fetching teacher schedule:', err);
    return { success: false, error: err.response?.data || err.message };
  }
};

// Lấy danh sách điểm danh giáo viên theo subject
const getTeacherAttendanceBySubjectApi = async (subjectId) => {
  return await axios.get(`/v1/api/teacher-attendance/subject/${subjectId}/teacher-attendance`);
};

// Cập nhật trạng thái điểm danh giáo viên
const updateTeacherAttendanceStatusApi = async (sessionId, teacherId, status) => {
  return await axios.put(`/v1/api/teacher-attendance/teacher-attendance/status`, {
    sessionId,
    teacherId,
    status
  });
};

// Cập nhật ghi chú điểm danh giáo viên
const updateTeacherAttendanceNoteApi = async (sessionId, teacherId, note) => {
  return await axios.put(`/v1/api/teacher-attendance/teacher-attendance/note`, {
    sessionId,
    teacherId,
    note
  });
};

// Lấy danh sách buổi học (môn học) theo ngày
const getSessionsByDateApi = async (date) => {
  return await axios.get(`/v1/api/session/daily`, {
    params: { date }
  });
};

// Lấy danh sách học sinh group theo trường + tổng số
const getStudentsGroupBySchoolApi = async (params = {}) => {
  return await axios.get('/v1/api/students/group-by-school', {
    params: {
      name: params.name,
      grade: params.grade,
      schoolName: params.schoolName,
      gender: params.gender
    }
  });
};

// Lấy danh sách học sinh đi trễ hoặc vắng trong khoảng thời gian
const getAbsentOrLateStudentsApi = async (startDate, endDate) => {
  return await axios.get('/v1/api/attendance/absent-or-late', {
    params: { startDate, endDate }
  });
};

export {
  getAbsentOrLateStudentsApi,
  getStudentsGroupBySchoolApi,
  getSessionsByDateApi,
  getTeacherAttendanceBySubjectApi,
  updateTeacherAttendanceStatusApi,
  updateTeacherAttendanceNoteApi,
  getSubjectsByTeacherApi,
  getRoomScheduleApi,
  deleteAnnouncementApi,
  updateAnnouncementApi,
  createAnnouncementApi,
  getAnnouncementsApi,
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
  addStudentToSubjectApi, getStudentsByGradeApi, removeStudentFromSubjectApi, getStudentsBySubjectIdApi, getTeacherBasicListApi, updateSubjectApi, updateImageApi, verifyEmailChangeOtpApi, updateProfileApi, registerApi, verifyRegisterOtpApi, loginApi, getUserApi, getAuthMe, fetchUserFromToken, forgotPasswordApi, verifyOtpApi, resetPasswordApi, getSubjectsApi, getAllSubjectsApi,
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

