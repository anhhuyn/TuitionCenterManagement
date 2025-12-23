import React, { useState, useEffect, useMemo, useRef } from "react";
import { getTeacherScheduleApi, getTeacherBasicListApi, getUserApi } from "../util/api";
import {
  CFormLabel,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell
} from "@coreui/react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import viLocale from "@fullcalendar/core/locales/vi";
import Select from "react-select";

import "../styles/TeacherSchedulePage.css";

/* ------------------------- UTILITY ------------------------- */
const formatDate = (str) => new Date(str).toLocaleDateString("vi-VN");
const formatTime = (t) => (t ? t.slice(0, 5) : "");

const STATUS_LABELS = {
  scheduled: "Đã lên lịch",
  completed: "Đã hoàn thành",
  canceled: "Đã hủy",
};

/* ------------------------- HOOKS ------------------------- */
const useTeacherList = () => {
  const [teachers, setTeachers] = useState([]);
  useEffect(() => {
    getTeacherBasicListApi()
      .then((res) => setTeachers(res.data || []))
      .catch(() => setTeachers([]));
  }, []);
  return teachers;
};

const useTeacherSchedule = (teacherId, startDate, endDate) => {
  const [data, setData] = useState({ schedule: [], loading: false, error: "" });

  useEffect(() => {
    if (!teacherId || !startDate || !endDate) {
      setData({ schedule: [], loading: false, error: "" });
      return;
    }
    setData((d) => ({ ...d, loading: true }));

    getTeacherScheduleApi(teacherId, startDate, endDate)
      .then((res) => {
        if (res.success === false)
          setData({ schedule: [], loading: false, error: res.error });
        else setData({ schedule: res || [], loading: false, error: "" });
      })
      .catch(() => setData({ schedule: [], loading: false, error: "Lỗi khi lấy dữ liệu" }));
  }, [teacherId, startDate, endDate]);

  return data;
};

