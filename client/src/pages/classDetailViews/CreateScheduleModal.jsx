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

    const handleCreateSchedule = async () => {
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
                alert(data.message || "Có lỗi xảy ra");
            }
        } catch (error) {
            console.error("Lỗi tạo lịch học:", error);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>Tạo lịch học mới</h2>
                <label>
                    Ngày bắt đầu:
                    <input
                        type="date"
                        value={formData.startDate}
                        onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    />
                </label>
                <label>
                    Ngày kết thúc:
                    <input
                        type="date"
                        value={formData.endDate}
                        onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                    />
                </label>
                <label>
                    Thứ trong tuần:
                    <select
                        value={formData.dayOfWeek}
                        onChange={e => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
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
                        onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                    />
                </label>
                <label>
                    Giờ kết thúc:
                    <input
                        type="time"
                        value={formData.endTime}
                        onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                    />
                </label>
                <label>
                    Phòng học:
                    <select
                        value={formData.roomId}
                        onChange={e => setFormData({ ...formData, roomId: parseInt(e.target.value) })}
                    >
                        <option value="">-- Chọn phòng --</option>
                        {rooms.map(room => (
                            <option key={room.id} value={room.id}>
                                {room.name} (Sức chứa: {room.seatCapacity})
                            </option>
                        ))}
                    </select>
                </label>

                <div className="modal-actions">
                    <button onClick={handleCreateSchedule}>Tạo</button>
                    <button onClick={onClose}>Hủy</button>
                </div>
            </div>
        </div>
    );
}
