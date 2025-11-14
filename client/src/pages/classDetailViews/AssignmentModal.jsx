import React, { useState, useEffect } from "react";
import {
    createAssignmentApi,
    updateAssignmentApi,
    getScheduleBySubjectId,
    assignToStudentsApi
} from "../../util/api";
import { FiUpload } from "react-icons/fi"; // icon upload
import "../../styles/classDetailViews/AssignmentModal.css";

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
    const [sessions, setSessions] = useState([]);
    const [selectedSessionId, setSelectedSessionId] = useState(initialData?.sessionId || "");

    // Lỗi riêng lẻ cho từng field
    const [errors, setErrors] = useState({
        title: "",
        dueDate: "",
        session: "",
    });

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const res = await getScheduleBySubjectId(subjectId);
                if (res?.sessions) setSessions(res.sessions);
            } catch (err) {
                console.error("Lỗi khi lấy danh sách buổi học:", err);
            }
        };
        if (!editMode && subjectId) fetchSessions();
    }, [subjectId, editMode]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Reset errors
        setErrors({ title: "", dueDate: "", session: "" });
        let hasError = false;

        if (!title.trim()) {
            setErrors((prev) => ({ ...prev, title: "Vui lòng nhập tiêu đề bài tập." }));
            hasError = true;
        }
        if (!dueDate) {
            setErrors((prev) => ({ ...prev, dueDate: "Vui lòng chọn hạn nộp bài." }));
            hasError = true;
        }
        if (!selectedSessionId) {
            setErrors((prev) => ({ ...prev, session: "Vui lòng chọn buổi học." }));
            hasError = true;
        }
        if (hasError) return;

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
                if (!editMode && res?.id) {
                    try {
                        await assignToStudentsApi(res.id);
                    } catch (err) {
                        console.error("Lỗi khi gán assignment:", err);
                    }
                }
                await onUploadSuccess();
                onClose();
            }
        } catch (err) {
            console.error("Lỗi khi lưu bài tập:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="assignment-modal-overlay">
            <div className="assignment-modal-box">
                <h2>{editMode ? "Cập nhật bài tập" : "Thêm bài tập mới"}</h2>

                <form onSubmit={handleSubmit} className="assignment-modal-body">
                    <label>
                        Tiêu đề: <span className="required">*</span>
                    </label>
                    <input
                        type="text"
                        placeholder="Nhập tiêu đề bài tập"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    {errors.title && <p className="assignment-modal-error">{errors.title}</p>}

                    <label>Mô tả yêu cầu:</label>
                    <textarea
                        rows={4}
                        placeholder="Nhập mô tả chi tiết cho bài tập"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />

                    <label>
                        Hạn nộp: <span className="required">*</span>
                    </label>
                    <input
                        type="datetime-local"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                    />
                    {errors.dueDate && <p className="assignment-modal-error">{errors.dueDate}</p>}

                    {!editMode && (
                        <>
                            <label>
                                Buổi học: <span className="required">*</span>
                            </label>
                            <select
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
                            {errors.session && <p className="assignment-modal-error">{errors.session}</p>}
                        </>
                    )}

                    <label>{editMode ? "Chọn file mới (nếu muốn):" : "File đính kèm:"}</label>
                    <div className="assignment-modal-file-container">
                        <input
                            type="file"
                            accept=".pdf,.doc,.docx,.ppt,.pptx,.zip"
                            className="assignment-modal-hidden-file-input"
                            onChange={(e) => setFile(e.target.files[0])}
                        />
                        <label className="assignment-modal-file-label">
                            <FiUpload style={{ marginRight: "6px" }} />
                            {file ? file.name : "Chọn file..."}
                        </label>
                    </div>

                    <div className="assignment-modal-footer">
                        <button
                            type="button"
                            className="assignment-modal-cancel-btn"
                            onClick={onClose}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="assignment-modal-confirm-btn"
                            disabled={loading}
                        >
                            {loading ? "Đang xử lý..." : editMode ? "Cập nhật" : "Tạo mới"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
