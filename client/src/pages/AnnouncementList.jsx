import React, { useEffect, useState } from "react";
import {
    getAnnouncementsApi,
    deleteAnnouncementApi,
    createAnnouncementApi,
    updateAnnouncementApi
} from "../util/api";
import axios from "axios";
import "../styles/AnnouncementList.css";

import AddAnnouncementModal from "./AddAnnouncementModal";

export default function AnnouncementList() {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    const [adminId, setAdminId] = useState(null);
    const [adminAvatar, setAdminAvatar] = useState(null);

    // ==========================
    // ADD form (test create)
    // ==========================
    const [newTitle, setNewTitle] = useState("");
    const [newContent, setNewContent] = useState("");
    const [newStatus, setNewStatus] = useState("active");
    const [imageFile, setImageFile] = useState(null);
    const [attachmentFiles, setAttachmentFiles] = useState([]);

    // ==========================
    // EDIT form
    // ==========================
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [editContent, setEditContent] = useState("");
    const [editStatus, setEditStatus] = useState("active");
    const [editImageFile, setEditImageFile] = useState(null);
    const [editAttachments, setEditAttachments] = useState([]);

    // ==========================
    // Fetch admin info
    // ==========================
    const fetchAdmin = async () => {
        try {
            const res = await axios.get("http://localhost:8088/v1/api/auth/me", {
                withCredentials: true
            });
            console.log("Avatar:", res.data.user.avatar); // debug avatar riêng
            setAdminId(res.data.user.id);
            setAdminAvatar(res.data.user.image || null);
        } catch (err) {
            console.error("Không lấy được thông tin admin:", err);
        }
    };

    useEffect(() => {
        fetchAdmin();
    }, []);

    // ==========================
    // Fetch announcement list
    // ==========================
    const fetchAnnouncements = async (pageNumber = 0) => {
        setLoading(true);
        try {
            const res = await getAnnouncementsApi({ page: pageNumber, limit: 10 });
            if (res && res.content) {
                setAnnouncements(prev => {
                    const newItems = res.content.filter(
                        item => !prev.some(a => a.id === item.id)
                    );
                    return [...prev, ...newItems];
                });
                setHasMore(!res.last);
            }
        } catch (err) {
            console.error("Fetch announcements error:", err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchAnnouncements(page);
    }, [page]);

    // ==========================
    // Lazy loading
    // ==========================
    useEffect(() => {
        const handleScroll = () => {
            if (
                window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 &&
                !loading &&
                hasMore
            ) {
                setPage(prev => prev + 1);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [loading, hasMore]);

    // ==========================
    // CREATE announcement
    // ==========================
    // hàm thêm mới từ modal
    const handleAddFromModal = async ({ adminId, title, content, status, imageFile, attachmentFiles }) => {
        try {
            const formData = new FormData();

            formData.append(
                "data",
                new Blob([JSON.stringify({
                    adminId,
                    title,
                    content,
                    status
                })], { type: "application/json" })
            );

            if (imageFile) formData.append("imageFile", imageFile);
            attachmentFiles.forEach(f => formData.append("attachments", f));

            const res = await createAnnouncementApi(formData);

            setAnnouncements(prev => [res, ...prev]);
            setShowAddModal(false);

        } catch (err) {
            console.error("Tạo announcement lỗi:", err);
            alert("Tạo thất bại");
        }
    };

    // ==========================
    // DELETE announcement
    // ==========================
    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xóa thông báo này?")) return;
        const res = await deleteAnnouncementApi(id);

        if (res && !res.success) {
            alert("Xóa thất bại: " + (res.error || "Lỗi server"));
        } else {
            setAnnouncements(prev => prev.filter(a => a.id !== id));
        }
    };

    // ==========================
    // EDIT: mở form
    // ==========================
    const openEdit = (a) => {
        setEditMode(true);
        setEditId(a.id);
        setEditTitle(a.title);
        setEditContent(a.content);
        setEditStatus(a.status);
        setEditImageFile(null);
        setEditAttachments([]);
    };

    // ==========================
    // EDIT: gửi API update
    // ==========================
    const handleUpdate = async () => {
        if (!editId) return;

        try {
            const formData = new FormData();

            formData.append(
                "data",
                new Blob([JSON.stringify({
                    title: editTitle,
                    content: editContent,
                    status: editStatus
                })], { type: "application/json" })
            );

            if (editImageFile) formData.append("imageFile", editImageFile);
            editAttachments.forEach(f => formData.append("attachments", f));

            const updated = await updateAnnouncementApi(editId, formData);

            setAnnouncements(prev =>
                prev.map(item => (item.id === editId ? updated : item))
            );

            setEditMode(false);

        } catch (err) {
            console.error("Lỗi update:", err);
            alert("Update thất bại");
        }
    };

    // ==========================
    // UI
    // ==========================
    return (
        <div className="announcement-list">

            <div className="announcement-add-wrapper">
                {adminAvatar && (
                    <img
                        src={
                            adminAvatar.startsWith("http")
                                ? adminAvatar
                                : `${import.meta.env.VITE_BACKEND_URL}${adminAvatar}`
                        }
                        alt="avatar"
                        className="announcement-add-avatar"
                    />
                )}

                <div
                    className="announcement-add-placeholder"
                    tabIndex={0}
                    onClick={() => setShowAddModal(true)}
                    onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') setShowAddModal(true);
                    }}
                >
                    Bài viết mới...
                </div>
            </div>

            <AddAnnouncementModal
                visible={showAddModal}
                onClose={() => setShowAddModal(false)}
                onAdd={handleAddFromModal}
                adminId={adminId}
            />

            {/* EDIT FORM */}
            {editMode && (
                <div className="announcement-edit-box">
                    <h3>Sửa thông báo</h3>

                    <input
                        type="text"
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                    />

                    <textarea
                        value={editContent}
                        onChange={e => setEditContent(e.target.value)}
                    />

                    <label>Đổi ảnh đại diện:</label>
                    <input type="file" onChange={e => setEditImageFile(e.target.files[0])} />

                    <label>Thêm file đính kèm:</label>
                    <input type="file" multiple onChange={e => setEditAttachments([...e.target.files])} />

                    <label>Status:</label>
                    <select value={editStatus} onChange={e => setEditStatus(e.target.value)}>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="draft">Draft</option>
                    </select>

                    <button onClick={handleUpdate}>Lưu thay đổi</button>
                    <button onClick={() => setEditMode(false)}>Hủy</button>
                </div>
            )}

            {/* LIST */}
            {announcements.map((a, index) => (
                <div key={`${a.id}-${index}`} className="announcement-card">
                    <h3>{a.title}</h3>
                    <p>{a.content}</p>

                    {a.imageURL && (
                        <img
                            src={
                                a.imageURL.startsWith("http")
                                    ? a.imageURL
                                    : `${import.meta.env.VITE_BACKEND_URL}${a.imageURL}`
                            }
                            alt={a.title}
                            className="announcement-image"
                        />
                    )}

                    {a.attachments && a.attachments.length > 0 && (
                        <div className="attachments-box">
                            <h4>File đính kèm:</h4>
                            <ul>
                                {a.attachments.map((url, idx) => (
                                    <li key={idx}>
                                        <a
                                            href={`${import.meta.env.VITE_BACKEND_URL}${url}`}
                                            target="_blank"
                                        >
                                            {url.split("/").pop()}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <p>Status: <b>{a.status}</b></p>
                    <p>Ngày tạo: {new Date(a.createdAt).toLocaleString()}</p>

                    <div className="actions">
                        <button
                            onClick={() => openEdit(a)}
                            className="btn-edit"
                        >
                            Sửa
                        </button>

                        <button
                            onClick={() => handleDelete(a.id)}
                            className="btn-delete"
                        >
                            Xóa
                        </button>
                    </div>
                </div>
            ))}

            {loading && <p>Đang tải thêm...</p>}
            {!hasMore && <p>Đã tải hết thông báo</p>}
        </div>
    );
}
