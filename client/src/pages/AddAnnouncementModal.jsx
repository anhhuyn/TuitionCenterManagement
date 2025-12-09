import React, { useState } from "react";
import "../styles/AddAnnouncementModal.css";
import {
    FiGlobe,
    FiEyeOff,
    FiEdit,
    FiImage,
    FiPaperclip
} from "react-icons/fi";

export default function AddAnnouncementModal({ visible, onClose, onAdd, adminId, adminAvatar, adminName }) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [status, setStatus] = useState("active");
    const [imageFile, setImageFile] = useState(null);
    const [attachmentFiles, setAttachmentFiles] = useState([]);
    const [imagePreview, setImagePreview] = useState(null);
    const [attachmentNames, setAttachmentNames] = useState([]);
    const [showPrivacy, setShowPrivacy] = useState(false);
    const [errorTitle, setErrorTitle] = useState("");
    const [errorContent, setErrorContent] = useState("");

    const statusOptions = [
        { value: "active", label: "Công khai", icon: <FiGlobe /> },
        { value: "inactive", label: "Ẩn", icon: <FiEyeOff /> },
        { value: "draft", label: "Nháp", icon: <FiEdit /> },
    ];

    const handleSubmit = () => {
        let hasError = false;

        if (!title.trim()) {
            setErrorTitle("Vui lòng nhập tiêu đề!");
            hasError = true;
        } else {
            setErrorTitle("");
        }

        if (!content.trim()) {
            setErrorContent("Vui lòng nhập nội dung!");
            hasError = true;
        } else {
            setErrorContent("");
        }

        if (hasError) return;

        if (!adminId) {
            alert("Chưa lấy được adminId");
            return;
        }

        // Gọi callback onAdd
        onAdd({ adminId, title, content, status, imageFile, attachmentFiles });

        // Reset form sau khi lưu thành công
        setTitle("");
        setContent("");
        setStatus("active");
        setImageFile(null);
        setAttachmentFiles([]);
        setImagePreview(null);
        setAttachmentNames([]);
        setErrorTitle("");
        setErrorContent("");

        // Đóng modal nếu muốn
        onClose();
    };

    const handleClose = () => {
        setTitle("");
        setContent("");
        setStatus("active");
        setImageFile(null);
        setAttachmentFiles([]);
        setImagePreview(null);
        setAttachmentNames([]);
        setErrorTitle("");
        setErrorContent("");
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

                        {/* Custom privacy dropdown giống Facebook */}
                        <div className="fb-privacy">
                            <button
                                type="button"
                                className="fb-privacy-btn"
                                onClick={() => setShowPrivacy(prev => !prev)}
                            >
                                {status === "inactive" && <FiEyeOff />}
                                {status === "active" && <FiGlobe />}
                                {status === "draft" && <FiEdit />}

                                <span>
                                    {statusOptions.find(o => o.value === status)?.label}
                                </span>

                                <span className={`arrow ${showPrivacy ? "open" : ""}`}>▾</span>
                            </button>

                            {showPrivacy && (
                                <ul className="fb-privacy-menu">
                                    {statusOptions.map(opt => (
                                        <li
                                            key={opt.value}
                                            onClick={() => {
                                                setStatus(opt.value);
                                                setShowPrivacy(false);
                                            }}
                                            className={status === opt.value ? "selected" : ""}
                                        >
                                            {opt.icon}
                                            <span>{opt.label}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                    </div>
                </div>

                {/* Body */}
                <div className="add-announcement-modal-body">
                    <input
                        type="text"
                        placeholder="Tiêu đề"
                        value={title}
                        onChange={e => { setTitle(e.target.value); if (errorTitle) setErrorTitle(""); }}
                        className="add-announcement-modal-title"

                    />
                    {errorTitle && <p className="form-error">{errorTitle}</p>}

                    <textarea
                        placeholder="Nội dung ..."
                        value={content}
                        onChange={e => { setContent(e.target.value); if (errorContent) setErrorContent(""); }}
                        className="add-announcement-modal-content"
                    />
                    {errorContent && <p className="form-error">{errorContent}</p>}

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

                {/* Toolbar */}
                {/* Toolbar WRAPPER */}
                <div className="fb-add-wrapper">
                    <div className="add-announcement-modal-toolbar">
                        <span>Thêm vào bài viết của bạn</span>

                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>

                            {/* Ảnh */}
                            <label className="fb-add-btn photo">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={e => {
                                        const file = e.target.files[0];
                                        setImageFile(file);
                                        setImagePreview(URL.createObjectURL(file));
                                    }}
                                    hidden
                                />
                                <FiImage />
                            </label>

                            {/* File */}
                            <label className="fb-add-btn file">
                                <input
                                    type="file"
                                    multiple
                                    onChange={e => {
                                        const files = [...e.target.files];
                                        setAttachmentFiles(files);
                                        setAttachmentNames(files.map(f => f.name));
                                    }}
                                    hidden
                                />
                                <FiPaperclip />
                            </label>

                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="add-announcement-modal-footer">
                    <button
                        onClick={handleSubmit}
                        className="add-announcement-modal-submit-btn"

                    >
                        Lưu
                    </button>
                </div>
            </div>
        </div>
    );
}
