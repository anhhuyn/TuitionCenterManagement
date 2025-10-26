# Website Quản Lý Trung Tâm Dạy Thêm

## Mục lục
1. [Giới thiệu dự án](#giới-thiệu-dự-án)
2. [Mô tả chi tiết](#mô-tả-chi-tiết)
3. [Công nghệ sử dụng](#công-nghệ-sử-dụng)
4. [Cài đặt và chạy dự án](#cài-đặt-và-chạy-dự-án)
5. [Cách sử dụng](#cách-sử-dụng)
6. [Thành viên nhóm](#thành-viên-nhóm)
7. [Hướng dẫn đóng góp](#hướng-dẫn-đóng-góp)
8. [Kiểm thử và demo](#kiểm-thử-và-demo)

---

## Giới thiệu dự án
Website Quản Lý Trung Tâm Dạy Thêm là hệ thống giúp số hóa toàn bộ quy trình quản lý tại các trung tâm dạy thêm – bao gồm việc quản lý học viên, giáo viên, lớp học, thời khóa biểu, điểm danh và học phí.

Dự án được thực hiện trong khuôn khổ môn học **Các Công Nghệ Phần Mềm Mới** tại **Trường Đại học Sư phạm Kỹ thuật TP.HCM**, với mục tiêu ứng dụng công nghệ web hiện đại để tối ưu hóa công tác quản lý giáo dục trong thời kỳ chuyển đổi số.

---

## Mô tả chi tiết

### Mục tiêu
- Số hóa quy trình quản lý trung tâm dạy thêm.  
- Giúp giáo viên, học viên và quản trị viên dễ dàng tương tác, cập nhật thông tin, theo dõi lịch học, điểm danh và tiến độ học tập.  
- Giảm thiểu sai sót trong quá trình ghi chép thủ công và lưu trữ dữ liệu.  

### Đối tượng người dùng
- **Admin:** Quản lý học viên, giáo viên, lớp học, thời khóa biểu, học phí và thông báo.  
- **Teacher (Giáo viên):** Quản lý điểm danh, nhập điểm, theo dõi học viên, gửi nhận xét.  
- (Tương lai: **Phụ huynh/Học viên** có thể đăng nhập và xem thông tin học tập.)

### Tính năng nổi bật
- Đăng ký, đăng nhập, quên mật khẩu với OTP xác thực qua email.  
- Quản lý thông tin giáo viên: thêm, sửa, xóa, lọc, xuất Excel.  
- Quản lý học viên: CRUD, thêm phụ huynh, xuất Excel, xóa hàng loạt.  
- Quản lý môn học: trạng thái (đang mở, sắp mở, đã kết thúc), thống kê số học viên, quản lý lịch học, điểm danh học viên, quản lý bài tập và tài liệu theo môn học đó.
- Quản lý hồ sơ cá nhân: đổi ảnh đại diện, đổi email với OTP.  
- Giao diện hiện đại, trực quan, phản hồi nhanh theo thời gian thực.  

### Thách thức & hướng phát triển
**Thách thức:**  
- Xử lý OTP bảo mật và tránh spam mail.  
- Đồng bộ dữ liệu giữa nhiều bảng (User – Teacher – Student – Address – Subject).  
- Tối ưu hiệu năng truy vấn Sequelize khi join nhiều bảng.  

**Dự định phát triển tương lai:**  
- Thêm vai trò **Phụ huynh** và **Học viên** với giao diện riêng.  
- Tích hợp **thanh toán học phí trực tuyến**.  
- Tự động gửi **email/sms thông báo điểm danh, học phí, lịch học**.  
- Hệ thống báo cáo và thống kê nâng cao (BI Dashboard).

---

## Công nghệ sử dụng

| Thành phần | Công nghệ |
|-------------|------------|
| **Frontend** | ReactJS, Axios, CoreUI, TailwindCSS |
| **Backend** | Node.js (ExpressJS), Sequelize ORM |
| **Database** | MySQL |
| **Auth & Security** | JWT, BCrypt, Cookie HttpOnly |
| **Email Service** | Nodemailer (Gmail SMTP) |
| **File Upload** | Multer |
| **Excel Export** | ExcelJS |

---

## Cài đặt và chạy dự án

### Yêu cầu môi trường
- Node.js >= 18  
- MySQL >= 8  
- NPM hoặc Yarn  

### Bước 1: Clone repository
```bash
git clone https://github.com/yourusername/tuition-center-management.git
cd tuition-center-management
```

### Bước 2: Cài đặt dependencies
#### Frontend
```bash
cd client
npm install
```

#### Backend
```bash
cd server
npm install
```

### Bước 3: Cấu hình môi trường
Tạo file `.env` trong thư mục `server` với nội dung mẫu:
```env
PORT=8080
DB_HOST=localhost
DB_USER=root
DB_PASS=yourpassword
DB_NAME=tuition_center
JWT_SECRET=your_jwt_secret
EMAIL_USERNAME=youremail@gmail.com
EMAIL_PASSWORD=your_app_password
```

### Bước 4: Chạy dự án
#### Chạy backend:
```bash
cd server
npm run dev
```

#### Chạy frontend:
```bash
cd client
npm start
```

Ứng dụng sẽ chạy tại:  
- Frontend: http://localhost:3000  
- Backend: http://localhost:8080  

---

## Cách sử dụng

1. Đăng ký tài khoản → Xác thực OTP qua email.  
2. Đăng nhập hệ thống (Admin/Teacher).  
3. **Admin:**  
   - Quản lý giáo viên, học viên, lớp học, lịch học, học phí.  
   - Xuất dữ liệu Excel, tìm kiếm, lọc theo trạng thái.  
4. **Teacher:**  
   - Xem danh sách lớp được phân công.  
   - Điểm danh học viên, nhập điểm, gửi nhận xét.  
5. Cập nhật hồ sơ cá nhân, đổi ảnh đại diện, đổi email có OTP bảo mật.  

---

## Thành viên nhóm

| Họ tên | MSSV |
|--------|------|
| Nguyễn Thị Ánh Huyền | 21110476 | 
| La Nguyễn Phúc Thành | 22110414 |

**GVHD:** ThS. Nguyễn Hữu Trung  
**Trường Đại học Sư phạm Kỹ thuật TP.HCM – Khoa CNTT**

---

## Hướng dẫn đóng góp
Mọi đóng góp đều được hoan nghênh.  
Nếu bạn muốn tham gia:
1. Fork repository.  
2. Tạo nhánh mới: `git checkout -b feature/ten-chuc-nang`.  
3. Commit thay đổi: `git commit -m "Thêm chức năng X"`.  
4. Push lên GitHub: `git push origin feature/ten-chuc-nang`.  
5. Tạo Pull Request để nhóm xem xét.  

---

## Kiểm thử và demo
- Sử dụng Postman để test các API RESTful (login, register, forgot password, CRUD giáo viên/học sinh).  
- Dữ liệu demo có sẵn trong thư mục `/server/seeders`.  
- Giao diện frontend hiển thị danh sách giáo viên, học viên, lịch dạy và bảng điểm.  