/* ------------------------- MAIN COMPONENT ------------------------- */
const TeacherSchedulePage = () => {
  const teachers = useTeacherList();
  const calendarRef = useRef(null);

  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState({ teacherId: "", start: "", end: "" });
  const [viewMode, setViewMode] = useState("list");
  const [calendarRange, setCalendarRange] = useState({ start: "", end: "" });

  /* --- Lấy thông tin user --- */
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getUserApi();
        setUser(res);
      } catch {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  /* --- Nếu role = R1 → tự set teacherId --- */
  useEffect(() => {
    if (!user || user.roleId !== "R1" || teachers.length === 0) return;
    const teacher = teachers.find((t) => t.fullName === user.fullName);
    if (teacher) setFilter((f) => ({ ...f, teacherId: teacher.id }));
  }, [user, teachers]);

  const dateStart = viewMode === "list" ? filter.start : calendarRange.start;
  const dateEnd = viewMode === "list" ? filter.end : calendarRange.end;
  const { schedule, loading, error } = useTeacherSchedule(filter.teacherId, dateStart, dateEnd);

  const teacherOptions = useMemo(
    () =>
      teachers.map((t) => ({ value: t.id, label: `${t.fullName} — ${t.specialty.toUpperCase()}` })),
    [teachers]
  );

  const calendarEvents = useMemo(
    () =>
      schedule.map((s) => ({
        id: s.sessionId,
        title: `${formatTime(s.startTime)} - ${formatTime(s.endTime)}\n${s.subjectName}\nPhòng: ${s.roomName || "Chưa xếp"}`,
        start: `${s.sessionDate}T${s.startTime}`,
        end: `${s.sessionDate}T${s.endTime}`,
        className: `fc-event-${s.status.toLowerCase()}`,
        textColor: "#fff",
      })),
    [schedule]
  );

  /* --- Mặc định tuần hiện tại --- */
  const getStartOfWeek = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(now.setDate(diff)).toISOString().split("T")[0];
  };
  const getEndOfWeek = () => {
    const monday = new Date(getStartOfWeek());
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return sunday.toISOString().split("T")[0];
  };
  useEffect(() => {
    const start = getStartOfWeek();
    const end = getEndOfWeek();
    setFilter((f) => ({ ...f, start, end }));
  }, []);

  /* --- ResizeObserver trên CoreUI main content --- */
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      if (calendarRef.current) calendarRef.current.getApi().updateSize();
    });

    const mainEl = document.querySelector(".c-main"); // CoreUI main
    if (mainEl) observer.observe(mainEl);

    return () => {
      if (mainEl) observer.unobserve(mainEl);
    };
  }, []);

  /* --- Window resize --- */
  useEffect(() => {
    const handleResize = () => {
      if (calendarRef.current) calendarRef.current.getApi().updateSize();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="teacher-schedule-container">
      {/* TOP FILTER */}
      <div className="filter-row-top">
        <div className="left-group">
          {user?.roleId !== "R1" && (
            <div className="form-group">
              <CFormLabel>Chọn giáo viên</CFormLabel>
              <Select
                className="teacher-select"
                options={teacherOptions}
                value={teacherOptions.find((o) => o.value === filter.teacherId) || null}
                isClearable
                placeholder="-- Chọn giáo viên --"
                onChange={(v) => setFilter((f) => ({ ...f, teacherId: v ? v.value : "" }))}
              />
            </div>
          )}
        </div>

        <div className="view-mode-switch">
          {["list", "calendar"].map((mode) => (
            <div
              key={mode}
              className={`switch-item ${viewMode === mode ? "active" : ""}`}
              onClick={() => setViewMode(mode)}
            >
              {mode === "list" ? "Xem dạng Danh sách" : "Xem dạng Lịch"}
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM FILTER */}
      {viewMode === "list" && (
        <div className="filter-row-bottom">
          <div className="form-group">
            <CFormLabel>Từ ngày:</CFormLabel>
            <input
              type="date"
              className="teacher-input"
              value={filter.start}
              onChange={(e) => setFilter((f) => ({ ...f, start: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <CFormLabel>Đến ngày:</CFormLabel>
            <input
              type="date"
              className="teacher-input"
              value={filter.end}
              onChange={(e) => setFilter((f) => ({ ...f, end: e.target.value }))}
            />
          </div>
        </div>
      )}

      {error && <p className="teacher-schedule-error">{error}</p>}
      {loading && <p>Đang tải dữ liệu...</p>}

      {/* LIST VIEW */}
      {viewMode === "list" && (
        <CTable bordered hover responsive className="teacher-schedule-table">
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>Ngày học</CTableHeaderCell>
              <CTableHeaderCell>Môn học</CTableHeaderCell>
              <CTableHeaderCell>Phòng học</CTableHeaderCell>
              <CTableHeaderCell>Giờ bắt đầu</CTableHeaderCell>
              <CTableHeaderCell>Giờ kết thúc</CTableHeaderCell>
              <CTableHeaderCell>Trạng thái</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {schedule.length > 0 ? (
              schedule.map((s) => (
                <CTableRow key={s.sessionId}>
                  <CTableDataCell>{formatDate(s.sessionDate)}</CTableDataCell>
                  <CTableDataCell>{s.subjectName}</CTableDataCell>
                  <CTableDataCell>{s.roomName || "Chưa xếp"}</CTableDataCell>
                  <CTableDataCell>{formatTime(s.startTime)}</CTableDataCell>
                  <CTableDataCell>{formatTime(s.endTime)}</CTableDataCell>
                  <CTableDataCell className={`teacher-status-${s.status.toLowerCase()}`}>
                    {STATUS_LABELS[s.status] || s.status}
                  </CTableDataCell>
                </CTableRow>
              ))
            ) : (
              <CTableRow>
                <CTableDataCell colSpan={6} style={{ textAlign: "center", color: "#888" }}>
                  Chưa có dữ liệu
                </CTableDataCell>
              </CTableRow>
            )}
          </CTableBody>
        </CTable>
      )}

      {/* CALENDAR VIEW */}
      {viewMode === "calendar" && (
        <div className="teacher-calendar-wrapper" style={{ marginTop: 20 }}>
          <FullCalendar
            ref={calendarRef}
            locale="vi"
            locales={[viLocale]}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={calendarEvents}
            height="auto"
            displayEventTime={false}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            slotMinTime="07:00:00"  // <-- bắt đầu từ 7 giờ sáng
            slotMaxTime="23:00:00"
            datesSet={(arg) => {
              const start = arg.startStr.slice(0, 10);
              const end = arg.endStr.slice(0, 10);
              setCalendarRange((prev) => (prev.start === start && prev.end === end ? prev : { start, end }));
            }}
          />

          <div className="status-legend">
            <div><span className="legend-box scheduled"></span> Đã lên lịch</div>
            <div><span className="legend-box completed"></span> Đã hoàn thành</div>
            <div><span className="legend-box canceled"></span> Đã hủy</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherSchedulePage;
