import React, { useEffect, useState, useMemo } from "react";
import { getAssignmentsBySubjectIdApi, deleteAssignmentApi } from "../../util/api";
import "../../styles/classDetailViews/AssignmentList.css";
import { FiDownload, FiEdit2, FiTrash2, FiBook } from "react-icons/fi";
import ConfirmModal from "../../components/modal/ConfirmModal";
import AssignmentModal from "./AssignmentModal";


// Hàm tiện ích để lấy tên tháng tiếng Việt
const getMonthName = (monthIndex) => {
  const date = new Date();
  date.setMonth(monthIndex - 1);
  return date.toLocaleDateString("vi-VN", { month: "long" });
};

// Hàm tiện ích để tạo danh sách năm
const generateYears = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear - 5; i <= currentYear + 5; i++) {
    years.push(i);
  }
  return years;
};

// Hàm tiện ích để format ngày + giờ theo định dạng tiếng Việt
const formatDateTime = (datetime) => {
  if (!datetime) return "Không rõ";
  const date = new Date(datetime);
  return date.toLocaleString("vi-VN", {
    hour12: false, // dùng 24h
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};


const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);
const yearOptions = generateYears();

export default function AssignmentList({ classData }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);
  // State mới để quản lý việc mở/đóng menu 3 chấm
  const [showMenuId, setShowMenuId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editAssignment, setEditAssignment] = useState(null);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const data = await getAssignmentsBySubjectIdApi(classData.id);
        // Giả lập thêm isSubmitted nếu API chưa có, để tránh lỗi
        // const dataWithMockStatus = data.map(item => ({...item, isSubmitted: Math.random() > 0.5}));
        setAssignments(data);
      } catch (error) {
        console.error("Lỗi lấy danh sách bài tập:", error);
      } finally {
        setLoading(false);
      }
    };

    if (classData?.id) fetchAssignments();
  }, [classData]);

  const filteredAssignments = useMemo(() => {
    return assignments.filter((item) => {
      const sessionDate = new Date(item.Session?.sessionDate);
      return (
        sessionDate.getMonth() + 1 === selectedMonth &&
        sessionDate.getFullYear() === selectedYear
      );
    });
  }, [assignments, selectedMonth, selectedYear]);

  // Hàm xử lý khi click nút 3 chấm
  const toggleMenu = (id) => {
    setShowMenuId(showMenuId === id ? null : id);
  };

  // Hàm xử lý các thao tác (Cần được thay thế bằng API call thực tế)
  const handleDelete = (id) => {
    setSelectedDeleteId(id);
    setShowMenuId(null);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    if (!selectedDeleteId) return;

    try {
      await deleteAssignmentApi(selectedDeleteId);
      setAssignments((prev) => prev.filter((item) => item.id !== selectedDeleteId));
    } catch (error) {
      console.error("Lỗi khi xóa bài tập:", error);
      alert("Xóa thất bại! Vui lòng thử lại.");
    } finally {
      setShowConfirm(false);
      setSelectedDeleteId(null);
    }
  };

  const handleEdit = (assignment) => {
    setEditAssignment(assignment);
    setShowModal(true);
    setShowMenuId(null);
  };
  return (
    <div className="assignment-list-container">
      <div className="assignment-header">
        {/* Hàng 1: Tiêu đề + số bài tập + nút thêm */}
        <div className="header-top-row">
          <div className="header-title-wrapper">
            <h2 className="header-title">
              Danh sách bài tập <span className="divider">|</span> <span className="assignment-count">{filteredAssignments.length} bài</span>
            </h2>
          </div>

          {/* Nút thêm bài tập */}
          <button
            className="add-assignment-button"
            onClick={() => {
              setEditAssignment(null);
              setShowModal(true);
            }}
          >
            + Thêm bài
          </button>
        </div>

        {/* Hàng 2: Bộ lọc tháng/năm */}
        <div className="filter-controls-row">
          <div className="filter-controls">
            <div className="month-selector">
              <input
                type="month"
                value={`${selectedYear}-${selectedMonth.toString().padStart(2, "0")}`}
                onChange={(e) => {
                  const [year, month] = e.target.value.split("-");
                  setSelectedYear(Number(year));
                  setSelectedMonth(Number(month));
                }}
                className="month-input"
              />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <p className="loading-text">Đang tải bài tập...</p>
      ) : filteredAssignments.length === 0 ? (
        <div className="empty-state">
          <p>Không có bài tập trong tháng {selectedMonth}/{selectedYear}.</p>
        </div>
      ) : (
        <ul className="assignment-list">
          {filteredAssignments.map((item) => (
            <li key={item.id} className="assignment-item">



              {/* Nút 3 chấm (Menu Options) ở góc trên bên phải */}
              <div className="options-menu">
                <button
                  className="options-button"
                  onClick={() => toggleMenu(item.id)}
                  aria-expanded={showMenuId === item.id}
                  aria-label="Tùy chọn bài tập"
                >
                  ...
                </button>
                {showMenuId === item.id && (
                  <div className="menu-dropdown">
                    <button onClick={() => handleEdit(item)}>
                      <FiEdit2 style={{ marginRight: "6px" }} />
                      Sửa
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="delete-option">
                      <FiTrash2 style={{ marginRight: "6px" }} />
                      Xóa
                    </button>
                  </div>
                )}
              </div>

              <div className="assignment-content">
                <p className="assignment-header-line">
                  <FiBook style={{ color: "var(--primary)" }} />
                  <span>
                    <strong>
                      Bài tập ({new Date(item.Session?.sessionDate).toLocaleDateString("vi-VN")},{" "}
                      {item.Session?.startTime} - {item.Session?.endTime}):
                    </strong>{" "}
                    {item.title}
                  </span>
                </p>

                <div className="assignment-info-row">
                  <span>
                    <strong>Ngày tạo:</strong> {formatDateTime(item.createdAt)}
                  </span>
                  <span>
                    <strong>Hạn nộp:</strong> <span className="due-date">{formatDateTime(item.dueDate)}</span>
                  </span>
                </div>
                <div className="assignment-requirement-box">
                  <strong>Yêu cầu:</strong>
                  <p>{item.description || "Không có"}</p>

                  {item.file && (
                    <a
                      href={`${import.meta.env.VITE_BACKEND_URL}${item.file}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="attachment-link"
                    >
                      <FiDownload style={{ marginRight: "6px" }} />
                      <em>Tải file đính kèm</em>
                    </a>
                  )}
                </div>
              </div>

            </li>
          ))}
        </ul>
      )}
      {showConfirm && (
        <ConfirmModal
          title="Xác nhận xóa bài tập"
          message="Bạn có chắc chắn muốn xóa bài tập này không?"
          cancelText="Hủy"
          confirmText="Xóa"
          onCancel={() => setShowConfirm(false)}
          onConfirm={confirmDelete}
        />
      )}
      {showModal && (
        <AssignmentModal
          onClose={() => {
            setShowModal(false);
            setEditAssignment(null);
          }}
          onUploadSuccess={async () => {
            const data = await getAssignmentsBySubjectIdApi(classData.id);
            setAssignments(data);
            return data; 
          }}
          subjectId={classData.id}
          editMode={!!editAssignment}
          initialData={editAssignment}
        />
      )}
    </div>
  );
}