import React from "react";
import "./FilterPanel.css";

export default function FilterPanel({ onClose }) {
  return (
    <div className="filter-panel">
      <div className="filter-row">
        <div className="filter-item">
          <label>Sắp xếp</label>
          <select>
            <option>Sắp xếp dữ liệu</option>
            <option>Tăng dần</option>
            <option>Giảm dần</option>
          </select>
        </div>
        <div className="filter-item">
          <label>Trạng thái</label>
          <select>
            <option>Chọn trạng thái</option>
            <option>Đang học</option>
            <option>Bảo lưu</option>
            <option>Đã nghỉ</option>
          </select>
        </div>
      </div>

      <div className="filter-row">
        <div className="filter-item">
          <label>Tình trạng học</label>
          <select>
            <option>Chọn tình trạng học</option>
            <option>Còn hạn</option>
            <option>Hết hạn</option>
          </select>
        </div>
        <div className="filter-item">
          <label>Tư vấn viên</label>
          <select>
            <option>Chọn tư vấn viên</option>
            <option>Nguyễn Văn A</option>
            <option>Trần Thị B</option>
          </select>
        </div>
      </div>

      <div className="filter-actions">
        <button className="btn-reset">Khôi phục</button>
        <button className="btn-apply">Áp dụng</button>
      </div>
    </div>
  );
}
