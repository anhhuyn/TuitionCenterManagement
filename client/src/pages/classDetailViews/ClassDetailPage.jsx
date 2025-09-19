import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSubjectsApi } from "../../util/api";
import "../../styles/ClassDetailView.css";
import { cilCalendar, cilChart, cilUser, cilList, cilBook, cilFolder, cilCheckCircle, cilClipboard, cilContact, cilBell, cilDescription } from "@coreui/icons";
import CIcon from "@coreui/icons-react";

import SubjectDetail from "./SubjectDetail";

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

  // ... các component khác
};

export default function ClassDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [classData, setClassData] = useState(null);
  const [activeMenu, setActiveMenu] = useState("Chi tiết môn học");

  useEffect(() => {
    const fetchClass = async () => {
      try {
        const res = await getSubjectsApi();
        if (res.success) {
          const found = res.data.find((cls) => cls.id === parseInt(id));
          setClassData(found);
        }
      } catch (err) {
        console.error("Lỗi fetch lớp:", err);
      }
    };
    fetchClass();
  }, [id]);

  if (!classData) return <p>Đang tải...</p>;

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
        {ActiveComponent ? <ActiveComponent classData={classData} /> : <p>Chưa có nội dung</p>}
      </div>
    </div>
  );
}
