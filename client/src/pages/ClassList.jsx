import React, { useEffect, useState } from "react";
import { getSubjectsApi } from "../util/api";
import CIcon from "@coreui/icons-react";
import { cilFilter, cilPeople, cilChevronLeft, cilChevronRight } from "@coreui/icons";
import "../styles/ClassList.css";
import { useNavigate } from "react-router-dom";
import ClassModal from "./ClassModal";

const colors = ["#EDE9FE", "#DBEAFE", "#EBFCEF", "#FFFDE7", "#FFF5F5"];

export default function ClassList() {
    const [showAddModal, setShowAddModal] = useState(false);
    const [classes, setClasses] = useState([]);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("Tất cả");
    const [stats, setStats] = useState({
        all: 0,
        active: 0,
        upcoming: 0,
        ended: 0,
    });

    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(12);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const filterStatusMap = {
        "Tất cả": null,
        "Đang diễn ra": "active",
        "Sắp diễn ra": "upcoming",
        "Kết thúc": "ended",
    };
    // Reset về trang 1 khi đổi filter
    useEffect(() => {
        setPage(1);
    }, [filter]);

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const status = filterStatusMap[filter]; // lấy status theo filter hiện tại
                const res = await getSubjectsApi({ page, limit, status });
                if (res.success) {
                    setClasses(res.data);
                    setStats(res.stats);
                    setTotal(res.total);
                    setLimit(res.limit);
                    setTotalPages(res.totalPages);
                }
            } catch (err) {
                console.error("Lỗi fetch classes:", err);
            }
        };
        fetchClasses();
    }, [page, limit, filter]);

    const statusText = {
        active: "Đang diễn ra",
        upcoming: "Sắp diễn ra",
        ended: "Kết thúc",
    };

    const statusBadgeClass = {
        active: "status-running",
        upcoming: "status-upcoming",
        ended: "status-ended",
    };

    const filtered = classes.filter((cls) => {
        const teacherName =
            cls.TeacherSubjects[0]?.Teacher?.User?.fullName?.toLowerCase() || "";
        const matchSearch =
            cls.name.toLowerCase().includes(search.toLowerCase()) ||
            teacherName.includes(search.toLowerCase());

        if (filter === "Tất cả") return matchSearch;
        if (filter === "Đang diễn ra") return cls.status === "active" && matchSearch;
        if (filter === "Sắp diễn ra") return cls.status === "upcoming" && matchSearch;
        if (filter === "Kết thúc") return cls.status === "ended" && matchSearch;

        return matchSearch;
    });

    return (
        <div className="class-container">
            {/* Thanh filter + search */}
            <div className="filter-bar">
                <button className="btn-filter">
                    <CIcon icon={cilFilter} />
                </button>

                <div className="tabs">
                    <button
                        className={`tab ${filter === "Tất cả" ? "active" : ""}`}
                        onClick={() => setFilter("Tất cả")}
                    >
                        Tất cả ({stats.all})
                    </button>
                    <button
                        className={`tab ${filter === "Sắp diễn ra" ? "active" : ""}`}
                        onClick={() => setFilter("Sắp diễn ra")}
                    >
                        Sắp diễn ra ({stats.upcoming})
                    </button>
                    <button
                        className={`tab ${filter === "Đang diễn ra" ? "active" : ""}`}
                        onClick={() => setFilter("Đang diễn ra")}
                    >
                        Đang diễn ra ({stats.active})
                    </button>
                    <button
                        className={`tab ${filter === "Kết thúc" ? "active" : ""}`}
                        onClick={() => setFilter("Kết thúc")}
                    >
                        Kết thúc ({stats.ended})
                    </button>
                </div>

                <div className="search-add">
                    <input
                        type="text"
                        placeholder="Tìm kiếm"
                        className="search-box"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button className="btn-add" onClick={() => setShowAddModal(true)}>+ Tạo lớp</button>
                </div>
            </div>

            {/* Danh sách lớp */}
            <div className="class-grid">
                {filtered.map((cls, index) => (
                    <div
                        key={cls.id}
                        className="class-card"
                        style={{ backgroundColor: colors[index % colors.length] }}
                        onClick={() => navigate(`/admin/class/${cls.id}`)}
                    >
                        <div className="banner">
                            <img
                                src={
                                    cls.image
                                        ? cls.image.startsWith("http")
                                            ? cls.image
                                            : `${import.meta.env.VITE_BACKEND_URL}${cls.image}`
                                        : "https://llv.edu.vn/media/2018/11/BLOG-PHOTO-Back-to-School-stationery-v1-20170115-1.jpg"
                                }
                                alt={cls.name}
                                onError={(e) => {
                                    e.target.onerror = null; // tránh loop vô hạn nếu ảnh fallback cũng lỗi
                                    e.target.src =
                                        "https://llv.edu.vn/media/2018/11/BLOG-PHOTO-Back-to-School-stationery-v1-20170115-1.jpg";
                                }}
                            />
                            <span
                                className={`status-badge ${statusBadgeClass[cls.status] || ""}`}

                            >
                                {statusText[cls.status] || "Không rõ"}
                            </span>
                        </div>
                        <div className="card-content">
                            <h3>{cls.name}</h3>
                            <p>
                                Khối: <b>{cls.grade}</b>
                            </p>
                            <p>
                                Giáo viên:{" "}
                                {cls.TeacherSubjects[0]?.Teacher?.userInfo?.fullName || "Chưa sắp xếp"}
                            </p>
                            <p>
                                Thanh toán: <b>Thanh toán theo tháng</b>
                            </p>
                            <p>
                                Số buổi học: <b>{cls.sessionsPerWeek} buổi/tuần</b>
                            </p>
                            <p>Ghi chú: {cls.note}</p>
                            <div className="card-footer">
                                <span className="students">
                                    <CIcon icon={cilPeople} className="me-1" />
                                    {cls.currentStudents} / {cls.maxStudents}
                                </span>
                                <span className="price">
                                    {Number(cls.price).toLocaleString()} VNĐ
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* PHÂN TRANG */}
            <div className="pagination">
                <button
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                >
                    <CIcon icon={cilChevronLeft} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((num) => {
                        if (totalPages <= 5) return true;
                        if (num === 1 || num === totalPages) return true;
                        if (num >= page - 1 && num <= page + 1) return true;
                        return false;
                    })
                    .map((num, idx, arr) => {
                        // Thêm dấu ...
                        if (idx > 0 && num !== arr[idx - 1] + 1) {
                            return (
                                <React.Fragment key={num}>
                                    <span className="dots">...</span>
                                    <button
                                        className={`page-btn ${page === num ? "active" : ""}`}
                                        onClick={() => setPage(num)}
                                    >
                                        {num}
                                    </button>
                                </React.Fragment>
                            );
                        }
                        return (
                            <button
                                key={num}
                                className={`page-btn ${page === num ? "active" : ""}`}
                                onClick={() => setPage(num)}
                            >
                                {num}
                            </button>
                        );
                    })}

                <button
                    onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={page === totalPages}
                >
                    <CIcon icon={cilChevronRight} />
                </button>
            </div>
            <ClassModal
                show={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={() => {
                    setShowAddModal(false);
                    // reload lại danh sách lớp sau khi thêm mới
                    const fetchClasses = async () => {
                        const status = filterStatusMap[filter];
                        const res = await getSubjectsApi({ page, limit, status });
                        if (res.success) {
                            setClasses(res.data);
                            setStats(res.stats);
                            setTotal(res.total);
                            setLimit(res.limit);
                            setTotalPages(res.totalPages);
                        }
                    };
                    fetchClasses();
                }}
            />
        </div>
    );
}
