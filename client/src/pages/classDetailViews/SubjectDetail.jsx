import React, { useState } from "react";
import "../../styles/classDetailViews/SubjectDetail.css";
import { cilPen } from "@coreui/icons";
import CIcon from "@coreui/icons-react";

export default function SubjectDetail({ classData }) {
    const teacher = classData.TeacherSubjects[0]?.Teacher?.User;
    const specialty = classData.TeacherSubjects[0]?.Teacher?.specialty || "Chưa cập nhật";

    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState({
        name: classData.name,
        grade: classData.grade,
        status: classData.status,
        sessionsPerWeek: classData.sessionsPerWeek,
        currentStudents: classData.currentStudents,
        maxStudents: classData.maxStudents,
        price: classData.price,
        note: classData.note || "",
        teacherName: teacher?.fullName || "",
        teacherEmail: teacher?.email || "",
        specialty: specialty,
    });

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

    const handleChange = (field, value) => {
        setEditedData({ ...editedData, [field]: value });
    };

    const handleUpdate = () => {
        console.log("Dữ liệu cần cập nhật:", editedData);
        // TODO: Gửi dữ liệu cập nhật lên API
        setIsEditing(false); // Tắt chế độ chỉnh sửa
    };

    return (
        <div className="subject-detail-container">
            {/* Nút chỉnh sửa nằm trên cùng góc phải */}
            <div className="top-edit-bar">
               <button className="edit-button" onClick={() => setIsEditing(!isEditing)}>
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

            <div className="row-line">
                <p>
                    <strong>Tên giáo viên:</strong>{" "}
                    {isEditing ? (
                        <input
                            value={editedData.teacherName}
                            onChange={(e) => handleChange("teacherName", e.target.value)}
                        />
                    ) : (
                        editedData.teacherName
                    )}
                </p>
                <p>
                    <strong>Chuyên môn:</strong>{" "}
                    {isEditing ? (
                        <input
                            value={editedData.specialty}
                            onChange={(e) => handleChange("specialty", e.target.value)}
                        />
                    ) : (
                        editedData.specialty
                    )}
                </p>
            </div>

            <div className="row-line">
                <p>
                    <strong>Email:</strong>{" "}
                    {isEditing ? (
                        <input
                            value={editedData.teacherEmail}
                            onChange={(e) => handleChange("teacherEmail", e.target.value)}
                        />
                    ) : (
                        editedData.teacherEmail
                    )}
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
                    <strong>Số học viên:</strong>{" "}
                    {isEditing ? (
                        <input
                            type="text"
                            value={`${editedData.currentStudents} / ${editedData.maxStudents}`}
                            onChange={(e) => {
                                const [cur, max] = e.target.value.split("/").map((n) => n.trim());
                                handleChange("currentStudents", cur);
                                handleChange("maxStudents", max);
                            }}
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

            {isEditing && (
                <div className="row-line" style={{ justifyContent: "flex-end" }}>
                    <button className="edit-button" onClick={handleUpdate}>
                        Cập nhật
                    </button>
                </div>
            )}
        </div>
    );
}
