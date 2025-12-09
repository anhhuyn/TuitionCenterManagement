import React, { useState, useEffect } from "react";
import "../styles/AddAnnouncementModal.css";

import {
    FiGlobe,
    FiEyeOff,
    FiEdit,
    FiImage,
    FiPaperclip
} from "react-icons/fi";

export default function EditAnnouncementModal({
    visible,
    onClose,
    onUpdate,
    adminAvatar,
    adminName,
    announcement
}) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [status, setStatus] = useState("active");
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [attachmentFiles, setAttachmentFiles] = useState([]);
    const [attachmentNames, setAttachmentNames] = useState([]);
    const [clearImage, setClearImage] = useState(false);
    const [clearAttachments, setClearAttachments] = useState(false);
    const [oldAttachments, setOldAttachments] = useState([]);

    const [showPrivacy, setShowPrivacy] = useState(false);

    const statusOptions = [
        { value: "active", label: "Công khai", icon: <FiGlobe /> },
        { value: "inactive", label: "Ẩn", icon: <FiEyeOff /> },
        { value: "draft", label: "Nháp", icon: <FiEdit /> },
    ];

    // RESET STATE MỖI KHI MỞ MODAL
    useEffect(() => {
        if (visible && announcement) {
            setOldAttachments(announcement.attachments || []);
            setTitle(announcement.title);
            setContent(announcement.content);
            setStatus(announcement.status || "active");

            setImageFile(null);
            setClearImage(false);

            setAttachmentFiles([]);
            setClearAttachments(false);

            setImagePreview(
                announcement.imageURL
                    ? `${import.meta.env.VITE_BACKEND_URL}${announcement.imageURL}`
                    : null
            );

            setAttachmentNames(
                announcement.attachments?.map((a, idx) => `File đính kèm ${idx + 1}`) || []
            );
        }
    }, [visible, announcement]);

    // SUBMIT
    const handleSubmit = () => {
        if (!title.trim() || !content.trim()) {
            alert("Vui lòng điền đầy đủ thông tin!");
            return;
        }

        onUpdate({
            id: announcement.id,
            title,
            content,
            status,
            imageFile,
            attachmentFiles,
            oldAttachments,
            clearImage,
            clearAttachments
        });

        onClose();
    };

    if (!visible) return null;

    return (
        <div className="add-announcement-modal-overlay">
            <div className="add-announcement-modal-container">

                {/* HEADER */}
                <div className="add-announcement-modal-header">
                    Chỉnh sửa bài viết
                    <button onClick={onClose} className="add-announcement-modal-close-btn">×</button>
                </div>

                {/* USER INFO */}
                <div className="add-announcement-modal-user-info">
                    {adminAvatar ? (
                        <img
                            src={
                                adminAvatar.startsWith("http")
                                    ? adminAvatar
                                    : `${import.meta.env.VITE_BACKEND_URL}${adminAvatar}`
                            }
                            alt="avatar"
                            style={{ width: 40, height: 40, borderRadius: "50%" }}
                        />
                    ) : (
                        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#ccc" }} />
                    )}

                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>

                        <div className="add-announcement-modal-user-name">
                            {adminName || "Admin"}
                        </div>

                        {/* DROPDOWN STATUS */}
                        <div className="fb-privacy">
                            <button
                                type="button"
                                className="fb-privacy-btn"
                                onClick={() => setShowPrivacy(prev => !prev)}
                            >
                                {status === "inactive" && <FiEyeOff />}
                                {status === "active" && <FiGlobe />}
                                {status === "draft" && <FiEdit />}
                                <span>{statusOptions.find(o => o.value === status)?.label}</span>
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

                {/* BODY */}
                <div className="add-announcement-modal-body">
                    <input
                        type="text"
                        placeholder="Tiêu đề"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="add-announcement-modal-title"
                    />

                    <textarea
                        placeholder="Nội dung..."
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        className="add-announcement-modal-content"
                    />

                    {/* IMAGE PREVIEW */}
                    {imagePreview && (
                        <div className="add-announcement-modal-image-preview">
                            <img src={imagePreview} alt="preview" />
                            <button onClick={() => {
                                setImagePreview(null);
                                setImageFile(null);
                                setClearImage(true);
                            }}>×</button>
                        </div>
                    )}

                    {/* ATTACHMENTS */}
                    {attachmentNames.length > 0 && (
                        <div className="add-announcement-modal-attachments">
                            <strong>Tệp đính kèm:</strong>
                            <ul className="attachment-list">
                                {attachmentNames.map((name, idx) => (
                                    <li key={idx} className="attachment-item">
                                        <span>{name}</span>
                                        <button
                                            className="attachment-remove-btn"
                                            onClick={() => {
                                                const newNames = [...attachmentNames];

                                                // 1. Nếu file ở index này thuộc file cũ
                                                if (idx < oldAttachments.length) {
                                                    const updatedOld = [...oldAttachments];
                                                    updatedOld.splice(idx, 1);
                                                    setOldAttachments(updatedOld);
                                                } else {
                                                    // 2. Xóa file mới
                                                    const fileIdx = idx - oldAttachments.length;
                                                    const newFiles = [...attachmentFiles];
                                                    newFiles.splice(fileIdx, 1);
                                                    setAttachmentFiles(newFiles);
                                                }

                                                newNames.splice(idx, 1);
                                                setAttachmentNames(newNames);

                                                if (newNames.length === 0) setClearAttachments(true);
                                            }}
                                        >
                                            ×
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={() => {
                                    setAttachmentFiles([]);
                                    setAttachmentNames([]);
                                    setClearAttachments(true);
                                }}
                                className="add-announcement-modal-clear-btn"
                            >
                                Xóa tất cả tệp
                            </button>
                        </div>
                    )}
                </div>

                {/* TOOLBAR */}
                <div className="fb-add-wrapper">
                    <div className="add-announcement-modal-toolbar">
                        <span>Thêm vào bài viết</span>

                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>

                            {/* IMAGE UPLOAD */}
                            <label className="fb-add-btn photo">
                                <input
                                    type="file"
                                    accept="image/*"
                                    hidden
                                    onClick={e => e.target.value = null}   // 🚀 FIX 100%
                                    onChange={e => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            setImageFile(file);
                                            setClearImage(false);
                                            setImagePreview(URL.createObjectURL(file));
                                        }
                                    }}
                                />
                                <FiImage />
                            </label>

                            {/* ATTACHMENT UPLOAD */}
                            <label className="fb-add-btn file">
                                <input
                                    type="file"
                                    multiple
                                    hidden
                                    onClick={e => e.target.value = null} // reset input
                                    onChange={e => {
                                        const files = [...e.target.files];
                                        if (files.length > 0) {
                                            // 1. Thêm file mới vào attachmentFiles
                                            setAttachmentFiles(prev => [...prev, ...files]);

                                            // 2. Tạo tên file mới dựa trên số thứ tự tiếp nối file cũ + file đã chọn trước đó
                                            const startingIndex = oldAttachments.length + attachmentFiles.length;
                                            const newNames = files.map((f, idx) => `File đính kèm ${startingIndex + idx + 1}`);

                                            // 3. Cập nhật attachmentNames
                                            setAttachmentNames(prev => [...prev, ...newNames]);

                                            setClearAttachments(false);
                                        }
                                    }}
                                />
                                <FiPaperclip />
                            </label>


                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="add-announcement-modal-footer">
                    <button className="add-announcement-modal-submit-btn" onClick={handleSubmit}>
                        Cập nhật
                    </button>
                </div>

            </div>
        </div>
    );
}
