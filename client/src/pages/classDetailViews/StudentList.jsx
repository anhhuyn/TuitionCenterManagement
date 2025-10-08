import React, { useEffect, useState, useRef } from "react";
import { getStudentsBySubjectIdApi, removeStudentFromSubjectApi } from "../../util/api";
import "../../styles/CustomerTable.css";
import ConfirmModal from "../../components/modal/ConfirmModal";
import AddStudentModal from "./AddStudentModal";

import CIcon from "@coreui/icons-react";
import {
  cilFilter,
  cilSearch,
  cilPencil,
  cilTrash,
} from "@coreui/icons";

export default function StudentList({ classData }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [isDeleteMultiple, setIsDeleteMultiple] = useState(false); // Xác định là xóa nhiều hay 1
  const [showAddModal, setShowAddModal] = useState(false);

  const confirmDeleteSelected = () => {
    if (selected.length === 0) return;
    setIsDeleteMultiple(true);
    setShowConfirmModal(true);
  };

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const studentsData = await getStudentsBySubjectIdApi(classData.id);
        if (studentsData && Array.isArray(studentsData)) {
          setStudents(studentsData);
        } else {
          setStudents([]);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách học sinh:", error);
      } finally {
        setLoading(false);
      }
    };

    if (classData?.id) {
      fetchStudents();
    }
  }, [classData]);

  // Checkbox chọn tất cả
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelected(students.map((s) => s.id));
    } else {
      setSelected([]);
    }
  };

  // Checkbox từng dòng
  const handleSelectRow = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((s) => s !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const confirmDeleteStudent = (studentId) => {
    setStudentToDelete(studentId);
    setShowConfirmModal(true);
  };

  const handleDeleteStudent = async () => {
    if (!studentToDelete || !classData?.id) return;

    try {
      await removeStudentFromSubjectApi(studentToDelete, classData.id);
      setStudents((prev) => prev.filter((s) => s.id !== studentToDelete));
      setSelected((prev) => prev.filter((id) => id !== studentToDelete));
    } catch (error) {
      console.error("Lỗi khi xóa học sinh:", error);
      alert("Xảy ra lỗi khi xóa học sinh. Vui lòng thử lại.");
    } finally {
      setShowConfirmModal(false);
      setStudentToDelete(null);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      if (isDeleteMultiple) {
        // Xóa nhiều học sinh
        await Promise.all(
          selected.map((studentId) => removeStudentFromSubjectApi(studentId, classData.id))
        );
        setStudents((prev) => prev.filter((s) => !selected.includes(s.id)));
        setSelected([]);
      } else {
        // Xóa 1 học sinh
        if (!studentToDelete) return;
        await removeStudentFromSubjectApi(studentToDelete, classData.id);
        setStudents((prev) => prev.filter((s) => s.id !== studentToDelete));
        setSelected((prev) => prev.filter((id) => id !== studentToDelete));
        setStudentToDelete(null);
      }
    } catch (error) {
      console.error("Lỗi khi xóa học sinh:", error);
      alert("Xảy ra lỗi khi xóa học sinh. Vui lòng thử lại.");
    } finally {
      setShowConfirmModal(false);
      setIsDeleteMultiple(false);
    }
  };

  // Tìm kiếm học sinh theo tên hoặc trường
  // Hàm tách họ, tên lót, tên
  const splitNameParts = (fullName) => {
    const parts = fullName?.trim().split(" ") || [];
    const name = parts[parts.length - 1] || ""; // Tên cuối
    const middle = parts.slice(1, parts.length - 1).join(" "); // Tên lót (các từ ở giữa)
    const last = parts[0] || ""; // Họ
    return { name, middle, last };
  };

  const filteredStudents = students
    .filter(
      (stu) =>
        stu.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        stu.schoolName?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const nameA = splitNameParts(a.fullName);
      const nameB = splitNameParts(b.fullName);

      // So sánh tên cuối
      const nameCompare = nameA.name.localeCompare(nameB.name, "vi", { sensitivity: "base" });
      if (nameCompare !== 0) return nameCompare;

      // Nếu tên cuối giống, so sánh tên lót
      const middleCompare = nameA.middle.localeCompare(nameB.middle, "vi", { sensitivity: "base" });
      if (middleCompare !== 0) return middleCompare;

      // Nếu tên lót cũng giống, so sánh họ
      return nameA.last.localeCompare(nameB.last, "vi", { sensitivity: "base" });
    });

  if (loading) return <p>Đang tải danh sách học sinh...</p>;

  return (
    <div className="table-container">
      {/* Thanh công cụ trên */}
      <div className="top-bar">
        <div className="left-tools">
          <button className="btn-filter">
            <CIcon icon={cilFilter} />
          </button>

          <div className="search-wrapper">
            <CIcon icon={cilSearch} className="search-icon" />
            <input
              type="text"
              placeholder="Tìm học sinh..."
              className="search-box"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="right-tools">
          <button
            className="btn-delete-selected"
            disabled={selected.length === 0}
            onClick={confirmDeleteSelected}
          >
            Xóa đã chọn ({selected.length})
          </button>
          <button className="btn-add" onClick={() => setShowAddModal(true)}>
            + Thêm học sinh
          </button>
        </div>
      </div>

      {/* Bảng danh sách học sinh */}
      <table className="customer-table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                className="custom-checkbox"
                checked={selected.length === students.length && students.length > 0}
                onChange={handleSelectAll}
              />
            </th>
            <th>STT</th>
            <th>Họ và tên</th>
            <th>Giới tính</th>
            <th>Ngày sinh</th>
            <th>Trường</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
                Không tìm thấy học sinh nào.
              </td>
            </tr>
          ) : (
            filteredStudents.map((stu, index) => (
              <tr key={stu.id}>
                <td>
                  <input
                    type="checkbox"
                    className="custom-checkbox"
                    checked={selected.includes(stu.id)}
                    onChange={() => handleSelectRow(stu.id)}
                  />
                </td>
                <td>{index + 1}</td>
                <td>{stu.fullName}</td>
                <td>
                  {stu.gender === true
                    ? "Nam"
                    : stu.gender === false
                      ? "Nữ"
                      : "Không xác định"}
                </td>
                <td>{stu.dateOfBirth}</td>
                <td>{stu.schoolName}</td>
                <td className="action-cell">
                  <button className="btn-edit">
                    <CIcon icon={cilPencil} />
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => {
                      setStudentToDelete(stu.id);
                      setIsDeleteMultiple(false);
                      setShowConfirmModal(true);
                    }}
                  >
                    <CIcon icon={cilTrash} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {showConfirmModal && (
        <ConfirmModal
          title={isDeleteMultiple ? "Xác nhận xóa nhiều học sinh" : "Xác nhận xóa học sinh"}
          message={
            isDeleteMultiple
              ? `Bạn có chắc chắn muốn xóa ${selected.length} học sinh khỏi môn học?`
              : "Bạn có chắc chắn muốn xóa học sinh này khỏi môn học?"
          }
          cancelText="Hủy"
          confirmText="Xóa"
          onCancel={() => {
            setShowConfirmModal(false);
            setStudentToDelete(null);
            setIsDeleteMultiple(false);
          }}
          onConfirm={handleConfirmDelete}
        />
      )}
      {showAddModal && (
        <AddStudentModal
          onClose={() => setShowAddModal(false)}
          classId={classData.id}
          grade={classData.grade}
          existingStudents={students}  
          onSuccess={() => setSelected([])}
          onStudentAdded={(newStu) => {
            setStudents((prev) => [...prev, newStu]);
          }}
        />
      )}
    </div>
  );
}
