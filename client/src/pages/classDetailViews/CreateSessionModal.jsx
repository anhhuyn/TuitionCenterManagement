import React, { useState, useEffect } from "react";
import "../../styles/classDetailViews/CreateScheduleModal.css";
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
    } else {
      setFormData({
        sessionDate: "",
        startTime: "08:00",
        endTime: "10:00",
        roomId: "",
        status: "scheduled",
      });
    }
  }, [initialData]);

  const handleSubmit = async () => {
    const { sessionDate, startTime, endTime, roomId, status } = formData;

    if (!sessionDate) {
      alert("Vui lòng chọn ngày học!");
      return;
    }

    const now = new Date();
    const sessionStart = new Date(`${sessionDate}T${startTime}`);
    const sessionEnd = new Date(`${sessionDate}T${endTime}`);

    if (sessionEnd <= sessionStart) {
      alert("Giờ kết thúc phải sau giờ bắt đầu!");
      return;
    }

    if (!isEdit) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (sessionStart < today) {
        alert("Không thể tạo buổi học trong quá khứ!");
        return;
      }

      const isSameDay =
        sessionStart.getFullYear() === today.getFullYear() &&
        sessionStart.getMonth() === today.getMonth() &&
        sessionStart.getDate() === today.getDate();

      if (isSameDay && sessionStart <= new Date()) {
        alert("Không thể tạo buổi học trong ngày hôm nay có giờ đã trôi qua!");
        return;
      }
    }

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
      const msg =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        "Có lỗi xảy ra khi lưu buổi học!";

      if (msg.includes("cùng phòng")) {
        alert("Giờ học bị trùng với buổi khác trong cùng phòng!");
      } else if (msg.includes("cùng lớp") || msg.includes("cùng môn")) {
        alert("Giờ học bị trùng với buổi khác của cùng lớp!");
      } else if (msg.includes("Giờ kết thúc")) {
        alert("Giờ kết thúc phải sau giờ bắt đầu!");
      } else if (msg.includes("Giờ bắt đầu không hợp lệ")) {
        alert("Không thể tạo buổi học đã trôi qua so với hiện tại!");
      } else {
        alert(msg);
      }
    }
  };

  return (
    <div className="create-schedule-overlay">
      <div className="create-schedule-modal">
        <h2>{isEdit ? "Chỉnh sửa buổi học" : "Thêm buổi học thủ công"}</h2>

        <label>
          Ngày học:
          <input
            type="date"
            value={formData.sessionDate}
            onChange={(e) =>
              setFormData({ ...formData, sessionDate: e.target.value })
            }
          />
        </label>

        <label>
          Giờ bắt đầu:
          <input
            type="time"
            value={formData.startTime}
            onChange={(e) =>
              setFormData({ ...formData, startTime: e.target.value })
            }
          />
        </label>

        <label>
          Giờ kết thúc:
          <input
            type="time"
            value={formData.endTime}
            onChange={(e) =>
              setFormData({ ...formData, endTime: e.target.value })
            }
          />
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

        <div className="create-schedule-actions">
          <button onClick={handleSubmit}>
            {isEdit ? "Cập nhật" : "Tạo"}
          </button>
          <button onClick={onClose}>Hủy</button>
        </div>
      </div>
    </div>
  );
}
