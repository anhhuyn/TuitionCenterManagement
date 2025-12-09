import React, { useState, useEffect } from "react";
import { 
  getRoomScheduleApi, getRoomsApi, createRoomApi, updateRoomApi, deleteRoomApi 
} from "../util/api";
import { 
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CFormLabel 
} from "@coreui/react";
import Select from "react-select";
import "../styles/RoomSchedulePage.css";

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

const formatTime = (timeStr) => timeStr?.slice(0, 5) || "";

const statusMap = {
  scheduled: "Đã lên lịch",
  completed: "Đã hoàn thành",
  canceled: "Đã hủy",
};

const RoomSchedulePage = () => {
  const [activeTab, setActiveTab] = useState("check");
  const [rooms, setRooms] = useState([]);
  const [roomId, setRoomId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Quản lý phòng
  const [roomList, setRoomList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomForm, setRoomForm] = useState({ name: "", seatCapacity: "" });

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await getRoomsApi();
        setRooms(res || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchRooms();
  }, []);

  useEffect(() => {
    const fetchSchedule = async () => {
      if (!roomId || !startDate || !endDate) {
        setSchedule([]);
        setError("");
        return;
      }
      setLoading(true);
      setError("");
      try {
        const res = await getRoomScheduleApi(roomId, startDate, endDate);
        if (res.success === false) {
          setError(res.error);
          setSchedule([]);
        } else {
          setSchedule(res.data || []);
        }
      } catch {
        setError("Có lỗi xảy ra khi lấy lịch phòng");
        setSchedule([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, [roomId, startDate, endDate]);

  useEffect(() => {
    if (activeTab === "manage") loadRooms();
  }, [activeTab]);

  const loadRooms = async () => {
    const res = await getRoomsApi();
    setRoomList(res || []);
  };

  const openAddRoom = () => {
    setEditingRoom(null);
    setRoomForm({ name: "", seatCapacity: "" });
    setShowModal(true);
  };

  const openEditRoom = (room) => {
    setEditingRoom(room);
    setRoomForm({ name: room.name, seatCapacity: room.seatCapacity });
    setShowModal(true);
  };

  const handleSubmitRoom = async () => {
    try {
      if (editingRoom) await updateRoomApi(editingRoom.id, roomForm);
      else await createRoomApi(roomForm);
      setShowModal(false);
      loadRooms();
    } catch {
      alert("Có lỗi xảy ra!");
    }
  };

  const handleDeleteRoom = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa phòng này?")) return;
    try {
      await deleteRoomApi(id);
      loadRooms();
    } catch {
      alert("Không thể xóa phòng!");
    }
  };

  return (
    <div className="room-schedule-container">
      {/* Tabs */}
      <div className="room-schedule-header">
        <button className={activeTab === "check" ? "active" : "inactive"} onClick={() => setActiveTab("check")}>Kiểm tra lịch phòng</button>
        <button className={activeTab === "manage" ? "active" : "inactive"} onClick={() => setActiveTab("manage")}>Quản lý phòng</button>
      </div>

      {activeTab === "check" && (
        <>
          <div className="room-schedule-form">
            <div className="form-group">
              <CFormLabel>Chọn phòng</CFormLabel>
              <Select
                className="custom-select"
                options={rooms.map(r => ({ value: r.id, label: `${r.name} (Sức chứa: ${r.seatCapacity})` }))}
                value={rooms.map(r => ({ value: r.id, label: `${r.name} (Sức chứa: ${r.seatCapacity})` })).find(opt => opt.value === roomId) || null}
                isClearable
                placeholder="-- Chọn phòng --"
                onChange={v => setRoomId(v?.value || "")}
              />
            </div>
            <div className="form-group">
              <CFormLabel>Từ ngày:</CFormLabel>
              <input type="date" className="custom-input" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div className="form-group">
              <CFormLabel>Đến ngày:</CFormLabel>
              <input type="date" className="custom-input" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
          </div>

          {error && <p className="room-schedule-error">{error}</p>}
          {loading && <p>Đang tải dữ liệu...</p>}

          <CTable bordered hover responsive className="room-schedule-table">
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Ngày học</CTableHeaderCell>
                <CTableHeaderCell>Môn học</CTableHeaderCell>
                <CTableHeaderCell>Giờ bắt đầu</CTableHeaderCell>
                <CTableHeaderCell>Giờ kết thúc</CTableHeaderCell>
                <CTableHeaderCell>Trạng thái</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {schedule.length ? schedule.map(s => (
                <CTableRow key={s.sessionId}>
                  <CTableDataCell>{formatDate(s.sessionDate)}</CTableDataCell>
                  <CTableDataCell>{s.subjectName}</CTableDataCell>
                  <CTableDataCell>{formatTime(s.sessionStartTime)}</CTableDataCell>
                  <CTableDataCell>{formatTime(s.sessionEndTime)}</CTableDataCell>
                  <CTableDataCell className={`room-status-${s.sessionStatus}`}>{statusMap[s.sessionStatus] || s.sessionStatus}</CTableDataCell>
                </CTableRow>
              )) : (
                <CTableRow>
                  <CTableDataCell colSpan={5} style={{ textAlign: "center", color: "#888" }}>Chưa có dữ liệu</CTableDataCell>
                </CTableRow>
              )}
            </CTableBody>
          </CTable>
        </>
      )}

      {activeTab === "manage" && (
        <div className="manage-room-container">
          <div className="manage-room-header">
            <h4 className="manage-room-title"></h4>
            <button className="btn btn-primary btn-add-room" onClick={openAddRoom}>+ Thêm phòng</button>
          </div>

          <CTable bordered hover responsive className="manage-room-table">
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell style={{ width: "60px" }}>ID</CTableHeaderCell>
                <CTableHeaderCell>Tên phòng</CTableHeaderCell>
                <CTableHeaderCell style={{ width: "150px" }}>Sức chứa</CTableHeaderCell>
                <CTableHeaderCell style={{ width: "180px" }}>Hành động</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {roomList.map(room => (
                <CTableRow key={room.id}>
                  <CTableDataCell>{room.id}</CTableDataCell>
                  <CTableDataCell>{room.name}</CTableDataCell>
                  <CTableDataCell>{room.seatCapacity}</CTableDataCell>
                  <CTableDataCell>
                    <button className="btn btn-warning btn-sm me-2" onClick={() => openEditRoom(room)}>Sửa</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteRoom(room.id)}>Xóa</button>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>

          {showModal && (
            <div className="modal-backdrop-room">
              <div className="modal-room">
                <h4>{editingRoom ? "Sửa phòng" : "Thêm phòng"}</h4>
                <label>Tên phòng</label>
                <input type="text" value={roomForm.name} onChange={e => setRoomForm({...roomForm, name: e.target.value})} />
                <label>Sức chứa</label>
                <input type="number" value={roomForm.seatCapacity} onChange={e => setRoomForm({...roomForm, seatCapacity: e.target.value})} />
                <div className="modal-buttons">
                  <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                  <button className="btn btn-primary" onClick={handleSubmitRoom}>{editingRoom ? "Cập nhật" : "Thêm"}</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RoomSchedulePage;
