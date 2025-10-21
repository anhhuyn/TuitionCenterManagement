import React, { useState, useEffect } from "react";
import {
    createAssignmentApi,
    updateAssignmentApi,
    getScheduleBySubjectId,
} from "../../util/api";
import "../../styles/classDetailViews/MaterialModal.css";

export default function AssignmentModal({
    onClose,
    onUploadSuccess,
    subjectId,
    editMode = false,
    initialData = null,
}) {
    const [title, setTitle] = useState(initialData?.title || "");
    const [description, setDescription] = useState(initialData?.description || "");
    const [dueDate, setDueDate] = useState(
        initialData?.dueDate
            ? new Date(initialData.dueDate).toISOString().slice(0, 16)
            : ""
    );
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [sessions, setSessions] = useState([]);
    const [selectedSessionId, setSelectedSessionId] = useState(initialData?.sessionId || "");

    // 🔹 Lấy danh sách session theo subjectId
    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const res = await getScheduleBySubjectId(subjectId);
                if (res?.sessions) {
                    setSessions(res.sessions);
                }
            } catch (err) {
                console.error("Lỗi khi lấy danh sách buổi học:", err);
            }
        };

        if (!editMode && subjectId) fetchSessions();
    }, [subjectId, editMode]);

    // 🔹 Xử lý submit form
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim()) {
            setError("Vui lòng nhập tiêu đề bài tập.");
            return;
        }
        if (!dueDate) {
            setError("Vui lòng chọn hạn nộp bài.");
            return;
        }
        if (!selectedSessionId) {
            setError("Vui lòng chọn buổi học.");
            return;
        }

        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("dueDate", dueDate);
        formData.append("sessionId", selectedSessionId);
        if (file) formData.append("file", file);

        try {
            setLoading(true);
            let res;
            if (editMode && initialData?.id) {
                res = await updateAssignmentApi(initialData.id, formData);
            } else {
                res = await createAssignmentApi(formData);
            }

            if (res) {
                const refreshed = await onUploadSuccess();
                onClose();
            }
        } catch (err) {
            console.error("Lỗi khi lưu bài tập:", err);
            setError(
                err.response?.data?.message ||
                err.message ||
                "Có lỗi xảy ra, vui lòng thử lại."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-box">
                <h3>{editMode ? "Cập nhật bài tập" : "Thêm bài tập mới"}</h3>

                <form onSubmit={handleSubmit} className="modal-form">
                    <label>Tiêu đề:</label>
                    <input
                        type="text"
                        className="modal-input"
                        placeholder="Nhập tiêu đề bài tập"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />

                    <label>Mô tả yêu cầu:</label>
                    <textarea
                        rows={4}
                        className="modal-input"
                        placeholder="Nhập mô tả chi tiết cho bài tập"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />

                    <label>Hạn nộp:</label>
                    <input
                        type="datetime-local"
                        className="modal-input"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                    />

                    {/* 🔹 Thêm dropdown chọn buổi học */}
                    {!editMode && (
                        <>
                            <label>Buổi học:</label>
                            <select
                                className="modal-input"
                                value={selectedSessionId}
                                onChange={(e) => setSelectedSessionId(e.target.value)}
                            >
                                <option value="">-- Chọn buổi học --</option>
                                {sessions.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.sessionDate} ({s.startTime} - {s.endTime}) - {s.Room?.name}
                                    </option>
                                ))}
                            </select>
                        </>
                    )}

                    <label>{editMode ? "Chọn file mới (nếu muốn):" : "File đính kèm:"}</label>
                    <input
                        type="file"
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.zip"
                        onChange={(e) => setFile(e.target.files[0])}
                    />

                    {error && <p className="error-msg">{error}</p>}

                    <div className="modal-actions">
                        <button type="button" className="cancel-btn" onClick={onClose}>
                            Hủy
                        </button>
                        <button type="submit" className="confirm-btn" disabled={loading}>
                            {loading ? "Đang xử lý..." : editMode ? "Cập nhật" : "Tạo mới"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
