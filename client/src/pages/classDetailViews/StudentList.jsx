import React, { useEffect, useState } from "react";
import { getStudentsBySubjectIdApi, removeStudentFromSubjectApi, getUserApi } from "../../util/api";
import "../../styles/classDetailViews/StudentList.css";
import ConfirmModal from "../../components/modal/ConfirmModal";
import AddStudentModal from "./AddStudentModal";

import CIcon from "@coreui/icons-react";
import { cilFilter, cilSearch } from "@coreui/icons";

export default function StudentList({ classData }) {
  const [user, setUser] = useState(null);
  const [roleId, setRoleId] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [isDeleteMultiple, setIsDeleteMultiple] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const confirmDeleteSelected = () => {
    if (selected.length === 0) return;
    setIsDeleteMultiple(true);
    setShowConfirmModal(true);
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getUserApi();
        if (res) {
          setUser(res);
          setRoleId(res.roleId);
        }
      } catch (err) {
        console.error("Lỗi khi lấy thông tin user:", err);
      }
    };

    fetchUser();
  }, []);

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

    if (classData?.id) fetchStudents();
  }, [classData]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelected(students.map((s) => s.id));
    } else {
      setSelected([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const confirmDeleteStudent = (studentId) => {
    setStudentToDelete(studentId);
    setIsDeleteMultiple(false);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      if (isDeleteMultiple) {
        await Promise.all(
          selected.map((studentId) =>
            removeStudentFromSubjectApi(studentId, classData.id)
          )
        );
        setStudents((prev) => prev.filter((s) => !selected.includes(s.id)));
        setSelected([]);
      } else {
        await removeStudentFromSubjectApi(studentToDelete, classData.id);
        setStudents((prev) => prev.filter((s) => s.id !== studentToDelete));
        setSelected((prev) => prev.filter((id) => id !== studentToDelete));
      }
    } catch (error) {
      alert("Xảy ra lỗi khi xóa học sinh.");
    } finally {
      setShowConfirmModal(false);
      setIsDeleteMultiple(false);
      setStudentToDelete(null);
    }
  };

  // --- Tìm kiếm + sắp xếp ---
  const splitNameParts = (fullName) => {
    const parts = fullName?.trim().split(" ") || [];
    return {
      name: parts[parts.length - 1] || "",
      middle: parts.slice(1, parts.length - 1).join(" "),
      last: parts[0] || "",
    };
  };

  const filteredStudents = students
    .filter(
      (stu) =>
        stu.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        stu.schoolName?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const A = splitNameParts(a.fullName);
      const B = splitNameParts(b.fullName);

      let cmp = A.name.localeCompare(B.name, "vi", { sensitivity: "base" });
      if (cmp !== 0) return cmp;

      cmp = A.middle.localeCompare(B.middle, "vi", { sensitivity: "base" });
      if (cmp !== 0) return cmp;

      return A.last.localeCompare(B.last, "vi", { sensitivity: "base" });
    });

  if (loading) return <p>Đang tải danh sách học sinh...</p>;

  return (
    <div className="studentlist-container">
      {/* === Thanh công cụ trên === */}
      <div className="studentlist-topbar">
        <div className="studentlist-lefttools">
          <button className="studentlist-btn-filter">
            <CIcon icon={cilFilter} />
          </button>

          <div className="studentlist-search-wrapper">
            <CIcon icon={cilSearch} className="studentlist-search-icon" />
            <input
              type="text"
              placeholder="Tìm học sinh..."
              className="studentlist-searchbox"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="studentlist-righttools">
          {roleId !== "R1" && (
            <>
              <button
                className="studentlist-btn-delete-selected"
                disabled={selected.length === 0}
                onClick={confirmDeleteSelected}
              >
                Xóa đã chọn ({selected.length})
              </button>

              <button
                className="studentlist-btn-add"
                onClick={() => setShowAddModal(true)}
              >
                + Thêm học sinh
              </button>
            </>
          )}
        </div>
      </div>

      {/* === Bảng danh sách học sinh === */}
      <table className="studentlist-table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                className="studentlist-checkbox"
                checked={selected.length === students.length && students.length > 0}
                onChange={handleSelectAll}
              />
            </th>
            <th>STT</th>
            <th>Họ và tên</th>
            <th>Giới tính</th>
            <th>Ngày sinh</th>
            <th>Trường</th>
          </tr>
        </thead>

        <tbody>
          {filteredStudents.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                Không tìm thấy học sinh nào.
              </td>
            </tr>
          ) : (
            filteredStudents.map((stu, index) => (
              <tr key={stu.id}>
                <td>
                  <input
                    type="checkbox"
                    className="studentlist-checkbox"
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
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* === Modal Xác nhận === */}
      {showConfirmModal && (
        <ConfirmModal
          title={
            isDeleteMultiple ? "Xác nhận xóa nhiều học sinh" : "Xác nhận xóa học sinh"
          }
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

      {/* === Modal Thêm học sinh === */}
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
