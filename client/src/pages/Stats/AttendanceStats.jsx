// src/components/AttendanceStats.js
import React, { useEffect, useState } from "react";
import { getAbsentOrLateStudentsApi } from "../../util/api";
import "../../styles/AttendanceStats.css";

const AttendanceStats = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [subjectFilter, setSubjectFilter] = useState("all");
    const [subjects, setSubjects] = useState([]);

    const [filterType, setFilterType] = useState("day"); // day | week | month | custom
    const [selectedValue, setSelectedValue] = useState(() => {
        const today = new Date();
        return today.toISOString().split("T")[0];
    });

    const [customRange, setCustomRange] = useState({
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date().toISOString().split("T")[0],
    });

    const formatDateDM = (dateStr) => {
        const d = new Date(dateStr);
        const day = d.getDate().toString().padStart(2, "0");
        const month = (d.getMonth() + 1).toString().padStart(2, "0");
        return `${day}-${month}`;
    };

    const [statusFilter, setStatusFilter] = useState("all");

    // Tính startDate và endDate dựa trên filterType
    const getDateRange = () => {
        let start, end;
        if (filterType === "day") {
            start = end = new Date(selectedValue);
        } else if (filterType === "week") {
            const [year, week] = selectedValue.split("-W").map(Number);
            start = new Date(year, 0, 1 + (week - 1) * 7);
            const dayOfWeek = start.getDay();
            start.setDate(start.getDate() - dayOfWeek + 1); // tuần bắt đầu từ Thứ 2
            end = new Date(start);
            end.setDate(start.getDate() + 6);
        } else if (filterType === "month") {
            const [year, month] = selectedValue.split("-").map(Number);
            start = new Date(year, month - 1, 1);
            end = new Date(year, month, 0);
        } else if (filterType === "custom") {
            start = new Date(customRange.startDate);
            end = new Date(customRange.endDate);
        }
        const formatDate = (d) => d.toISOString().split("T")[0];
        return { startDate: formatDate(start), endDate: formatDate(end) };
    };

    const fetchStudents = async () => {
        const { startDate, endDate } = getDateRange();
        setLoading(true);
        try {
            const res = await getAbsentOrLateStudentsApi(startDate, endDate);
            const studentData = res.data || res;
            setStudents(studentData);

            const subjectList = [...new Set(studentData.map(s => s.subjectName))];
            setSubjects(subjectList);
        } catch (err) {
            console.error("Fetch absent/late students error:", err);
            setStudents([]);
            setSubjects([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchStudents();
    }, [filterType, selectedValue, customRange]);

    useEffect(() => {
        const today = new Date();
        if (filterType === "day") {
            setSelectedValue(today.toISOString().split("T")[0]);
        } else if (filterType === "week") {
            const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
            const pastDaysOfYear =
                (today - firstDayOfYear) / 86400000 + firstDayOfYear.getDay() + 1;
            const weekNumber = Math.ceil(pastDaysOfYear / 7);
            setSelectedValue(`${today.getFullYear()}-W${weekNumber.toString().padStart(2, "0")}`);
        } else if (filterType === "month") {
            const month = (today.getMonth() + 1).toString().padStart(2, "0");
            setSelectedValue(`${today.getFullYear()}-${month}`);
        } else if (filterType === "custom") {
            setCustomRange({
                startDate: today.toISOString().split("T")[0],
                endDate: today.toISOString().split("T")[0],
            });
        }
    }, [filterType]);

    // Lọc theo trạng thái và môn
    const filteredStudents = students
        .filter(s => statusFilter === "all" ? true : s.status === statusFilter)
        .filter(s => subjectFilter === "all" ? true : s.subjectName === subjectFilter);

    // Tổng hợp theo học sinh cho chế độ tuần/tháng
    const aggregatedStudents = () => {
        if (filterType === "day") return filteredStudents;

        const map = {};
        filteredStudents.forEach(s => {
            const key = s.studentId; // Gom nhóm theo studentId
            if (!map[key]) {
                map[key] = {
                    studentId: s.studentId,
                    fullName: s.fullName,
                    lateCount: 0,
                    absentCount: 0,
                    notes: [],
                    dates: [],
                    classSubjectList: new Set(), // Lưu lớp/môn
                };
            }
            if (s.status === "late") map[key].lateCount += 1;
            if (s.status === "absent") map[key].absentCount += 1;

            map[key].dates.push(s.sessionDate);
            if (s.note) map[key].notes.push(`${s.sessionDate}: ${s.note}`);
            map[key].classSubjectList.add(`${s.className || ""} ${s.subjectName}`);
        });

        // Chuyển Set thành mảng nối chuỗi
        return Object.values(map).map(s => ({
            ...s,
            classSubjectList: Array.from(s.classSubjectList).join(", ")
        }));
    };

    const displayStudents = aggregatedStudents();
    const DatesCell = ({ dates }) => {
        const [expanded, setExpanded] = useState(false);

        const handleToggle = () => setExpanded(prev => !prev);

        const displayDates = expanded ? dates : dates.slice(0, 2);

        return (
            <span>
                {displayDates.map((d, i) => (
                    <span key={i}>
                        {formatDateDM(d)}
                        {i < displayDates.length - 1 ? ", " : ""}
                    </span>
                ))}
                {dates.length > 2 && !expanded && (
                    <span className="view-more" onClick={handleToggle}>
                        ... xem thêm
                    </span>
                )}
                {expanded && dates.length > 2 && (
                    <span className="view-more" onClick={handleToggle}>
                        Ẩn bớt
                    </span>
                )}
            </span>
        );
    };

    return (
        <div className="attendance-stats-wrapper">

            {/* Bộ lọc */}
            <div className="attendance-filters">
                <label>
                    Loại thống kê:
                    <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                        <option value="day">Ngày</option>
                        <option value="week">Tuần</option>
                        <option value="month">Tháng</option>
                        <option value="custom">Tùy chỉnh</option>
                    </select>
                </label>

                <label>
                    Chọn {filterType === "day" ? "ngày" : filterType === "week" ? "tuần" : filterType === "month" ? "tháng" : "khoảng thời gian"}:
                    {filterType === "day" && (
                        <input type="date" value={selectedValue} onChange={(e) => setSelectedValue(e.target.value)} />
                    )}
                    {filterType === "week" && (
                        <input type="week" value={selectedValue} onChange={(e) => setSelectedValue(e.target.value)} />
                    )}
                    {filterType === "month" && (
                        <input type="month" value={selectedValue} onChange={(e) => setSelectedValue(e.target.value)} />
                    )}
                    {filterType === "custom" && (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <input
                                type="date"
                                value={customRange.startDate}
                                onChange={(e) =>
                                    setCustomRange(prev => ({ ...prev, startDate: e.target.value }))
                                }
                            />
                            <span>đến</span>
                            <input
                                type="date"
                                value={customRange.endDate}
                                onChange={(e) =>
                                    setCustomRange(prev => ({ ...prev, endDate: e.target.value }))
                                }
                            />
                        </div>
                    )}
                </label>

                <label>
                    Trạng thái:
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="all">Tất cả</option>
                        <option value="late">Đi trễ</option>
                        <option value="absent">Vắng</option>
                    </select>
                </label>

                <label>
                    Môn học:
                    <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
                        <option value="all">Tất cả</option>
                        {subjects.map(sub => (
                            <option key={sub} value={sub}>{sub}</option>
                        ))}
                    </select>
                </label>
            </div>

            {/* Bảng danh sách */}
            {loading ? (
                <p>Đang tải...</p>
            ) : displayStudents.length === 0 ? (
                <p>Không có học sinh đi trễ hoặc vắng</p>
            ) : (
                <table className="attendance-table">
                    <thead>
                        <tr>
                            <th>Họ tên</th>
                            <th>Lớp / Môn</th>
                            {filterType === "day" ? <th>Trạng thái</th> : <>
                                <th>Số lần đi trễ</th>
                                <th>Số lần vắng</th>
                            </>}
                            <th>Ngày điểm danh</th>
                            <th>Ghi chú</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayStudents.map(s => {
                            let rowClass = "";

                            if (filterType !== "day") {
                                if (s.absentCount > 4 || s.lateCount > 4) {
                                    rowClass = "row-danger";
                                } else if (s.absentCount >= 2 || s.lateCount >= 2) {
                                    rowClass = "row-warning";
                                }
                            }

                            return (
                                <tr key={s.studentId} className={rowClass}>
                                    <td>{s.fullName}</td>
                                    <td>{s.classSubjectList}</td>

                                    {filterType === "day" ? (
                                        <td className={
                                            s.status === "late" ? "status-late" :
                                                s.status === "absent" ? "status-absent" : "status-all"
                                        }>
                                            {s.status === "late" ? "Đi trễ" : s.status === "absent" ? "Vắng" : "-"}
                                        </td>
                                    ) : (
                                        <>
                                            <td>{s.lateCount}</td>
                                            <td>{s.absentCount}</td>
                                        </>
                                    )}

                                    <td>
                                        {filterType === "day"
                                            ? formatDateDM(s.sessionDate)
                                            : <DatesCell dates={s.dates} />
                                        }
                                    </td>

                                    <td>{s.notes?.join("; ") || "-"}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AttendanceStats;
