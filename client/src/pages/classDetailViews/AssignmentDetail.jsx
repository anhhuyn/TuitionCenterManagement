import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getStudentAssignmentsByAssignmentIdApi,
  updateStudentAssignmentApi,
} from "../../util/api";
import "../../styles/classDetailViews/AssignmentDetail.css";
import { FiArrowLeft, FiEdit2, FiUser, FiSend } from "react-icons/fi";

export default function AssignmentDetail() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [originalStudents, setOriginalStudents] = useState([]); // 🔹 Dữ liệu gốc để so sánh
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [filter, setFilter] = useState("Tất cả");

  // 🔹 Lấy danh sách học sinh
  const fetchStudentAssignments = useCallback(async () => {
    try {
      const res = await getStudentAssignmentsByAssignmentIdApi(assignmentId);
      const data = res.data || [];
      setStudents(data);
      setOriginalStudents(JSON.parse(JSON.stringify(data))); // Lưu bản sao sâu để so sánh
    } catch (error) {
      console.error("Lỗi khi lấy danh sách học sinh:", error);
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

  useEffect(() => {
    fetchStudentAssignments();
  }, [fetchStudentAssignments]);

  //  Thay đổi trạng thái hoặc nhận xét
  const handleChange = (id, key, value) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [key]: value } : s))
    );
  };

  //  Thống kê trạng thái
  const stats = useMemo(() => {
    const countByStatus = (status) =>
      students.filter((s) => s.submittedStatus === status).length;
    return {
      all: students.length,
      pending: countByStatus("pending"),
      incomplete: countByStatus("incomplete"),
      submitted: countByStatus("submitted"),
    };
  }, [students]);

  //  Lọc danh sách học sinh theo trạng thái
  const filteredStudents = useMemo(() => {
    return filter === "Tất cả"
      ? students
      : students.filter((s) => s.submittedStatus === filter);
  }, [students, filter]);

  //  Lưu thay đổi (chỉ gửi những dòng thay đổi)
  const handleSave = async () => {
    try {
      const changedStudents = students.filter((s, i) => {
        const original = originalStudents[i];
        return (
          s.submittedStatus !== original.submittedStatus ||
          s.feedback !== original.feedback
        );
      });

      if (changedStudents.length === 0) {
        alert("Không có thay đổi nào để lưu.");
        setIsEditing(false);
        return;
      }

      await Promise.all(
        changedStudents.map((s) =>
          updateStudentAssignmentApi(s.id, {
            submittedStatus: s.submittedStatus,
            feedback: s.feedback,
          })
        )
      );
      setOriginalStudents(JSON.parse(JSON.stringify(students))); 
      setIsEditing(false);
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
      alert("Cập nhật thất bại!");
    }
  };

  if (loading) return <p className="loading-text">Đang tải dữ liệu...</p>;

  return (
    <div className="assignment-detail-container">
      {/* 🔙 Header */}
      <div className="header-row">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FiArrowLeft /> Trở lại
        </button>

        <button
          className="edit-button"
          onClick={isEditing ? handleSave : () => setIsEditing(true)}
        >
          {isEditing ? (
            <>
              <FiSend style={{ marginRight: 6 }} /> Lưu thay đổi
            </>
          ) : (
            <>
              <FiEdit2 style={{ marginRight: 6 }} /> Chỉnh sửa
            </>
          )}
        </button>
      </div>

      <h2 className="page-title">Danh sách học sinh làm bài</h2>

      {/* 🔹 Thanh filter */}
      <div className="filter-bar">
        <div className="tabs">
          {[
            { label: "Tất cả", key: "Tất cả", count: stats.all },
            { label: "Chưa làm", key: "pending", count: stats.pending },
            { label: "Chưa hoàn thành", key: "incomplete", count: stats.incomplete },
            { label: "Hoàn thành", key: "submitted", count: stats.submitted },
          ].map((tab) => (
            <button
              key={tab.key}
              className={`tab ${filter === tab.key ? "active" : ""}`}
              onClick={() => setFilter(tab.key)}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* 🔹 Danh sách học sinh */}
      {filteredStudents.length === 0 ? (
        <p className="empty-text">Không có học sinh trong danh sách này.</p>
      ) : (
        <div className="student-list">
          {filteredStudents.map((s, index) => (
            <div key={s.id} className="student-row">
              <div className="student-info">
                <div className="avatar">
                  <FiUser />
                </div>
                <div>
                  <div className="assginstudent-name">
                    {s.Student?.userInfo?.fullName}
                  </div>
                  <div className="student-index">#{index + 1}</div>
                </div>
              </div>

              <div className="student-status">
                {isEditing ? (
                  <select
                    value={s.submittedStatus}
                    onChange={(e) =>
                      handleChange(s.id, "submittedStatus", e.target.value)
                    }
                    className={`status-select ${s.submittedStatus}`}
                  >
                    <option value="pending">Chưa làm</option>
                    <option value="incomplete">Chưa hoàn thành</option>
                    <option value="submitted">Hoàn thành</option>
                  </select>
                ) : (
                  <span
                    className={`assignment-status-badge ${s.submittedStatus}`}
                  >
                    {s.submittedStatus === "submitted"
                      ? "Hoàn thành"
                      : s.submittedStatus === "incomplete"
                      ? "Chưa hoàn thành"
                      : "Chưa làm"}
                  </span>
                )}
              </div>

              <div className="student-feedback">
                {isEditing ? (
                  <input
                    type="text"
                    value={s.feedback || ""}
                    onChange={(e) =>
                      handleChange(s.id, "feedback", e.target.value)
                    }
                    placeholder="Nhập nhận xét..."
                    className="feedback-input"
                  />
                ) : (
                  <span className="feedback-text">{s.feedback || "—"}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
