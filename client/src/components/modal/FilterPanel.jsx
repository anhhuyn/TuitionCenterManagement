import React from "react";
import "./FilterPanel.css";

const FilterPanel = ({ type = "student", filters, onChange }) => {
  const handleChange = (e) => {
    onChange({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="filter-panel">
      {/* 🔹 Bộ lọc chung cho cả học viên và nhân viên */}
      <div className="filter-item">
        <label>Giới tính</label>
        <select name="gender" value={filters.gender || ""} onChange={handleChange}>
          <option value="">Tất cả</option>
          <option value="true">Nam</option>
          <option value="false">Nữ</option>
        </select>
      </div>

      {/* 🔸 Nếu là học viên */}
      {type === "student" && (
        <>
          <div className="filter-item">
            <label>Lớp</label>
            <input
              type="text"
              name="grade"
              value={filters.grade || ""}
              onChange={handleChange}
              placeholder="VD: 12A1"
            />
          </div>

          <div className="filter-item">
            <label>Trường</label>
            <input
              type="text"
              name="schoolName"
              value={filters.schoolName || ""}
              onChange={handleChange}
              placeholder="VD: THPT Nguyễn Trãi"
            />
          </div>

          <div className="filter-item">
            <label>Môn học</label>
            <input
              type="text"
              name="subject"
              value={filters.subject || ""}
              onChange={handleChange}
              placeholder="VD: Toán, Lý..."
            />
          </div>
        </>
      )}

      {/* 🔸 Nếu là nhân viên */}
      {type === "employee" && (
        <div className="filter-item">
          <label>Chuyên môn</label>
          <input
            type="text"
            name="specialty"
            value={filters.specialty || ""}
            onChange={handleChange}
            placeholder="VD: Giảng dạy, Quản lý..."
          />
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
