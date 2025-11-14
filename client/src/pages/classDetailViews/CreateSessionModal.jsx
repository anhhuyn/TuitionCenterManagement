import React, { useState, useEffect } from "react";
import "../../styles/classDetailViews/CreateScheduleModal.css";
import { FiCalendar } from "react-icons/fi"; 
import {
  getRoomsApi,
  createSessionApi,
  updateSessionApi,
} from "../../util/api";

export default function CreateSessionModal({
  subjectId,
  onClose,
  onSuccess,
  initialData = null,
  isEdit = false,
}) {
  const [formData, setFormData] = useState({
    sessionDate: "",
    startTime: "08:00",
    endTime: "10:00",
    roomId: "",
    status: "scheduled",
  });

  // Track lỗi từng field
  const [errors, setErrors] = useState({});

  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await getRoomsApi();
        setRooms(res || []);
      } catch (err) {
        console.error("Lỗi khi tải danh sách phòng:", err);
      }
    };
    fetchRooms();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        sessionDate: initialData.sessionDate || "",
        startTime: initialData.startTime || "08:00",
        endTime: initialData.endTime || "10:00",
        roomId: initialData.roomId || "",
        status: initialData.status || "scheduled",
      });
    }
  }, [initialData]);

  const handleSubmit = async () => {
    const { sessionDate, startTime, endTime } = formData;

    let newErrors = {};

    // Kiểm tra các trường bắt buộc
    if (!sessionDate) newErrors.sessionDate = "Vui lòng chọn ngày học!";
    if (!startTime) newErrors.startTime = "Vui lòng chọn giờ bắt đầu!";
    if (!endTime) newErrors.endTime = "Vui lòng chọn giờ kết thúc!";

    const sessionStart = new Date(`${sessionDate}T${startTime}`);
    const sessionEnd = new Date(`${sessionDate}T${endTime}`);

    if (startTime && endTime && sessionEnd <= sessionStart) {
      newErrors.endTime = "Giờ kết thúc phải sau giờ bắt đầu!";
    }

    setErrors(newErrors);

    // Nếu có lỗi thì không submit
    if (Object.keys(newErrors).length > 0) return;

    try {
      let res;
      if (isEdit && initialData?.id) {
        res = await updateSessionApi(initialData.id, formData);
      } else {
        res = await createSessionApi({ subjectId, ...formData });
      }

      if (res?.status === 500 || res?.error || res?.message?.includes("Error")) {
        const msg = res?.error || res?.message || "Có lỗi xảy ra khi lưu buổi học!";
        alert(msg);
        return;
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Lỗi khi lưu session:", error);
      alert("Có lỗi xảy ra khi lưu buổi học!");
    }
  };

  return (
    <div className="create-schedule-overlay">
      <div className="create-schedule-modal">
        {/* Header */}
        <div className="create-schedule-header">
          <FiCalendar size={20} /> {/* icon lịch */}
          <h2>{isEdit ? "Chỉnh sửa buổi học" : "Thêm buổi học thủ công"}</h2>
        </div>

        {/* Body */}
        <div className="create-schedule-body">
          <label>
            Ngày học: <span className="required">*</span>
            <input
              type="date"
              value={formData.sessionDate}
              onChange={(e) =>
                setFormData({ ...formData, sessionDate: e.target.value })
              }
            />
            {errors.sessionDate && <div className="error-text">{errors.sessionDate}</div>}
          </label>

          <label>
            Giờ bắt đầu: <span className="required">*</span>
            <input
              type="time"
              value={formData.startTime}
              onChange={(e) =>
                setFormData({ ...formData, startTime: e.target.value })
              }
            />
            {errors.startTime && <div className="error-text">{errors.startTime}</div>}
          </label>

          <label>
            Giờ kết thúc: <span className="required">*</span>
            <input
              type="time"
              value={formData.endTime}
              onChange={(e) =>
                setFormData({ ...formData, endTime: e.target.value })
              }
            />
            {errors.endTime && <div className="error-text">{errors.endTime}</div>}
          </label>

          <label>
            Phòng học:
            <select
              value={formData.roomId || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  roomId: e.target.value === "" ? "" : parseInt(e.target.value),
                })
              }
            >
              <option value="">-- Chọn phòng --</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name} (Sức chứa: {room.seatCapacity})
                </option>
              ))}
            </select>
          </label>

          <label>
            Trạng thái:
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
            >
              <option value="scheduled">Đã lên lịch</option>
              <option value="completed">Đã hoàn thành</option>
              <option value="canceled">Đã huỷ</option>
            </select>
          </label>
        </div>

        {/* Footer */}
        <div className="create-schedule-footer">
          <button onClick={onClose}>Hủy</button>
          <button onClick={handleSubmit}>
            {isEdit ? "Cập nhật" : "Tạo"}
          </button>
        </div>
      </div>
    </div>
  );
}
