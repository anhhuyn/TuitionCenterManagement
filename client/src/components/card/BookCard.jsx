// src/components/card/BookCard.jsx
import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi"; // ✅ Thêm icon mũi tên

const BookCard = ({ title, icon, color, path, image }) => {
  const navigate = useNavigate();

  // ✅ Mô tả chi tiết hơn cho từng thẻ (tùy theo title)
  const descriptions = {
    "Danh sách lớp học": "Quản lý, theo dõi và chỉnh sửa thông tin các lớp học trong hệ thống.",
    "Danh sách học viên": "Xem thông tin, tiến độ và trạng thái của toàn bộ học viên.",
    "Danh sách giáo viên": "Quản lý danh sách, hợp đồng và lịch dạy của giáo viên.",
    "Thỏa thuận giáo viên": "Theo dõi và cập nhật các điều khoản, hợp đồng thỏa thuận với giáo viên.",
    "Bảng lương": "Tổng hợp, thống kê và hiển thị chi tiết lương của từng giáo viên.",
    "Tạo bảng lương": "Tạo và xuất bảng lương mới nhanh chóng chỉ với vài bước.",
  };

  return (
    <StyledWrapper color={color} onClick={() => navigate(path)}>
      <div className="book">
        {/* === Mặt sau (nội dung sau khi lật) === */}
        <div className="content">
          <p className="card-title">{title}</p>
          <p className="card-desc">{descriptions[title]}</p>
          <button className="go-to-btn">
            <FiArrowRight size={18} />
          </button>
        </div>

        {/* === Mặt trước (bìa sách) === */}
        <div className="cover">
          <img src={image} alt={title} className="cover-img" />
          <p className="cover-text">{title}</p>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  margin-bottom: 20px;

  .book {
    position: relative;
    border-radius: 5px;
    width: 250px;
    height: 230px;
    background-color: #ffffff;
    box-shadow: 0px 4px 10px rgba(58, 74, 118, 0.15);
    transform-style: preserve-3d;
    perspective: 2000px;
    transition: all 0.3s ease;
  }

  .book:hover {
    transform: translateY(-4px);
    box-shadow: 0px 8px 20px rgba(58, 74, 118, 0.25);
  }

  .content {
    position: absolute;
    inset: 0;
    text-align: center;
    color: #3a4a76;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    backface-visibility: hidden;
    padding: 0 15px;
  }

  .card-icon {
    margin-bottom: 10px;
    color: #3a4a76;
  }

  .card-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .card-desc {
    font-size: 14px;
    line-height: 1.4;
    color: #555;
    margin-bottom: 15px;
  }

  .go-to-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: transparent;
    border: 1.5px solid #3a4a76;
    cursor: pointer;
    transition: all 0.3s;
    color: #3a4a76;
  }

  .go-to-btn:hover {
    background-color: #3a4a76;
    color: #fff;
    transform: translateX(3px);
  }

  .cover {
    position: absolute;
    inset: 0;
    background-color: ${(props) => props.color};
    border-radius: 5px;
    transition: all 0.5s;
    transform-origin: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    overflow: hidden;
  }

  .cover-img {
    width: 100%;
    aspect-ratio: 4 / 3;
    object-fit: cover;
    border-radius: 5px 5px 0 0;
  }

  .cover-text {
    font-size: 18px;
    font-weight: 600;
    color: #3a4a76;
    text-align: center;
    width: 100%;
    padding: 10px;
    margin-top: auto;
    border-top: 1px solid rgba(58, 74, 118, 0.1);
  }

  .book:hover .cover {
    transform: rotateY(-80deg);
  }
`;

export default BookCard;
