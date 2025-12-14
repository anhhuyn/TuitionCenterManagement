import React, { useEffect, useState, useRef, useCallback } from "react";
import ReactDOM from "react-dom";
import {
    getTeacherAttendanceBySubjectApi,
    updateTeacherAttendanceStatusApi,
    updateTeacherAttendanceNoteApi,
    getUserApi,
} from "../../util/api";
import "../../styles/classDetailViews/AttendanceTable.css";
import { FaEdit } from "react-icons/fa";

const STATUS_OPTIONS = [
    { value: "", label: "Chưa điểm danh" },
    { value: "present", label: "Có mặt" },
    { value: "absent", label: "Vắng" },
    { value: "late", label: "Đi trễ" },
];

export default function AttendanceTeacher({ subjectData }) {
    const [roleId, setRoleId] = useState(null); // nếu muốn phân quyền
    const [data, setData] = useState(null);
    const [editingNote, setEditingNote] = useState(null);
    const [noteValue, setNoteValue] = useState("");
    const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });
    const popupRef = useRef(null);
    const anchorRef = useRef(null);
    const [savingStatus, setSavingStatus] = useState(null); // {type, teacherId, sessionId, state}
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await getUserApi(); // dùng API lấy user
                if (res?.roleId) setRoleId(res.roleId);
            } catch (err) {
                console.error("Lỗi khi lấy thông tin user:", err);
            }
        };
        fetchUser();
    }, []);

    useEffect(() => {
        console.log("subjectData on mount:", subjectData);
        const fetchData = async () => {
            console.log("Fetching teacher attendance...", subjectData);
            try {
                const res = await getTeacherAttendanceBySubjectApi(subjectData.id);
                console.log("API response:", res);
                if (res?.data) setData(res.data);
            } catch (err) {
                console.error("Lỗi khi lấy dữ liệu điểm danh giáo viên:", err);
            }
        };
        if (subjectData?.id) fetchData();
    }, [subjectData]);

    const computePos = useCallback((anchorEl) => {
        if (!anchorEl) return;
        const rect = anchorEl.getBoundingClientRect();
        const top = rect.bottom + window.scrollY + 6;
        const left = rect.left + window.scrollX + rect.width / 2;
        setPopupPos({ top, left });
    }, []);

    const handleEditClick = (teacherId, sessionId, currentNote, e) => {
        const btn = e.currentTarget;
        if (
            editingNote?.teacherId === teacherId &&
            editingNote?.sessionId === sessionId
        ) {
            setEditingNote(null);
            anchorRef.current = null;
            return;
        }
        anchorRef.current = btn;
        computePos(btn);
        setEditingNote({ teacherId, sessionId });
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
        const { teacherId, sessionId } = editingNote;

        setSavingStatus({ type: "note", teacherId, sessionId, state: "loading" });

        try {
            await updateTeacherAttendanceNoteApi(sessionId, teacherId, noteValue);

            setData((prev) => {
                const updated = { ...prev };
                const teacherData = updated.teachers.find(
                    (t) => t.teacherId === teacherId
                );
                const att = teacherData.attendances.find(
                    (a) => a.sessionId === sessionId
                );
                if (att) att.note = noteValue;
                else
                    teacherData.attendances.push({
                        sessionId,
                        status: "",
                        note: noteValue,
                    });
                return updated;
            });

            setSavingStatus({ type: "note", teacherId, sessionId, state: "success" });
            setTimeout(() => setSavingStatus(null), 1200);
            setEditingNote(null);
            anchorRef.current = null;
        } catch (err) {
            console.error("Lỗi lưu ghi chú giáo viên:", err);
            setSavingStatus(null);
        }
    };

    const handleMarkAll = async (sessionId) => {
        if (!data || !data.teachers) return;
        if (!window.confirm("Xác nhận điểm danh tất cả giáo viên là 'Có mặt'?")) return;

        setSavingStatus({ type: "mark-all", sessionId, state: "loading" });

        try {
            await Promise.all(
                data.teachers.map((teacher) =>
                    updateTeacherAttendanceStatusApi(sessionId, teacher.teacherId, "present")
                )
            );

            setData((prev) => {
                const updated = { ...prev };
                updated.teachers = prev.teachers.map((teacher) => {
                    const attendances = [...teacher.attendances];
                    const att = attendances.find((a) => a.sessionId === sessionId);
                    if (att) att.status = "present";
                    else attendances.push({ sessionId, status: "present", note: "" });
                    return { ...teacher, attendances };
                });
                return updated;
            });

            setSavingStatus({ type: "mark-all", sessionId, state: "success" });
            setTimeout(() => setSavingStatus(null), 1200);
        } catch (err) {
            console.error("Lỗi điểm danh tất cả giáo viên:", err);
            alert("Không thể điểm danh tất cả giáo viên!");
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

    if (!data) return <p>Đang tải dữ liệu điểm danh giáo viên...</p>;

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
                    value={`${selectedYear}-${selectedMonth.toString().padStart(2, "0")}`}
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
                                <th className="student-name-header">Giáo viên</th>
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
                                            </div>
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>

                        <tbody>
                            {data.teachers.map((teacher) => (
                                <tr key={teacher.teacherId}>
                                    <td className="student-name sticky-col">{teacher.fullName}</td>
                                    {filteredSessions.map((session) => {
                                        const attendance = teacher.attendances.find(
                                            (a) => a.sessionId === session.sessionId
                                        );
                                        const status = attendance?.status || "";
                                        const note = attendance?.note || "";
                                        const isPastOrToday = new Date(session.date) <= today;
                                        const isSavingStatus =
                                            savingStatus?.type === "status" &&
                                            savingStatus.teacherId === teacher.teacherId &&
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
                                                                teacherId: teacher.teacherId,
                                                                sessionId: session.sessionId,
                                                                state: "loading",
                                                            });

                                                            try {
                                                                await updateTeacherAttendanceStatusApi(
                                                                    session.sessionId,
                                                                    teacher.teacherId,
                                                                    newStatus
                                                                );

                                                                setData((prev) => {
                                                                    const updated = { ...prev };
                                                                    const teacherData = updated.teachers.find(
                                                                        (t) => t.teacherId === teacher.teacherId
                                                                    );
                                                                    const att = teacherData.attendances.find(
                                                                        (a) => a.sessionId === session.sessionId
                                                                    );
                                                                    if (att) att.status = newStatus;
                                                                    else
                                                                        teacherData.attendances.push({
                                                                            sessionId: session.sessionId,
                                                                            status: newStatus,
                                                                            note: "",
                                                                        });
                                                                    return updated;
                                                                });

                                                                setSavingStatus({
                                                                    type: "status",
                                                                    teacherId: teacher.teacherId,
                                                                    sessionId: session.sessionId,
                                                                    state: "success",
                                                                });
                                                                setTimeout(() => setSavingStatus(null), 1200);
                                                            } catch (err) {
                                                                console.error("Lỗi cập nhật trạng thái:", err);
                                                                setSavingStatus(null);
                                                            }
                                                        }}
                                                        disabled={roleId === "R0"}
                                                    >
                                                        {STATUS_OPTIONS.map((opt) => (
                                                            <option key={opt.value} value={opt.value}>
                                                                {opt.label}
                                                            </option>
                                                        ))}
                                                    </select>

                                                    {isSavingStatus && (
                                                        <div className="saving-status">
                                                            {savingStatus.state === "loading" ? "..." : "  "}
                                                        </div>
                                                    )}

                                                    <button
                                                        type="button"
                                                        className={`edit-btn ${note ? "has-note" : ""}`}
                                                        onClick={(e) =>
                                                            handleEditClick(
                                                                teacher.teacherId,
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
                            placeholder={roleId === "R0" ? "Không có ghi chú" : "Thêm ghi chú"}
                            onChange={(e) => setNoteValue(e.target.value)}
                            readOnly={roleId === "R0"}
                        />
                        {roleId !== "R0" && (
                            <button className="btn-save-note" onClick={handleSaveNote}>
                                Lưu
                            </button>
                        )}

                        {savingStatus?.type === "note" &&
                            savingStatus.teacherId === editingNote.teacherId &&
                            savingStatus.sessionId === editingNote.sessionId && (
                                <div className="saving-status-popup">
                                    {savingStatus.state === "loading" ? "Đang lưu..." : "Đã lưu"}
                                </div>
                            )}
                    </div>,
                    document.body
                )}
        </div>
    );
}
