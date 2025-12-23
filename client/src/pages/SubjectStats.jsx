import React, { useEffect, useState } from "react";
import { getSubjectsApi } from "../util/api";
import "../styles/SubjectStats.css";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../components/modal/ConfirmModal";
import StudentStats from "./Stats/StudentStats";
import AttendanceStats from "./Stats/AttendanceStats";

const SubjectStats = () => {
    const navigate = useNavigate(); // thêm dòng này

    const [stats, setStats] = useState({
        all: 0,
        active: 0,
        upcoming: 0,
        ended: 0,
    });

    const [createdThisMonth, setCreatedThisMonth] = useState(0);
    const [showConfirm, setShowConfirm] = useState(false);
    const [countMiddleSchool, setCountMiddleSchool] = useState(0); // cấp 2
    const [countHighSchool, setCountHighSchool] = useState(0);     // cấp 3
    const [activeTab, setActiveTab] = useState("class"); 

    const handleCardClick = () => {
        setShowConfirm(true);
    };

    const handleCancel = () => {
        setShowConfirm(false);
    };

    const handleConfirm = () => {
        setShowConfirm(false);
        navigate("/admin/classlist");
    };


    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await getSubjectsApi({ page: 1, limit: 1000 });

                setStats(
                    res?.stats ?? {
                        all: 0,
                        active: 0,
                        upcoming: 0,
                        ended: 0,
                    }
                );

                const subjects = res?.data ?? [];
                const now = new Date();
                const month = now.getMonth();
                const year = now.getFullYear();

                // Lớp tạo trong tháng
                const countThisMonth = subjects.filter((s) => {
                    if (!s.createdAt) return false;
                    const created = new Date(s.createdAt.replace(" ", "T"));
                    return (
                        created.getMonth() === month &&
                        created.getFullYear() === year
                    );
                }).length;

                setCreatedThisMonth(countThisMonth);

                // Thống kê cấp 2 (grade 6–9)
                const middleSchool = subjects.filter((s) => ["6", "7", "8", "9"].includes(s.grade)).length;
                setCountMiddleSchool(middleSchool);

                // Thống kê cấp 3 (grade 10–12)
                const highSchool = subjects.filter((s) => ["10", "11", "12"].includes(s.grade)).length;
                setCountHighSchool(highSchool);

            } catch (err) {
                console.error("Fetch subject stats error:", err);
            }
        };

        fetchStats();
    }, []);

    return (
  <>
    {/* Tabs chọn thống kê */}
    <div className="stats-tabs">
      <button
        className={activeTab === "class" ? "active" : ""}
        onClick={() => setActiveTab("class")}
      >
        Thống kê lớp học
      </button>
      <button
        className={activeTab === "student" ? "active" : ""}
        onClick={() => setActiveTab("student")}
      >
        Thống kê học viên
      </button>
      <button
        className={activeTab === "attendance" ? "active" : ""}
        onClick={() => setActiveTab("attendance")}
      >
        Thống kê học sinh trễ / vắng
      </button>
    </div>

    {/* Nội dung theo tab */}
    <div className="stats-content">
      {activeTab === "class" && (
        <div className="subject-stats-wrapper">
          <h2 className="subject-stats-title">Thống kê lớp học</h2>

          <div className="subject-stats">
            <div className="stat-card all" onClick={handleCardClick}>
              <div className="stat-number">{stats.all}</div>
              <div className="stat-label">Tổng số lớp học</div>
            </div>

            <div className="stat-card new" onClick={handleCardClick}>
              <div className="stat-number">{createdThisMonth}</div>
              <div className="stat-label">Tạo mới trong tháng</div>
            </div>

            <div className="stat-card active" onClick={handleCardClick}>
              <div className="stat-number">{stats.active}</div>
              <div className="stat-label">Đang hoạt động</div>
            </div>

            <div className="stat-card upcoming" onClick={handleCardClick}>
              <div className="stat-number">{stats.upcoming}</div>
              <div className="stat-label">Sắp diễn ra</div>
            </div>

            <div className="stat-card ended" onClick={handleCardClick}>
              <div className="stat-number">{stats.ended}</div>
              <div className="stat-label">Đã kết thúc</div>
            </div>

            <div className="stat-card middle" onClick={handleCardClick}>
              <div className="stat-number">{countMiddleSchool}</div>
              <div className="stat-label">Số lớp học cấp 2</div>
            </div>

            <div className="stat-card high" onClick={handleCardClick}>
              <div className="stat-number">{countHighSchool}</div>
              <div className="stat-label">Số lớp học cấp 3</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "student" && <StudentStats />}

      {activeTab === "attendance" && (
        <AttendanceStats startDate="2025-11-01" endDate="2025-12-17" />
      )}
    </div>

    {/* Confirm modal chỉ render 1 lần */}
    {showConfirm && (
      <ConfirmModal
        title="Đi đến quản lý lớp học"
        message="Bạn có muốn đi đến trang quản lý lớp học để xem chi tiết các lớp học không?"
        cancelText="Ở lại"
        confirmText="Đi đến"
        onCancel={handleCancel}
        onConfirm={handleConfirm}
      />
    )}
  </>
);
};

export default SubjectStats;
