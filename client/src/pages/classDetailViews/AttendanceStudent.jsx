import React, { useEffect, useState, useRef, useCallback } from "react";
import ReactDOM from "react-dom";
import {
  getAttendanceBySubjectIdApi,
  updateAttendanceStatusApi,
  updateAttendanceNoteApi,
} from "../../util/api";
import "../../styles/classDetailViews/AttendanceTable.css";
import { FaEdit } from "react-icons/fa";

const STATUS_OPTIONS = [
  { value: "", label: "Chưa điểm danh" },
  { value: "present", label: "Có mặt" },
  { value: "absent", label: "Vắng" },
  { value: "late", label: "Đi trễ" },
];

export default function AttendanceStudent({ classData }) {
  const [data, setData] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [noteValue, setNoteValue] = useState("");
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });
  const popupRef = useRef(null);
  const anchorRef = useRef(null);
  const [savingStatus, setSavingStatus] = useState(null); // {type, studentId, sessionId, state}
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getAttendanceBySubjectIdApi(classData.id);
        if (res && res.data) setData(res.data);
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu điểm danh:", err);
      }
    };
    if (classData?.id) fetchData();
  }, [classData]);

  const computePos = useCallback((anchorEl) => {
    if (!anchorEl) return;
    const rect = anchorEl.getBoundingClientRect();
    const top = rect.bottom + window.scrollY + 6;
    const left = rect.left + window.scrollX + rect.width / 2;
    setPopupPos({ top, left });
  }, []);

  const handleEditClick = (studentId, sessionId, currentNote, e) => {
    const btn = e.currentTarget;
    if (
      editingNote?.studentId === studentId &&
      editingNote?.sessionId === sessionId
    ) {
      setEditingNote(null);
      anchorRef.current = null;
      return;
    }

    anchorRef.current = btn;
    computePos(btn);
    setEditingNote({ studentId, sessionId });
    setNoteValue(currentNote || "");
  };

  useEffect(() => {
    if (!editingNote) return;
    const handler = () => computePos(anchorRef.current);
    window.addEventListener("scroll", handler, true);
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("scroll", handler, true);
      window.removeEventListener("resize", handler);
    };
  }, [editingNote, computePos]);

  useEffect(() => {
    const onDocClick = (e) => {
      const el = e.target;
      if (!editingNote) return;
      if (anchorRef.current && anchorRef.current.contains(el)) return;
      if (popupRef.current && popupRef.current.contains(el)) return;
      setEditingNote(null);
      anchorRef.current = null;
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [editingNote]);

  const handleSaveNote = async () => {
    if (!editingNote) return;
    const { studentId, sessionId } = editingNote;

    setSavingStatus({
      type: "note",
      studentId,
      sessionId,
      state: "loading",
    });

    try {
      await updateAttendanceNoteApi(sessionId, studentId, noteValue);

      setData((prev) => {
        const updated = { ...prev };
        const studentData = updated.students.find(
          (s) => s.studentId === studentId
        );
        const att = studentData.attendances.find(
          (a) => a.sessionId === sessionId
        );
        if (att) att.note = noteValue;
        else
          studentData.attendances.push({
            sessionId,
            status: "",
            note: noteValue,
          });
        return updated;
      });

      setSavingStatus({
        type: "note",
        studentId,
        sessionId,
        state: "success",
      });

      setTimeout(() => setSavingStatus(null), 1200);
      setEditingNote(null);
      anchorRef.current = null;
    } catch (err) {
      console.error("Lỗi lưu ghi chú:", err);
      setSavingStatus(null);
    }
  };

  const handleMarkAll = async (sessionId) => {
    if (!data || !data.students) return;

    if (!window.confirm("Xác nhận điểm danh tất cả học viên là 'Có mặt'?")) return;

    setSavingStatus({ type: "mark-all", sessionId, state: "loading" });

    try {
      // Gọi API song song cho tất cả học viên
      await Promise.all(
        data.students.map((student) =>
          updateAttendanceStatusApi(sessionId, student.studentId, "present")
        )
      );

      // Cập nhật lại local UI
      setData((prev) => {
        const updated = { ...prev };
        updated.students = prev.students.map((student) => {
          const attendances = [...student.attendances];
          const att = attendances.find((a) => a.sessionId === sessionId);
          if (att) att.status = "present";
          else attendances.push({ sessionId, status: "present", note: "" });
          return { ...student, attendances };
        });
        return updated;
      });

      // Hiệu ứng thông báo
      setSavingStatus({ type: "mark-all", sessionId, state: "success" });
      setTimeout(() => setSavingStatus(null), 1200);
    } catch (err) {
      console.error("Lỗi điểm danh tất cả:", err);
      alert("Không thể điểm danh tất cả học viên!");
      setSavingStatus(null);
    }
  };

  const filterSessionsByMonth = (sessions, month, year) => {
    return sessions.filter((session) => {
      const sessionDate = new Date(session.date);
      return (
        sessionDate.getMonth() + 1 === month &&
        sessionDate.getFullYear() === year
      );
    });
  };

  if (!data) return <p>Đang tải dữ liệu điểm danh...</p>;

  const filteredSessions = filterSessionsByMonth(
    data.sessions,
    selectedMonth,
    selectedYear
  );
  const today = new Date();

  return (
    <div>
      <div className="month-selector">
        <input
          type="month"
          value={`${selectedYear}-${selectedMonth
            .toString()
            .padStart(2, "0")}`}
          onChange={(e) => {
            const [year, month] = e.target.value.split("-");
            setSelectedYear(Number(year));
            setSelectedMonth(Number(month));
          }}
        />
      </div>

      {filteredSessions.length === 0 ? (
        <p className="no-sessions-message">
          Chưa có thông tin buổi học của tháng này.
        </p>
      ) : (
        <div className="attendance-table-container">
          <table className="attendance-table">
            <thead>
              <tr>
                <th className="student-name-header">Học viên</th>
                {filteredSessions.map((session, idx) => {
                  const isPastOrToday = new Date(session.date) <= today;
                  return (
                    <th key={session.sessionId}>
                      <div
                        className={`session-header ${isPastOrToday ? "active-session" : "future-session"
                          }`}
                      >
                        <div className="session-info">
                          <strong>Buổi {idx + 1}</strong> (
                          {session.startTime.slice(0, 5)} -{" "}
                          {session.endTime.slice(0, 5)})
                        </div>
                        <div className="session-date">
                          ({new Date(session.date).toLocaleDateString("vi-VN")})
                        </div>
                        <button
                          className="btn-mark-all"
                          onClick={() => handleMarkAll(session.sessionId)}
                          disabled={
                            savingStatus?.type === "mark-all" &&
                            savingStatus.sessionId === session.sessionId &&
                            savingStatus.state === "loading"
                          }
                        >
                          {savingStatus?.type === "mark-all" &&
                            savingStatus.sessionId === session.sessionId
                            ? savingStatus.state === "loading"
                              ? "Đang điểm danh..."
                              : "Đã điểm danh"
                            : "Điểm danh tất cả"}
                        </button>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {data.students.map((student) => (
                <tr key={student.studentId}>
                  <td className="student-name sticky-col">{student.fullName}</td>
                  {filteredSessions.map((session) => {
                    const attendance = student.attendances.find(
                      (a) => a.sessionId === session.sessionId
                    );
                    const status = attendance?.status || "";
                    const note = attendance?.note || "";
                    const isPastOrToday = new Date(session.date) <= today;

                    const isSavingStatus =
                      savingStatus?.type === "status" &&
                      savingStatus.studentId === student.studentId &&
                      savingStatus.sessionId === session.sessionId;

                    return (
                      <td
                        key={session.sessionId}
                        className={`attendance-cell ${isPastOrToday ? "session-colored" : ""
                          }`}
                      >
                        <div className="attendance-cell-content">
                          <select
                            className="status-select"
                            value={status}
                            onChange={async (e) => {
                              const newStatus = e.target.value;
                              setSavingStatus({
                                type: "status",
                                studentId: student.studentId,
                                sessionId: session.sessionId,
                                state: "loading",
                              });
                              try {
                                await updateAttendanceStatusApi(
                                  session.sessionId,
                                  student.studentId,
                                  newStatus
                                );

                                setData((prev) => {
                                  const updated = { ...prev };
                                  const studentData = updated.students.find(
                                    (s) => s.studentId === student.studentId
                                  );
                                  const att = studentData.attendances.find(
                                    (a) => a.sessionId === session.sessionId
                                  );
                                  if (att) att.status = newStatus;
                                  else
                                    studentData.attendances.push({
                                      sessionId: session.sessionId,
                                      status: newStatus,
                                      note: "",
                                    });
                                  return updated;
                                });

                                setSavingStatus({
                                  type: "status",
                                  studentId: student.studentId,
                                  sessionId: session.sessionId,
                                  state: "success",
                                });
                                setTimeout(
                                  () => setSavingStatus(null),
                                  1200
                                );
                              } catch (err) {
                                console.error("Lỗi cập nhật trạng thái:", err);
                                setSavingStatus(null);
                              }
                            }}
                          >
                            {STATUS_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>

                          {isSavingStatus && (
                            <div className="saving-status">
                              {savingStatus.state === "loading"
                                ? "..."
                                : "  "}
                            </div>
                          )}

                          <button
                            type="button"
                            className={`edit-btn ${note ? "has-note" : ""}`}
                            onClick={(e) =>
                              handleEditClick(
                                student.studentId,
                                session.sessionId,
                                note,
                                e
                              )
                            }
                          >
                            <FaEdit />
                          </button>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editingNote &&
        ReactDOM.createPortal(
          <div
            ref={popupRef}
            className="note-popup-portal"
            style={{
              top: `${popupPos.top}px`,
              left: `${popupPos.left}px`,
            }}
          >
            <textarea
              value={noteValue}
              placeholder="Thêm ghi chú"
              onChange={(e) => setNoteValue(e.target.value)}
            />
            <button className="btn-save-note" onClick={handleSaveNote}>
              Lưu
            </button>

            {savingStatus?.type === "note" &&
              savingStatus.studentId === editingNote.studentId &&
              savingStatus.sessionId === editingNote.sessionId && (
                <div className="saving-status-popup">
                  {savingStatus.state === "loading"
                    ? "Đang lưu..."
                    : "Đã lưu"}
                </div>
              )}
          </div>,
          document.body
        )}
    </div>
  );
}
