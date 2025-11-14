import React, { useState, useEffect } from "react";
import "../../styles/classDetailViews/CreateScheduleModal.css";
import { FiCalendar } from "react-icons/fi"; 
export default function CreateScheduleModal({ subjectId, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    dayOfWeek: 1,
    startTime: "08:00",
    endTime: "10:00",
    roomId: "",
    startDate: "",
    endDate: "",
  });

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  // State để lưu lỗi từng field
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch("http://localhost:8088/v1/api/rooms");
        const data = await res.json();
        if (res.ok) {
          setRooms(data.data || []);
        } else {
          console.error("Lỗi khi tải danh sách phòng:", data.message);
        }
      } catch (err) {
        console.error("Lỗi khi fetch phòng học:", err);
      }
    };
    fetchRooms();
  }, []);

  const handleCreateSchedule = async () => {
    const { startDate, endDate, startTime, endTime } = formData;
    let newErrors = {};

    // Kiểm tra các field bắt buộc
    if (!startDate) newErrors.startDate = "Vui lòng chọn ngày bắt đầu!";
    if (!endDate) newErrors.endDate = "Vui lòng chọn ngày kết thúc!";
    if (endTime <= startTime) newErrors.endTime = "Giờ kết thúc phải sau giờ bắt đầu!";

    // Kiểm tra ngày kết thúc >= ngày bắt đầu
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end < start) newErrors.endDate = "Ngày kết thúc phải sau hoặc bằng ngày bắt đầu!";
    }

    setErrors(newErrors);

    // Nếu có lỗi, dừng submit
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8088/v1/api/subject-schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectId, ...formData }),
      });
      const data = await res.json();

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const msg = data?.error || data?.message || "Có lỗi xảy ra khi tạo lịch học!";
        alert(msg);
      }
    } catch (error) {
      console.error("Lỗi tạo lịch học:", error);
      alert("Lỗi kết nối tới máy chủ!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-schedule-overlay">
      <div className="create-schedule-modal">
        {/* Header */}
        <div className="create-schedule-header">
          <FiCalendar size={20} /> {/* icon lịch */}
          <h2>Tạo lịch học mới</h2>
        </div>

        {/* Body */}
        <div className="create-schedule-body">
          <label>
            Ngày bắt đầu: <span className="required">*</span>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
            {errors.startDate && <div className="error-text">{errors.startDate}</div>}
          </label>

          <label>
            Ngày kết thúc: <span className="required">*</span>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
            {errors.endDate && <div className="error-text">{errors.endDate}</div>}
          </label>

          <label>
            Thứ trong tuần: <span className="required">*</span>
            <select
              value={formData.dayOfWeek}
              onChange={(e) => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
            >
              <option value={0}>Chủ nhật</option>
              <option value={1}>Thứ 2</option>
              <option value={2}>Thứ 3</option>
              <option value={3}>Thứ 4</option>
              <option value={4}>Thứ 5</option>
              <option value={5}>Thứ 6</option>
              <option value={6}>Thứ 7</option>
            </select>
          </label>

          <label>
            Giờ bắt đầu: <span className="required">*</span>
            <input
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            />
          </label>

          <label>
            Giờ kết thúc: <span className="required">*</span>
            <input
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            />
            {errors.endTime && <div className="error-text">{errors.endTime}</div>}
          </label>

          <label>
            Phòng học:
            <select
              value={formData.roomId}
              onChange={(e) => setFormData({ ...formData, roomId: parseInt(e.target.value) })}
            >
              <option value="">-- Chọn phòng --</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name} (Sức chứa: {room.seatCapacity})
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Footer */}
        <div className="create-schedule-footer">
          <button onClick={onClose}>Hủy</button>
          <button onClick={handleCreateSchedule} disabled={loading}>
            {loading ? "Đang tạo..." : "Tạo"}
          </button>
        </div>
      </div>
    </div>
  );
}
