import React, { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import viLocale from "@fullcalendar/core/locales/vi";
import { FaEdit, FaPlus, FaCalendarAlt, FaTrash } from "react-icons/fa";
import "../../styles/classDetailViews/Calendar.css";
import CreateScheduleModal from "./CreateScheduleModal.jsx";
import CreateSessionModal from "./CreateSessionModal.jsx";
import { fetchSessionById, getScheduleBySubjectId, deleteSessionApi, getUserApi } from "../../util/api";
import ConfirmModal from "../../components/modal/ConfirmModal";
import Swal from "sweetalert2";

export default function CustomCalendar({ subjectId }) {
    const [user, setUser] = useState(null);
    const [roleId, setRoleId] = useState(null);
    const [events, setEvents] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const calendarRef = useRef(null);
    const calendarContainerRef = useRef(null);
    const [showSessionModal, setShowSessionModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [confirmDeleteSessionId, setConfirmDeleteSessionId] = useState(null);
    const [editSessionId, setEditSessionId] = useState(null);
    const [editSessionData, setEditSessionData] = useState(null);

    // NEW: lưu các session được chọn (dùng string id)
    const [selectedSessions, setSelectedSessions] = useState([]);

    // Fetch sự kiện
    const fetchSchedule = async () => {
        try {
            const data = await getScheduleBySubjectId(subjectId);
            if (data?.sessions) {
                const mapped = data.sessions.map(s => {
                    const roomName = s.Room?.name || "chưa xếp";
                    let statusClass = "event-scheduled";
                    if (s.status === "completed") statusClass = "event-completed";
                    if (s.status === "canceled") statusClass = "event-canceled";

                    return {
                        // ensure id is string
                        id: String(s.id),
                        title: `${s.startTime.substring(0, 5)} - ${s.endTime.substring(0, 5)} (${roomName})`,
                        start: `${s.sessionDate}T${s.startTime}`,
                        end: `${s.sessionDate}T${s.endTime}`,
                        classNames: [statusClass],
                    };
                });
                setEvents(mapped);
                setSelectedSessions([]); // clear chọn sau khi load lại
            }
        } catch (err) {
            console.error("Lỗi khi tải lịch học:", err);
        }
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await getUserApi();
                if (res) {
                    console.log("User info:", res);
                    setUser(res);
                    setRoleId(res.roleId);
                }
            } catch (err) {
                console.error("Lỗi khi lấy thông tin user:", err);
            }
        };
        fetchUser();
    }, []);

    useEffect(() => {
        fetchSchedule();
    }, [subjectId]);

    // ResizeObserver
    useEffect(() => {
        const observer = new ResizeObserver(() => {
            if (calendarRef.current) {
                calendarRef.current.getApi().updateSize();
            }
        });

        if (calendarContainerRef.current) {
            observer.observe(calendarContainerRef.current);
        }

        return () => {
            if (calendarContainerRef.current) {
                observer.unobserve(calendarContainerRef.current);
            }
        };
    }, []);

    const handleEditSession = async (sessionId) => {
        try {
            const sessionDetail = await fetchSessionById(sessionId);
            if (!sessionDetail) return;

            const now = new Date();
            const sessionDateTime = new Date(`${sessionDetail.sessionDate}T${sessionDetail.startTime}`);
            if (sessionDateTime < now) {
                alert("Buổi học này đã trôi qua. Bạn vẫn có thể chỉnh sửa thông tin, nhưng nên cẩn thận.");
            }

            setEditSessionData(sessionDetail);
            setEditSessionId(sessionId);
            setShowSessionModal(true);
            setIsEditMode(true);
        } catch (error) {
            alert("Lỗi khi tải thông tin buổi học");
        }
    };

    const handleDeleteSessionClick = (sessionId) => {
        setConfirmDeleteSessionId(sessionId); // mở modal xác nhận với id cần xóa (string)
    };

    // CONFIRM DELETE
    const confirmDeleteSession = async () => {
        if (!confirmDeleteSessionId) return;

        try {
            if (confirmDeleteSessionId === "multiple") {
                const idsToDelete = [...selectedSessions]; // array of string ids
                if (idsToDelete.length === 0) {
                    alert("Chưa có buổi nào được chọn để xoá.");
                    return;
                }

                // dùng allSettled để báo thành công/thất bại chi tiết
                const results = await Promise.allSettled(idsToDelete.map(id => deleteSessionApi(id)));
                const succeeded = results.filter(r => r.status === "fulfilled").length;
                const failed = results.length - succeeded;

                if (succeeded > 0) {
                    alert(`Đã xoá ${succeeded} buổi thành công${failed > 0 ? `, ${failed} thất bại` : ""}.`);
                }
                if (failed > 0) {
                    console.error("Một số xoá thất bại:", results.filter(r => r.status === "rejected"));
                }
                setSelectedSessions([]);
            } else {
                // single id (string)
                await deleteSessionApi(confirmDeleteSessionId);
                alert("Đã xoá buổi học thành công");
            }

            await fetchSchedule();
        } catch (err) {
            console.error("Lỗi khi xoá buổi học:", err);
            // try lấy message từ response nếu có
            const msg = err?.message || "Xoá buổi học thất bại";
            alert(msg);
        } finally {
            setConfirmDeleteSessionId(null);
        }
    };

    const cancelDeleteSession = () => {
        setConfirmDeleteSessionId(null);
        // giữ selectedSessions nếu muốn, không clear
    };

    return (
        <div>
            {/* Các nút chức năng */}
            {roleId !== "R1" && (
                <div className="calendar-header">
                    <button
                        className={`calendar-btn edit ${isEditMode ? "active" : ""}`}
                        onClick={() => {
                            setIsEditMode(prev => {
                                const newMode = !prev;
                                if (!newMode) {
                                    setSelectedSessions([]);
                                }
                                return newMode;
                            });
                        }}
                    >
                        <FaEdit className="btn-icon" />
                        {isEditMode ? "Huỷ chỉnh sửa" : "Chỉnh sửa"}
                    </button>
                    <button className="calendar-btn add" onClick={() => setShowSessionModal(true)}>
                        <FaPlus className="btn-icon" /> Thêm buổi
                    </button>
                    <button className="calendar-btn create" onClick={() => setShowModal(true)}>
                        <FaCalendarAlt className="btn-icon" /> Tạo lịch học
                    </button>
                    <button
                        className="calendar-btn delete"
                        disabled={selectedSessions.length === 0}
                        onClick={() => {
                            if (selectedSessions.length > 0) {
                                setConfirmDeleteSessionId("multiple");
                            }
                        }}
                    >
                        <FaTrash className="btn-icon" /> {selectedSessions.length > 0 ? `Xoá (${selectedSessions.length}) buổi` : "Xoá buổi"}
                    </button>
                </div>
            )}

            {/* Calendar */}
            <div className="calendar-container" ref={calendarContainerRef}>
                <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    headerToolbar={{
                        left: "prev today next",
                        center: "title",
                        right: "dayGridMonth,timeGridWeek",
                    }}
                    locale={viLocale}
                    events={events}
                    contentHeight="auto"
                    expandRows={true}
                    displayEventTime={false}
                    // NEW: click vào event để chọn/bỏ chọn (chỉ khi isEditMode)
                    eventClick={(info) => {
                        if (!isEditMode) return;
                        const id = String(info.event.id);
                        setSelectedSessions(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]);
                    }}
                    eventClassNames={(arg) => {
                        const id = String(arg.event.id);
                        const baseClasses = arg.event.classNames || [];
                        // Nếu id nằm trong danh sách selectedSessions thì thêm class "selected"
                        if (selectedSessions.includes(id)) {
                            return [...baseClasses, "selected"];
                        }
                        return baseClasses;
                    }}
                    eventContent={(arg) => {
                        const [timeRange, roomRaw] = arg.event.title.split(" (");
                        const roomName = roomRaw?.replace(")", "");

                        return (
                            <div
                                style={{
                                    lineHeight: "1.2",
                                    textAlign: "center",
                                    position: "relative",
                                    borderRadius: "4px",
                                }}
                            >
                                <div style={{ fontWeight: "600" }}>{timeRange}</div>
                                <div style={{ fontSize: "0.8em", color: "#888" }}>Phòng: {roomName}</div>

                                {isEditMode && (
                                    <div
                                        style={{
                                            marginTop: "4px",
                                            display: "flex",
                                            justifyContent: "center",
                                            gap: "6px",
                                        }}
                                    >
                                        <button
                                            style={{
                                                background: "#f6c23e",
                                                border: "none",
                                                borderRadius: "4px",
                                                padding: "2px 6px",
                                                cursor: "pointer",
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditSession(String(arg.event.id));
                                            }}
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            style={{
                                                background: "#e74a3b",
                                                border: "none",
                                                borderRadius: "4px",
                                                padding: "2px 6px",
                                                cursor: "pointer",
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteSessionClick(String(arg.event.id));
                                            }}
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    }}
                />

                <div className="calendar-legend">
                    <div className="legend-item">
                        <span className="legend-color scheduled"></span>
                        <span>Đã lên lịch</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-color completed"></span>
                        <span>Đã hoàn thành</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-color canceled"></span>
                        <span>Đã huỷ</span>
                    </div>
                </div>
            </div>

            {/* Hiện modal khi state true */}
            {showModal && (
                <CreateScheduleModal
                    subjectId={subjectId}
                    onClose={() => setShowModal(false)}
                    onSuccess={fetchSchedule}
                />
            )}
            {showSessionModal && (
                <CreateSessionModal
                    subjectId={subjectId}
                    onClose={() => {
                        setShowSessionModal(false);
                        setEditSessionData(null);
                        setIsEditMode(false);
                        setEditSessionId(null);
                    }}
                    onSuccess={() => {
                        fetchSchedule();
                        setShowSessionModal(false);
                        setEditSessionData(null);
                        setIsEditMode(false);
                        setEditSessionId(null);
                    }}
                    initialData={isEditMode ? editSessionData : null}
                    isEdit={isEditMode}
                />
            )}
            {confirmDeleteSessionId && (
                <ConfirmModal
                    title="Xác nhận xoá buổi học"
                    message={
                        confirmDeleteSessionId === "multiple"
                            ? `Bạn có chắc chắn muốn xoá ${selectedSessions.length} buổi học này không?`
                            : "Bạn có chắc chắn muốn xoá buổi học này?"
                    }
                    cancelText="Hủy"
                    confirmText="Xoá"
                    onCancel={cancelDeleteSession}
                    onConfirm={confirmDeleteSession}
                />
            )}
        </div>
    );
}
