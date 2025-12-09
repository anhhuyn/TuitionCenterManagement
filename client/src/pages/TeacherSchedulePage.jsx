import React, { useState, useEffect, useMemo } from "react";
import { getTeacherScheduleApi, getTeacherBasicListApi } from "../util/api";
import {
  CForm,
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


/* -------------------------
    Utility functions
------------------------- */
const formatDate = (str) => new Date(str).toLocaleDateString("vi-VN");
const formatTime = (t) => (t ? t.slice(0, 5) : "");

const STATUS_LABELS = {
  scheduled: "Đã lên lịch",
  completed: "Đã hoàn thành",
  canceled: "Đã hủy"
};


/* -------------------------
      Custom Hooks
------------------------- */

// Lấy danh sách giáo viên
const useTeacherList = () => {
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    getTeacherBasicListApi()
      .then((res) => setTeachers(res.data || []))
      .catch(() => setTeachers([]));
  }, []);

  return teachers;
};

// Lấy lịch của giáo viên
const useTeacherSchedule = (teacherId, startDate, endDate) => {
  const [data, setData] = useState({ schedule: [], loading: false, error: "" });

  useEffect(() => {
    if (!teacherId || !startDate || !endDate) {
      setData({ schedule: [], loading: false, error: "" });
      return;
    }

    setData((d) => ({ ...d, loading: true, error: "" }));

    getTeacherScheduleApi(teacherId, startDate, endDate)
      .then((res) => {
        if (res.success === false)
          setData({ schedule: [], loading: false, error: res.error });
        else setData({ schedule: res || [], loading: false, error: "" });
      })
      .catch(() =>
        setData({ schedule: [], loading: false, error: "Lỗi khi lấy dữ liệu" })
      );
  }, [teacherId, startDate, endDate]);

  return data;
};


/* -------------------------
        MAIN PAGE
------------------------- */
const TeacherSchedulePage = () => {
  const teachers = useTeacherList();

  const [filter, setFilter] = useState({
    teacherId: "",
    start: "",
    end: "",
  });

  const [viewMode, setViewMode] = useState("list");

  const { schedule, loading, error } = useTeacherSchedule(
    filter.teacherId,
    filter.start,
    filter.end
  );

  /* Mapping options */
  const teacherOptions = useMemo(
    () =>
      teachers.map((t) => ({
        value: t.id,
        label: `${t.fullName} — ${t.specialty.toUpperCase()}`,
      })),
    [teachers]
  );

  /* Mapping schedule → FullCalendar */
  const calendarEvents = useMemo(
    () =>
      schedule.map((s) => ({
        id: s.sessionId,
        title: `${formatTime(s.startTime)} - ${formatTime(
          s.endTime
        )}\n${s.subjectName}\nPhòng: ${s.roomName || "Chưa xếp"}`,
        start: `${s.sessionDate}T${s.startTime}`,
        end: `${s.sessionDate}T${s.endTime}`,
        className: `fc-event-${s.status.toLowerCase()}`,
        textColor: "#fff",
      })),
    [schedule]
  );

  return (
    <div className="teacher-schedule-container">

      {/* FILTER FORM */}
      <CForm className="teacher-schedule-form">
        <div className="form-group">
          <CFormLabel>Chọn giáo viên</CFormLabel>

          <Select
            className="teacher-select"
            options={teacherOptions}
            value={teacherOptions.find((o) => o.value === filter.teacherId) || null}
            isClearable
            placeholder="-- Chọn giáo viên --"
            onChange={(v) =>
              setFilter((f) => ({ ...f, teacherId: v ? v.value : "" }))
            }
          />
        </div>

        <div className="form-group">
          <CFormLabel>Từ ngày:</CFormLabel>
          <input
            type="date"
            className="teacher-input"
            value={filter.start}
            onChange={(e) =>
              setFilter((f) => ({ ...f, start: e.target.value }))
            }
          />
        </div>

        <div className="form-group">
          <CFormLabel>Đến ngày:</CFormLabel>
          <input
            type="date"
            className="teacher-input"
            value={filter.end}
            onChange={(e) =>
              setFilter((f) => ({ ...f, end: e.target.value }))
            }
          />
        </div>
      </CForm>


      {/* SWITCH VIEW */}
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
