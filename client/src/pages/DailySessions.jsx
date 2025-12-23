import React, { useEffect, useState, useMemo } from "react";
import { getSessionsByDateApi } from "../util/api";
import "../styles/DailySessions.css";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

/* ===== UTILS ===== */
const PERIODS = [
  { key: "morning", title: "Sáng" },
  { key: "afternoon", title: "Chiều" },
  { key: "evening", title: "Tối" },
];

const getPeriodByHour = (hour) => {
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
};

const ROOM_COLOR_PALETTE = [
  "#fbbc0", 
  "#33b679", 
  "#a142f4", 
  "#46bdc6",
  "#1a73e8", 
  "#e67c73", 
];

const darkenColor = (hex, amount = 0.85) => {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.floor(((num >> 16) & 255) * amount);
  const g = Math.floor(((num >> 8) & 255) * amount);
  const b = Math.floor((num & 255) * amount);
  return `rgb(${r}, ${g}, ${b})`;
};

/* ===== TABLE ===== */
const SessionTable = ({ sessions }) => (
  <table className="sessions-table">
    <thead>
      <tr>
        <th>#</th>
        <th>Môn học</th>
        <th>Giờ</th>
        <th>Phòng</th>
        <th>Giáo viên</th>
      </tr>
    </thead>
    <tbody>
      {sessions.map((s, i) => (
        <tr key={s.sessionId}>
          <td>{i + 1}</td>
          <td>{s.subjectName}</td>
          <td>
            {s.startTime} – {s.endTime}
          </td>
          <td>{s.roomName || "—"}</td>
          <td>{s.teacherNames?.join(", ") || "—"}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

/* ===== MAIN ===== */
const DailySessions = () => {
  const today = new Date().toISOString().split("T")[0];

  const [date, setDate] = useState(today);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("table"); // table | grid

  // Filters
  const [subjectFilter, setSubjectFilter] = useState("");
  const [roomFilter, setRoomFilter] = useState("");
  const [teacherFilter, setTeacherFilter] = useState("");

  useEffect(() => {
    loadSessions();
  }, [date]);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const data = await getSessionsByDateApi(date);
      setSessions(Array.isArray(data) ? data : []);
    } catch {
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const changeDate = (delta) => {
    const current = new Date(date);
    current.setDate(current.getDate() + delta);
    setDate(current.toISOString().split("T")[0]);
  };

  // Filter sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const subjectMatch = subjectFilter ? s.subjectName === subjectFilter : true;
      const roomMatch = roomFilter ? s.roomName === roomFilter : true;
      const teacherMatch = teacherFilter
        ? s.teacherNames?.some((t) => t.toLowerCase().includes(teacherFilter.toLowerCase()))
        : true;
      return subjectMatch && roomMatch && teacherMatch;
    });
  }, [sessions, subjectFilter, roomFilter, teacherFilter]);

  // Group sessions
  const grouped = { morning: [], afternoon: [], evening: [] };
  filteredSessions.forEach((s) => {
    const hour = parseInt(s.startTime.split(":")[0], 10);
    grouped[getPeriodByHour(hour)].push(s);
  });

  Object.keys(grouped).forEach((k) => {
    grouped[k].sort((a, b) => a.startTime.localeCompare(b.startTime));
  });

const getRoomStyle = (roomName) => {
  const baseColor = roomName
    ? ROOM_COLOR_PALETTE[
        Math.abs(
          [...roomName].reduce((h, c) => c.charCodeAt(0) + ((h << 5) - h), 0)
        ) % ROOM_COLOR_PALETTE.length
      ]
    : "#1a73e8";

  return {
    backgroundColor: `${baseColor}1f`,     // nền rất nhạt
    color: darkenColor(baseColor, 0.8),    // chữ cùng tông
  };
};

  // Options for dropdowns
  const allSubjects = useMemo(() => [...new Set(sessions.map((s) => s.subjectName))].sort(), [sessions]);
  const allRooms = useMemo(() => [...new Set(sessions.map((s) => s.roomName).filter(Boolean))].sort(), [sessions]);

  return (
    <div className="daily-sessions-container">
      {/* Controls: Date picker + view */}
      <div className="controls-row">
        <div className="date-picker">
          <label>Chọn ngày:</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>

        <div className="date-nav">
        <button onClick={() => changeDate(-1)}>
          <FiChevronLeft size={20} />
        </button>
        <button className={date === today ? "active" : ""} onClick={() => setDate(today)}>
          Hôm nay
        </button>
        <button onClick={() => changeDate(1)}>
          <FiChevronRight size={20} />
        </button>
      </div>


        <div className="view-toggle">
          <button className={viewMode === "table" ? "active" : ""} onClick={() => setViewMode("table")}>
            Bảng
          </button>
          <button className={viewMode === "grid" ? "active" : ""} onClick={() => setViewMode("grid")}>
            Lịch
          </button>
        </div>
      </div>

      {/* Date navigation */}
      
      {/* Filters */}
      <div className="filter-row">
        <label>Môn học:</label>
        <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
          <option value="">Tất cả</option>
          {allSubjects.map((sub) => (
            <option key={sub} value={sub}>
              {sub}
            </option>
          ))}
        </select>

        <label>Phòng học:</label>
        <select value={roomFilter} onChange={(e) => setRoomFilter(e.target.value)}>
          <option value="">Tất cả</option>
          {allRooms.map((room) => (
            <option key={room} value={room}>
              {room}
            </option>
          ))}
        </select>

        <label>Giáo viên:</label>
        <input
          type="text"
          placeholder="Nhập tên giáo viên"
          value={teacherFilter}
          onChange={(e) => setTeacherFilter(e.target.value)}
        />
      </div>

      {/* Loading / Empty */}
      {loading && <p className="loading">Đang tải...</p>}
      {!loading && filteredSessions.length === 0 && <p className="empty">Không có lịch học nào</p>}

      {/* Table view */}
      {!loading && viewMode === "table" &&
        PERIODS.map(
          (p) =>
            grouped[p.key].length > 0 && (
              <div key={p.key}>
                <h3 className={`period-title ${p.key}`}>{p.title}</h3>
                <SessionTable sessions={grouped[p.key]} />
              </div>
            )
        )}

      {/* Grid view */}
      {!loading && viewMode === "grid" && (
        <div className="schedule-grid">
          {PERIODS.map((p) => (
            <div key={p.key} className={`schedule-column ${p.key}`}>
              <div className="schedule-header">{p.title}</div>

              {grouped[p.key].length === 0 && <div className="empty-slot">Không có buổi học</div>}

              {grouped[p.key].map((s) => (
                <div key={s.sessionId} className="schedule-card" style={getRoomStyle(s.roomName)}>
                  <div className="line-1">
                    {s.subjectName} – {s.teacherNames?.join(", ") || "—"}
                  </div>
                  <div className="line-2">
                    {s.startTime} – {s.endTime} | {s.roomName || "—"}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DailySessions;
