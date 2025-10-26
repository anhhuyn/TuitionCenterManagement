import React, { useEffect, useState } from "react";
import "../styles/ClassModal.css";
import { getTeacherBasicListApi, createSubjectApi } from "../util/api";
import ConfirmModal from "../components/modal/ConfirmModal";
import { FiBookOpen, FiMail, FiPhone, FiUser } from "react-icons/fi";


export default function ClassModal({ show, onClose, onSuccess }) {
    const [teachers, setTeachers] = useState([]);
    const [formData, setFormData] = useState({
        name: "",
        grade: "",
        sessionsPerWeek: 1,
        maxStudents: 10,
        price: "",
        note: "",
        status: "upcoming",
        teacherId: "",
        image: null,
    });
    const [teacherInfo, setTeacherInfo] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);

    // Lấy danh sách giáo viên khi mở modal
    useEffect(() => {
        if (show) {
            const fetchTeachers = async () => {
                try {
                    const res = await getTeacherBasicListApi();
                    if (res.errCode === 0) {
                        setTeachers(res.data);
                    }
                } catch (err) {
                    console.error("Lỗi khi tải danh sách giáo viên:", err);
                }
            };
            fetchTeachers();
        }
    }, [show]);

    const handleTeacherChange = (teacherId) => {
        const selected = teachers.find((t) => t.id === parseInt(teacherId));
        setFormData({ ...formData, teacherId });
        setTeacherInfo(selected || null);
    };

    const handleChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleConfirm = async () => {
        try {
            const payload = {
                ...formData,
                sessionsPerWeek: parseInt(formData.sessionsPerWeek),
                maxStudents: parseInt(formData.maxStudents),
                price: parseFloat(formData.price),
            };

            const res = await createSubjectApi(payload);
            if (res.success) {
                onSuccess();
                onClose();
            } else {
                alert("Thêm lớp thất bại!");
            }
        } catch (err) {
            console.error("Lỗi khi thêm lớp:", err);
            alert("Có lỗi xảy ra khi thêm lớp.");
        }
    };

    if (!show) return null;

    return (
        <div className="modal-overlay">
            <div className="class-modal">
                <h2>Thêm lớp học mới</h2>

                <div className="modal-body">
                    <label>Tên lớp:</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                    />

                    <label>Khối lớp:</label>
                    <input
                        type="text"
                        value={formData.grade}
                        onChange={(e) => handleChange("grade", e.target.value)}
                    />

                    <label>Trạng thái:</label>
                    <select
                        value={formData.status}
                        onChange={(e) => handleChange("status", e.target.value)}
                    >
                        <option value="upcoming">Sắp diễn ra</option>
                        <option value="active">Đang diễn ra</option>
                        <option value="ended">Kết thúc</option>
                    </select>

                    <label>Giáo viên phụ trách:</label>
                    <select
                        value={formData.teacherId}
                        onChange={(e) => handleTeacherChange(e.target.value)}
                    >
                        <option value="">-- Chưa sắp xếp --</option>
                        {teachers.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.fullName}
                            </option>
                        ))}
                    </select>

                    {teacherInfo && (
                        <div className="teacher-info">
                            <p><FiBookOpen style={{ marginRight: 6 }} /><b>Chuyên môn:</b> {teacherInfo.specialty || "Chưa cập nhật"}</p>
                            <p><FiMail style={{ marginRight: 6 }} /><b>Email:</b> {teacherInfo.email}</p>
                            <p><FiPhone style={{ marginRight: 6 }} /><b>SĐT:</b> {teacherInfo.phoneNumber}</p>
                            <p><FiUser style={{ marginRight: 6 }} /><b>Giới tính:</b>{" "}
                                {teacherInfo.gender === true ? "Nam" :
                                    teacherInfo.gender === false ? "Nữ" : "Chưa cập nhật"}
                            </p>
                        </div>
                    )}

                    <label>Số buổi/tuần:</label>
                    <input
                        type="number"
                        min="1"
                        value={formData.sessionsPerWeek}
                        onChange={(e) => handleChange("sessionsPerWeek", e.target.value)}
                    />

                    <label>Số học viên tối đa:</label>
                    <input
                        type="number"
                        min="1"
                        value={formData.maxStudents}
                        onChange={(e) => handleChange("maxStudents", e.target.value)}
                    />

                    <label>Học phí (VNĐ):</label>
                    <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => handleChange("price", e.target.value)}
                    />

                    <label>Ảnh minh họa lớp học:</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleChange("image", e.target.files[0])}
                    />

                    <label>Ghi chú:</label>
                    <textarea
                        rows="3"
                        value={formData.note}
                        onChange={(e) => handleChange("note", e.target.value)}
                    />
                </div>

                <div className="modal-footer">
                    <button className="cancel-btn" onClick={onClose}>
                        Hủy
                    </button>
                    <button className="confirm-btn" onClick={() => setShowConfirm(true)}>
                        Lưu
                    </button>
                </div>

                {showConfirm && (
                    <ConfirmModal
                        title="Xác nhận thêm lớp"
                        message="Bạn có chắc chắn muốn thêm lớp học này?"
                        cancelText="Hủy"
                        confirmText="Xác nhận"
                        onCancel={() => setShowConfirm(false)}
                        onConfirm={() => {
                            handleConfirm();
                            setShowConfirm(false);
                        }}
                    />
                )}
            </div>
        </div>
    );
}
