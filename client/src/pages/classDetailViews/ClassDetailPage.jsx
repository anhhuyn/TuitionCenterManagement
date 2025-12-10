import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSubjectByIdApi } from "../../util/api"; 
import "../../styles/ClassDetailView.css";
import { cilCalendar, cilChart, cilUser, cilList, cilBook, cilFolder, cilCheckCircle, cilClipboard, cilContact, cilBell, cilDescription } from "@coreui/icons";
import CIcon from "@coreui/icons-react";

import SubjectDetail from "./SubjectDetail";
import StudentList from "./StudentList";
import CustomCalendar from "./CustomCalendar";
import AttendanceStudent from "./AttendanceStudent";
import MaterialList from "./MaterialList";
import AssignmentList from "./AssignmentList";

const sideMenu = [
    { label: "Chi tiết môn học", icon: cilDescription },
    { label: "Lịch học", icon: cilCalendar },
    { label: "Thống kê", icon: cilChart },
    { label: "Học viên", icon: cilUser },
    { label: "Các buổi học", icon: cilList },
    { label: "Bài tập", icon: cilBook },
    { label: "Tài liệu", icon: cilFolder },
    { label: "Điểm danh", icon: cilCheckCircle },
    { label: "Bảng điểm", icon: cilClipboard },
    { label: "Điểm danh giáo viên", icon: cilUser },
    { label: "Phản hồi buổi học", icon: cilContact },
    { label: "Thông báo", icon: cilBell }
];

const componentMap = {
    "Chi tiết môn học": SubjectDetail,
    "Học viên": StudentList,
    "Lịch học": (props) => <CustomCalendar subjectId={props.classData.id} />,
    "Điểm danh": AttendanceStudent,
    "Tài liệu": MaterialList,
    "Bài tập": AssignmentList,

    // ... các component khác
};

export default function ClassDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [classData, setClassData] = useState(null);
    const [activeMenu, setActiveMenu] = useState("Chi tiết môn học");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClass = async () => {
            // RESET trạng thái khi ID thay đổi
            setLoading(true);
            setClassData(null); 
            
            try {
                // GỌI API CHI TIẾT THEO ID TỪ URL
                const res = await getSubjectByIdApi(id); 

                if (res.success && res.data) {
                    setClassData(res.data);
                } else {
                    console.error(`Không tìm thấy môn học có ID ${id} hoặc API thất bại.`);
                    // Có thể thêm xử lý lỗi như navigate("/admin/error/404")
                }
            } catch (err) {
                console.error("Lỗi fetch chi tiết lớp:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchClass();
    }, [id]);

    if (loading) return <p>Đang tải chi tiết môn học...</p>;
    // Trường hợp fetch xong nhưng không có dữ liệu (API trả về 404/lỗi)
    if (!classData) return <p>Không tìm thấy môn học.</p>; 

    const ActiveComponent = componentMap[activeMenu];

    return (
        <div className="class-detail-layout">
            <div className="class-sub-sidebar">
                <button className="btn-back" onClick={() => navigate("/admin/classlist")}>
                    ← Trở lại
                </button>
                <ul>
                    {sideMenu.map((item) => (
                        <li
                            key={item.label}
                            className={activeMenu === item.label ? "active" : ""}
                            onClick={() => setActiveMenu(item.label)}
                            style={{ cursor: "pointer" }}
                        >
                            <CIcon icon={item.icon} className="sidebar-icon" />
                            {item.label}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="class-detail-content">
                {/* Truyền classData xuống các component con */}
                {ActiveComponent ? <ActiveComponent classData={classData} /> : <p>Chưa có nội dung</p>}
            </div>
        </div>
    );
}