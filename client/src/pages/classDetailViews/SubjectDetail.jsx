import React, { useState, useEffect } from "react";
import "../../styles/classDetailViews/SubjectDetail.css";
import { cilPen } from "@coreui/icons";
import CIcon from "@coreui/icons-react";
import { getSubjectByIdApi, getTeacherBasicListApi, updateSubjectApi } from "../../util/api";
import ConfirmModal from "../../components/modal/ConfirmModal";
import { useParams } from "react-router-dom";

export default function SubjectDetail() {
    const { id } = useParams();
    const [classData, setClassData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [employeeList, setEmployeeList] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const getInitialEditedData = (data) => {
        const teacher = data.TeacherSubjects[0]?.Teacher || null;
        const userInfo = teacher?.userInfo || null;
        const specialty = teacher?.specialty || "Chưa cập nhật";

        return {
            name: data.name,
            grade: data.grade,
            status: data.status,
            sessionsPerWeek: data.sessionsPerWeek,
            currentStudents: data.currentStudents,
            maxStudents: data.maxStudents,
            price: data.price,
            note: data.note || "",
            teacherId: teacher?.id || "",
            teacherName: userInfo?.fullName || "",
            teacherEmail: userInfo?.email || "",
            specialty,
            teacherGender:
                userInfo?.gender === true
                    ? "Nam"
                    : userInfo?.gender === false
                        ? "Nữ"
                        : "Chưa cập nhật",
            teacherPhone: userInfo?.phoneNumber || "",
        };
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "active":
                return "status-active";
            case "upcoming":
                return "status-upcoming";
            default:
                return "status-ended";
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case "active":
                return "Đang diễn ra";
            case "upcoming":
                return "Sắp diễn ra";
            default:
                return "Kết thúc";
        }
    };

   
    useEffect(() => {
        setLoading(true);
        setClassData(null); 

        const fetchSubjectDetail = async () => {
            try {
                const res = await getSubjectByIdApi(id);
                if (res.success && res.data) {
                    setClassData(res.data);
                    setEditedData(getInitialEditedData(res.data));
                } else {
                    console.error("Không có dữ liệu môn học hoặc API thất bại.");
                }
            } catch (err) {
                console.error("Lỗi khi tải chi tiết môn học:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSubjectDetail();
    }, [id]); 

    useEffect(() => {
        if (isEditing) {
            const fetchTeachers = async () => {
                try {
                    const res = await getTeacherBasicListApi();
                    console.log("Dữ liệu giáo viên từ API:", res);
                    if (res.errCode === 0) {
                        setEmployeeList(res.data);
                    }
                } catch (error) {
                    console.error("Lỗi khi lấy danh sách giáo viên:", error);
                }
            };

            fetchTeachers();
        }
    }, [isEditing]);

    const handleTeacherChange = (teacherId) => {
        if (!teacherId) {
            setEditedData({
                ...editedData,
                teacherId: null,
                teacherName: "Chưa sắp xếp",
                teacherEmail: "",
                specialty: "",
                teacherPhone: "",
                teacherGender: "Chưa cập nhật",
            });
            return;
        }
        const selected = employeeList.find(emp => emp.id === parseInt(teacherId));
        if (selected) {
            setEditedData({
                ...editedData,
                teacherId: selected.id,
                teacherName: selected.fullName,
                teacherEmail: selected.email,
                specialty: selected.specialty || "",
                teacherPhone: selected.phoneNumber || "",
                teacherGender:
                    selected.gender === true
                        ? "Nam"
                        : selected.gender === false
                            ? "Nữ"
                            : "Chưa cập nhật",
            });
        }
    };

    const handleChange = (field, value) => {
        setEditedData({ ...editedData, [field]: value });
    };

    const handleUpdate = async () => {
        try {
            const payload = {
                name: editedData.name,
                grade: editedData.grade,
                status: editedData.status,
                sessionsPerWeek: parseInt(editedData.sessionsPerWeek),
                maxStudents: parseInt(editedData.maxStudents),
                price: parseFloat(editedData.price),
                note: editedData.note,
                teacherId: editedData.teacherId ? editedData.teacherId : null,
            };

            const res = await updateSubjectApi(classData.id, payload);
            setIsEditing(false);
        } catch (error) {
            console.error("Lỗi khi cập nhật môn học:", error);
            alert("Cập nhật thất bại. Vui lòng thử lại.");
        }
    };

    if (loading) return <div className="loading-text">Đang tải dữ liệu...</div>;
    if (!classData) return <div className="error-text">Không tìm thấy môn học</div>;

    return (
        <div className="subject-detail-container">
            {/* Nút chỉnh sửa nằm trên cùng góc phải */}
            <div className="top-edit-bar">
                <button
                    className="edit-button"
                    onClick={() => {
                        if (isEditing) {
                            setEditedData(getInitialEditedData(classData)); // reset về dữ liệu gốc
                        }
                        setIsEditing(!isEditing);
                    }}
                >
                    <CIcon icon={cilPen} className="me-1" /> {isEditing ? "Hủy" : "Chỉnh sửa"}
                </button>
            </div>

            {/* Dòng 1: Thông tin cơ bản */}
            <div className="section-header">Thông tin cơ bản</div>
            {/* Dòng 2 */}
            <div className="row-line">
                <p>
                    <strong>Môn học:</strong>{" "}
                    {isEditing ? (
                        <input
                            value={editedData.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                        />
                    ) : (
                        editedData.name
                    )}
                </p>
                <p>
                    <strong>Khối lớp:</strong>{" "}
                    {isEditing ? (
                        <input
                            value={editedData.grade}
                            onChange={(e) => handleChange("grade", e.target.value)}
                        />
                    ) : (
                        editedData.grade
                    )}
                </p>
                <p>
                    <strong>Trạng thái:</strong>{" "}
                    {isEditing ? (
                        <select
                            value={editedData.status}
                            onChange={(e) => handleChange("status", e.target.value)}
                        >
                            <option value="active">Đang diễn ra</option>
                            <option value="upcoming">Sắp diễn ra</option>
                            <option value="ended">Kết thúc</option>
                        </select>
                    ) : (
                        <span className={getStatusClass(editedData.status)}>
                            {getStatusText(editedData.status)}
                        </span>
                    )}
                </p>
            </div>

            {/* Dòng 3: Thông tin giáo viên */}
            <div className="section-header">Thông tin giáo viên</div>

            {/* Hàng 1: Tên + Chuyên môn */}
            <div className="row-line">
                <p>
                    <strong>Tên giáo viên:</strong>{" "}
                    {isEditing ? (
                        <select
                            value={editedData.teacherId || ""}
                            onChange={(e) => handleTeacherChange(e.target.value)}
                        >
                            <option value="">-- Chưa sắp xếp --</option>
                            {employeeList.map(emp => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.fullName}
                                </option>
                            ))}
                        </select>
                    ) : (
                        editedData.teacherName
                    )}
                </p>

                <p>
                    <strong>Chuyên môn:</strong> {editedData.specialty}
                </p>
            </div>

            {/* Hàng 2: Email + Số điện thoại */}
            <div className="row-line">
                <p>
                    <strong>Email:</strong> {editedData.teacherEmail}
                </p>

                <p>
                    <strong>Số điện thoại:</strong> {editedData.teacherPhone}
                </p>
            </div>

            {/* Hàng 3: Giới tính */}
            <div className="row-line">
                <p>
                    <strong>Giới tính:</strong> {editedData.teacherGender}
                </p>
            </div>

            {/* Dòng 6: Thông tin học tập */}
            <div className="section-header">Thông tin học tập</div>

            <div className="row-line">
                <p>
                    <strong>Số buổi/tuần:</strong>{" "}
                    {isEditing ? (
                        <input
                            type="number"
                            value={editedData.sessionsPerWeek}
                            onChange={(e) => handleChange("sessionsPerWeek", e.target.value)}
                        />
                    ) : (
                        editedData.sessionsPerWeek
                    )}
                </p>
                <p>
                    <strong>{isEditing ? "Số học viên tối đa:" : "Số học viên:"}</strong>{" "}
                    {isEditing ? (
                        <input
                            type="number"
                            value={editedData.maxStudents}
                            onChange={(e) => handleChange("maxStudents", e.target.value)}
                            min={editedData.currentStudents || 0}
                        />
                    ) : (
                        `${editedData.currentStudents} / ${editedData.maxStudents}`
                    )}
                </p>
                <p>
                    <strong>Học phí:</strong>{" "}
                    {isEditing ? (
                        <input
                            type="number"
                            value={editedData.price}
                            onChange={(e) => handleChange("price", e.target.value)}
                        />
                    ) : (
                        Number(editedData.price).toLocaleString() + " VNĐ"
                    )}
                </p>
            </div>

            <div className="row-line">
                <p style={{ flex: 1 }}>
                    <strong>Ghi chú:</strong>{" "}
                    {isEditing ? (
                        <textarea
                            value={editedData.note}
                            onChange={(e) => handleChange("note", e.target.value)}
                            rows={3}
                            style={{ width: "100%" }}
                        />
                    ) : (
                        editedData.note || "Không có ghi chú"
                    )}
                </p>
            </div>

            {
                isEditing && (
                    <div className="row-line" style={{ justifyContent: "flex-end" }}>
                        <button
                            className="edit-button"
                            onClick={() => setShowConfirmModal(true)} //  mở modal
                        >
                            Cập nhật
                        </button>
                    </div>
                )
            }
            {showConfirmModal && (
                <ConfirmModal
                    title="Xác nhận cập nhật"
                    message="Bạn có chắc chắn muốn cập nhật thông tin môn học này?"
                    cancelText="Hủy"
                    confirmText="Xác nhận"
                    onCancel={() => setShowConfirmModal(false)}
                    onConfirm={() => {
                        handleUpdate();
                        setShowConfirmModal(false);
                    }}
                />
            )}
        </div >
    );
}
