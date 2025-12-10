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
import EditAnnouncementModal from "./EditAnnouncementModal";
import ConfirmModal from "../components/modal/ConfirmModal";
import { FiEdit, FiTrash2, FiCheckCircle } from "react-icons/fi";

export default function AnnouncementList() {
    const [roleId, setRoleId] = useState(null);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    const [adminId, setAdminId] = useState(null);
    const [adminAvatar, setAdminAvatar] = useState(null);
    const [expanded, setExpanded] = useState({});
    const STATUS_LABEL = {
        active: "Công khai",
        inactive: "Ẩn",
        draft: "Nháp"
    };

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
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState(null);


    const toggleExpand = (id) => {
        setExpanded(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };
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
            setRoleId(res.data.user.roleId);
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
    // Trong component AnnouncementList
    useEffect(() => {
        const handleClickOutside = (e) => {
            // Kiểm tra nếu click ngoài các menu-wrapper
            const menus = document.querySelectorAll(".menu-wrapper");
            let clickedInsideMenu = false;
            menus.forEach(menu => {
                if (menu.contains(e.target)) clickedInsideMenu = true;
            });

            if (!clickedInsideMenu) {
                // đóng tất cả menu
                setExpanded(prev => {
                    const newExpanded = { ...prev };
                    Object.keys(newExpanded).forEach(key => {
                        if (key.startsWith("menu_")) newExpanded[key] = false;
                    });
                    return newExpanded;
                });
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);


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
    const confirmDelete = (id) => {
        setDeleteTargetId(id);
        setShowConfirm(true);
    };

    const handleConfirmDelete = async () => {
        if (!deleteTargetId) return;

        const res = await deleteAnnouncementApi(deleteTargetId);
        if (res && !res.success) {
            alert("Xóa thất bại: " + (res.error || "Lỗi server"));
        } else {
            setAnnouncements(prev => prev.filter(a => a.id !== deleteTargetId));
        }

        setShowConfirm(false);
        setDeleteTargetId(null);
    };

    const handleCancelDelete = () => {
        setShowConfirm(false);
        setDeleteTargetId(null);
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
        setSelectedAnnouncement(a);
        setShowEditModal(true);
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

            {roleId !== "R1" && (
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
            )}

            <AddAnnouncementModal
                visible={showAddModal}
                onClose={() => setShowAddModal(false)}
                onAdd={handleAddFromModal}
                adminId={adminId}
                adminAvatar={adminAvatar}
            />

            {/* EDIT FORM */}
            <EditAnnouncementModal
                visible={showEditModal}
                onClose={() => setShowEditModal(false)}
                onUpdate={async (data) => {
                    const { id, title, content, status, imageFile, attachmentFiles, clearImage, clearAttachments } = data;

                    const formData = new FormData();
                    formData.append("data",
                        new Blob([JSON.stringify({
                            title,
                            content,
                            status,
                            clearImage,
                            clearAttachments
                        })], { type: "application/json" })
                    );

                    if (imageFile) formData.append("imageFile", imageFile);
                    attachmentFiles.forEach(f => formData.append("attachments", f));

                    const updated = await updateAnnouncementApi(id, formData);
                    setAnnouncements(prev => prev.map(item => item.id === id ? updated : item));

                    setShowEditModal(false);
                }}
                adminAvatar={adminAvatar}
                adminName={"Admin"}
                announcement={selectedAnnouncement}
            />

            {/* LIST */}
            {announcements
                .filter(a => roleId === "R0" ? true : a.status === "active")
                .map((a, index) => (

                    <div key={`${a.id}-${index}`} className="announcement-card">

                        {/* HEADER */}
                        <div className="announcement-header">
                            <div className="header-left">
                                <img
                                    src={
                                        a.admin?.image?.startsWith("http")
                                            ? a.admin.image
                                            : `${import.meta.env.VITE_BACKEND_URL}${a.admin?.image}`
                                    }
                                    alt="avatar"
                                    className="announcement-admin-avatar"
                                />

                                <div className="header-info">
                                    <div className="admin-name">
                                        {a.admin?.fullName || "ADMIN"}
                                    </div>

                                    <div className="meta-info">

                                        <span className="created-date">
                                            {new Date(a.createdAt).toLocaleString()}
                                        </span>
                                        <span className={`announcement-status-badge ${a.status?.toLowerCase()}`}>
                                            {STATUS_LABEL[a.status?.toLowerCase()] || a.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* MENU ⋯ */}
                            {roleId === "R0" && (
                                <div className="menu-wrapper">
                                    <button
                                        className="menu-button"
                                        onClick={() =>
                                            setExpanded(prev => ({
                                                ...prev,
                                                ["menu_" + a.id]: !prev["menu_" + a.id]
                                            }))
                                        }
                                    >
                                        ⋯
                                    </button>

                                    {expanded["menu_" + a.id] && (
                                        <div className="menu-dropdown">
                                            <div
                                                className="menu-item"
                                                onClick={() => openEdit(a)}
                                            >
                                                <FiEdit style={{ marginRight: "6px" }} /> Sửa
                                            </div>
                                            <div
                                                className="menu-item"
                                                onClick={() => confirmDelete(a.id)}
                                            >
                                                <FiTrash2 style={{ marginRight: "6px" }} /> Xóa
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* TIÊU ĐỀ */}
                        <h3 className="announcement-title">{a.title}</h3>

                        {/* NỘI DUNG rút gọn */}
                        <div>
                            <div
                                className={
                                    expanded[a.id] ? "content-box expanded" : "content-box"
                                }
                            >
                                <span className="text">{a.content}</span>

                                {!expanded[a.id] && a.content.length > 100 && (
                                    <span className="see-more" onClick={() => toggleExpand(a.id)}>
                                        ... Xem thêm
                                    </span>
                                )}

                                {expanded[a.id] && (
                                    <span className="see-less" onClick={() => toggleExpand(a.id)}>
                                        Ẩn bớt
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* ẢNH */}
                        {a.imageURL && (
                            <img
                                src={
                                    a.imageURL.startsWith("http")
                                        ? a.imageURL
                                        : `${import.meta.env.VITE_BACKEND_URL}${a.imageURL}`
                                }
                                alt="preview"
                                className="announcement-image"
                            />
                        )}

                        {/* FILES */}
                        {a.attachments?.length > 0 && (
                            <div className="attachments-box">
                                <h6>File đính kèm:</h6>
                                <ul>
                                    {a.attachments.map((url, idx) => (
                                        <li key={idx}>
                                            <a
                                                href={`${import.meta.env.VITE_BACKEND_URL}${url}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                File đính kèm {idx + 1}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>


                ))}

            {loading && <p>Đang tải thêm...</p>}
            {!hasMore && (
                <div className="end-of-list">
                    <FiCheckCircle />
                    <span>Đã tải hết thông báo</span>
                </div>
            )}
            {showConfirm && (
                <ConfirmModal
                    title="Xác nhận xóa thông báo"
                    message="Bạn có chắc chắn muốn xóa thông báo này?"
                    cancelText="Hủy"
                    confirmText="Xóa"
                    onCancel={handleCancelDelete}
                    onConfirm={handleConfirmDelete}
                />
            )}
        </div>

    );
}
