import React, { useEffect, useState } from "react";
import Select from "react-select";
import "../../styles/classDetailViews/AddStudentModal.css";
import { getStudentsByGradeApi, addStudentToSubjectApi } from "../../util/api";
import ConfirmModal from "../../components/modal/ConfirmModal";

export default function AddStudentModal({ 
  onClose, 
  classId, 
  onSuccess, 
  grade, 
  onStudentAdded, 
  existingStudents = [] 
}) {
  const [studentOptions, setStudentOptions] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      const students = await getStudentsByGradeApi(grade);

      // Lấy danh sách ID học viên đã có trong lớp
      const existingIds = existingStudents.map((s) => s.id);

      // Loại bỏ học viên đã có
      const filtered = students.filter((s) => !existingIds.includes(s.id));

      const options = filtered.map((s) => ({
        value: s.id,
        label: `${s.fullName} – ${s.schoolName} - ${s.dateOfBirth}`,
        raw: s,
      }));

      setStudentOptions(options);
    };

    if (grade) fetchStudents();
  }, [grade, existingStudents]);

  const handleSave = () => {
    if (!selectedStudent) {
      alert("Vui lòng chọn học sinh!");
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmAdd = async () => {
    try {
      setLoading(true);
      const res = await addStudentToSubjectApi(selectedStudent.value, classId);

      if (res && res.message) {
        alert(res.message);
      } 

      onStudentAdded?.(selectedStudent.raw);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Lỗi khi thêm học sinh:", error);
      alert("Có lỗi xảy ra khi thêm học sinh!");
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-subject-style">
        <h3 className="section-header">Thêm học viên</h3>

        <div className="row-line">
          <label>Chọn học viên <span className="required">*</span></label>
          <Select
            options={studentOptions}
            value={selectedStudent}
            onChange={setSelectedStudent}
            placeholder="-- Tìm kiếm hoặc chọn học viên --"
            isSearchable
          />
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="modal-btn-cancel" disabled={loading}>
            Huỷ
          </button>
          <button onClick={handleSave} className="btn-save" disabled={loading}>
            {loading ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </div>

      {showConfirm && (
        <ConfirmModal
          title="Xác nhận thêm học sinh"
          message={`Bạn có chắc chắn muốn thêm học sinh: ${selectedStudent.label}?`}
          cancelText="Hủy"
          confirmText="Thêm"
          onCancel={() => setShowConfirm(false)}
          onConfirm={handleConfirmAdd}
        />
      )}
    </div>
  );
}
