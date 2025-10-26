import React, { useState, useEffect } from "react";
import "../../styles/classDetailViews/CreateScheduleModal.css";

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

  // Lấy danh sách phòng học
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

  // Xử lý khi bấm "Tạo"
  const handleCreateSchedule = async () => {
    const { startDate, endDate, startTime, endTime } = formData;

    // --- Kiểm tra hợp lệ ---
    if (!startDate) {
      alert("Vui lòng chọn ngày bắt đầu!");
      return;
    }

    const now = new Date();
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : start;

    if (end < start) {
      alert("Ngày kết thúc phải sau hoặc bằng ngày bắt đầu!");
      return;
    }

    if (start < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
      alert("Không thể tạo lịch học bắt đầu trong quá khứ!");
      return;
    }

    if (endTime <= startTime) {
      alert("Giờ kết thúc phải sau giờ bắt đầu!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8088/v1/api/subject-schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectId, ...formData }),
      });
      const data = await res.json();

      if (res.ok) {
        onSuccess(); // reload calendar
        onClose();
      } else {
        const msg = data?.error || data?.message || "Có lỗi xảy ra khi tạo lịch học!";
        console.log("Server error:", data.error);
        if (msg.includes("trùng") && msg.includes("phòng")) {
          alert("Giờ học bị trùng với buổi khác trong cùng phòng!");
        } else if (msg.includes("trùng") && msg.includes("lớp")) {
          alert("Giờ học bị trùng với buổi khác của cùng lớp!");
        } else if (msg.includes("Giờ kết thúc")) {
          alert("Giờ kết thúc phải sau giờ bắt đầu!");
        } else if (msg.includes("quá khứ") || msg.includes("đã trôi qua")) {
          alert("Không thể tạo lịch học bắt đầu trong quá khứ!");
        } else {
          alert(msg);
        }
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
        <h2>Tạo lịch học mới</h2>

        <label>
          Ngày bắt đầu:
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          />
        </label>

        <label>
          Ngày kết thúc:
          <input
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          />
        </label>

        <label>
          Thứ trong tuần:
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
          Giờ bắt đầu:
          <input
            type="time"
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
          />
        </label>

        <label>
          Giờ kết thúc:
          <input
            type="time"
            value={formData.endTime}
            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
          />
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

        <div className="create-schedule-actions">
          <button onClick={handleCreateSchedule} disabled={loading}>
            {loading ? "Đang tạo..." : "Tạo"}
          </button>
          <button onClick={onClose}>Hủy</button>
        </div>
      </div>
    </div>
  );
}
