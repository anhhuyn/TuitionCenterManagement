import React, { useState } from "react";
import "../styles/AddAnnouncementModal.css";

export default function AddAnnouncementModal({ visible, onClose, onAdd, adminId, adminAvatar, adminName }) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [status, setStatus] = useState("active");
    const [imageFile, setImageFile] = useState(null);
    const [attachmentFiles, setAttachmentFiles] = useState([]);
    const [imagePreview, setImagePreview] = useState(null);
    const [attachmentNames, setAttachmentNames] = useState([]);

    const handleSubmit = () => {
        if (!title.trim() || !content.trim()) {
            alert("Nhập đầy đủ tiêu đề và nội dung bài viết");
            return;
        }
        if (!adminId) {
            alert("Chưa lấy được adminId");
            return;
        }
        onAdd({ adminId, title, content, status, imageFile, attachmentFiles });
    };

    const handleClose = () => {
        setTitle("");
        setContent("");
        setStatus("active");
        setImageFile(null);
        setAttachmentFiles([]);
        setImagePreview(null);
        setAttachmentNames([]);
        onClose();
    };

    if (!visible) return null;

    return (
        <div className="add-announcement-modal-overlay">
            <div className="add-announcement-modal-container">
                <div className="add-announcement-modal-header">
                    Tạo bài viết
                    <button onClick={handleClose} className="add-announcement-modal-close-btn">×</button>
                </div>

                <div className="add-announcement-modal-user-info">
                        {adminAvatar ? (
                            <img
                                src={adminAvatar.startsWith("http") ? adminAvatar : `${import.meta.env.VITE_BACKEND_URL}${adminAvatar}`}
                                alt="avatar"
                                style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }}
                            />
                        ) : (
                            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#ccc" }} />
                        )}

                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <div className="add-announcement-modal-user-name">{adminName || "Admin"}</div>
                            <select
                                value={status}
                                onChange={e => setStatus(e.target.value)}
                                className="add-announcement-modal-status-select"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="draft">Draft</option>
                            </select>
                        </div>
                    </div>

                <div className="add-announcement-modal-body">
                    

                    <input
                        type="text"
                        placeholder="Tiêu đề"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="add-announcement-modal-title"
                    />

                    <textarea
                        placeholder="Nội dung ..."
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        className="add-announcement-modal-content"
                    />

                    {imagePreview && (
                        <div className="add-announcement-modal-image-preview">
                            <img src={imagePreview} alt="preview" />
                            <button onClick={() => { setImageFile(null); setImagePreview(null); }}>×</button>
                        </div>
                    )}

                    {attachmentNames.length > 0 && (
                        <div className="add-announcement-modal-attachments">
                            <strong>Tệp đính kèm:</strong>
                            <ul>{attachmentNames.map((name, idx) => <li key={idx}>{name}</li>)}</ul>
                            <button onClick={() => { setAttachmentFiles([]); setAttachmentNames([]); }} className="add-announcement-modal-clear-btn">
                                Xóa tất cả tệp
                            </button>
                        </div>
                    )}
                </div>

                <div className="add-announcement-modal-toolbar">
                    <span>Thêm vào bài viết của bạn</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <label>
                            <input type="file" accept="image/*" onChange={e => { const file = e.target.files[0]; setImageFile(file); setImagePreview(URL.createObjectURL(file)); }} style={{ display: "none" }} />
                            🖼️
                        </label>
                        <label>
                            <input type="file" multiple onChange={e => { const files = [...e.target.files]; setAttachmentFiles(files); setAttachmentNames(files.map(f => f.name)); }} style={{ display: "none" }} />
                            📎
                        </label>
                    </div>
                </div>

                <div className="add-announcement-modal-footer">
                    <button
                        onClick={handleSubmit}
                        disabled={!title.trim() || !content.trim()}
                        className="add-announcement-modal-submit-btn"
                        style={{ backgroundColor: (title.trim() && content.trim()) ? "#1877f2" : "#8ab4f8", cursor: (title.trim() && content.trim()) ? "pointer" : "not-allowed" }}
                    >
                        Tiếp
                    </button>
                    <button onClick={handleClose} className="add-announcement-modal-cancel-btn">Hủy</button>
                </div>
            </div>
        </div>
    );
}
