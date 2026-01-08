import React, { useState, useEffect, useRef } from "react";
import "../styles/CustomerTable.css";
import { CIcon } from "@coreui/icons-react";
import {
  cilFilter,
  cilSpreadsheet,
  cilPencil,
  cilTrash,
  cilSearch,
  cilCloudUpload,
} from "@coreui/icons";
import { FiPhone, FiCalendar, FiUser } from 'react-icons/fi';
import FilterPanel from "../components/modal/FilterPanel";
import axios from "axios";
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CFormSelect,
  CButton,
} from "@coreui/react";

export default function CustomerTable() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [loading, setLoading] = useState(true);
  const filterRef = useRef(null);

  // Bộ lọc nâng cao
  const [filters, setFilters] = useState({
    subject: "",
    grade: "",
    gender: "",
    schoolName: "",
  });
  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10; // số dòng mỗi trang

  // 🟢 Modal thêm / sửa học viên
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // 🟢 Modal xem chi tiết học viên
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [studentDetail, setStudentDetail] = useState(null);
  // Sắp xếp theo tên (asc: A-Z, desc: Z-A)

  const [newStudent, setNewStudent] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    grade: "",
    schoolName: "",
    gender: true,
    dateOfBirth: "",
    address: { details: "", ward: "", province: "" },
    parents: [{ fullName: "", phoneNumber: "" }],
    image: null,
  });

  // 🟢 Lấy danh sách học viên
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:8088/v1/api/students", {
        params: {
          page: currentPage,
          limit,
          name: search || undefined,
          subject: filters.subject || undefined,
          grade: filters.grade || undefined,
          schoolName: filters.schoolName || undefined,
          gender: filters.gender || undefined,
        },
      });

      // Trong hàm fetchStudents
      if (res.data.errCode === 0) {
        setStudents(res.data.data);
        setPagination({
          // Backend Java: new PaginationDTO(studentPage.getTotalElements(), ...)
          // Cần đảm bảo tên trường khớp với DTO Java
          total: res.data.pagination?.total || res.data.pagination?.totalElements || 0,
          totalPages: res.data.pagination?.totalPages || 1,
          page: res.data.pagination?.page || 1,
          limit: res.data.pagination?.limit || 10,
        });


      } else {
        console.error("Lỗi khi lấy dữ liệu:", res.data.message);
      }
    } catch (error) {
      console.error("Error fetch students:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [filters, search, currentPage]);


  // 🔒 Đóng filter khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilter(false);
      }
    };
    if (showFilter) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFilter]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelected(students.map((row) => row.id));
    } else {
      setSelected([]);
    }
  };

  const handleSelectRow = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((s) => s !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  // Hàm tách họ, tên lót, tên (Thêm vào đây)
  const splitNameParts = (fullName) => {
    const parts = fullName?.trim().split(" ") || [];
    const name = parts[parts.length - 1] || ""; // Tên cuối
    const middle = parts.slice(1, parts.length - 1).join(" "); // Tên lót (các từ ở giữa)
    const last = parts[0] || ""; // Họ
    return { name, middle, last };
  };

  // 🔍 Lọc và Sắp xếp theo họ tên, email, trường, phụ huynh
  const filteredData = students
    .filter(
      (row) =>
        row.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        row.email?.toLowerCase().includes(search.toLowerCase()) ||
        row.schoolName?.toLowerCase().includes(search.toLowerCase()) ||
        row.parents?.some((p) =>
          p.fullName?.toLowerCase().includes(search.toLowerCase())
        )
    )
    .sort((a, b) => {
      const nameA = splitNameParts(a.fullName);
      const nameB = splitNameParts(b.fullName);

      // 1. So sánh tên cuối (Ví dụ: An trước Anh)
      const nameCompare = nameA.name.localeCompare(nameB.name, "vi", { sensitivity: "base" });
      if (nameCompare !== 0) return nameCompare;

      // 2. Nếu tên cuối giống, so sánh tên lót (Ví dụ: Xuân trước Văn)
      const middleCompare = nameA.middle.localeCompare(nameB.middle, "vi", { sensitivity: "base" });
      if (middleCompare !== 0) return middleCompare;

      // 3. Nếu tên lót cũng giống, so sánh họ (Ví dụ: Trần trước Nguyễn)
      return nameA.last.localeCompare(nameB.last, "vi", { sensitivity: "base" });
    });

  // 🟢 Xử lý input thay đổi
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (["details", "ward", "province"].includes(name)) {
      setNewStudent({
        ...newStudent,
        address: { ...newStudent.address, [name]: value },
      });
    } else if (name === "gender") {
      setNewStudent({ ...newStudent, gender: value === "true" });
    } else {
      setNewStudent({ ...newStudent, [name]: value });
    }
  };

  const handleImageChange = (e) => {
    setNewStudent({ ...newStudent, image: e.target.files[0] });
  };

  // 🟢 Mở modal thêm mới
  const handleAdd = () => {
    setEditMode(false);
    setCurrentId(null);
    setNewStudent({
      fullName: "",
      email: "",
      phoneNumber: "",
      grade: "",
      schoolName: "",
      gender: true,
      dateOfBirth: "",
      address: { details: "", ward: "", province: "" },
      parents: [{ fullName: "", phoneNumber: "" }],
      image: null,
    });
    setShowModal(true);
    fetchProvinces();
  };

  // 🟢 Mở modal sửa học viên
  const handleEdit = async (student) => {
    setEditMode(true);
    setCurrentId(student.id);
    setNewStudent({
      ...student,
      address: student.address || { details: "", ward: "", province: "" },
      parents: student.parents?.length ? student.parents : [{ fullName: "", phoneNumber: "" }],
    });
    setShowModal(true);

    await fetchProvinces();
    if (student.address?.province) {
      await fetchWardsByProvince(student.address.province);
    }
  };



  // 🟢 Gửi form thêm / cập nhật học viên
  const handleSubmit = async () => {
    try {
      const formData = new FormData();

      // 1. Append các trường cơ bản
      formData.append("fullName", newStudent.fullName);
      formData.append("email", newStudent.email);
      formData.append("phoneNumber", newStudent.phoneNumber);
      formData.append("grade", newStudent.grade);
      formData.append("schoolName", newStudent.schoolName);
      formData.append("gender", newStudent.gender); // Chuyển boolean/string tùy BE
      formData.append("dateOfBirth", newStudent.dateOfBirth || ""); // Tránh null
      formData.append("roleId", "R2"); // Luôn gửi role R2

      // 2. Append Address (Dùng dấu chấm để Spring Boot hiểu là Object con)
      if (newStudent.address) {
        formData.append("address.details", newStudent.address.details || "");
        formData.append("address.ward", newStudent.address.ward || "");
        formData.append("address.province", newStudent.address.province || "");
      }

      // 3. Append Parents (Dùng index để Spring Boot hiểu là List)
      if (newStudent.parents && newStudent.parents.length > 0) {
        newStudent.parents.forEach((parent, index) => {
          formData.append(`parents[${index}].fullName`, parent.fullName || "");
          formData.append(`parents[${index}].phoneNumber`, parent.phoneNumber || "");
          formData.append(`parents[${index}].relationship`, "Phụ huynh"); // Backend cần trường này (hoặc default)
        });
      }

      // 4. Append Image
      if (newStudent.image instanceof File) {
        formData.append("file", newStudent.image);
      }

      // --- GỌI API ---
      let res;
      if (editMode && currentId) {
        // PUT update
        res = await axios.put(
          `http://localhost:8088/v1/api/students/${currentId}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      } else {
        // POST create
        res = await axios.post(
          "http://localhost:8088/v1/api/students",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      }

      if (res.data && res.data.errCode === 0) {
        alert(editMode ? "Cập nhật thành công!" : "Thêm mới thành công!");
        setShowModal(false);
        // Reset form sau khi thành công
        setNewStudent({
          fullName: "", email: "", phoneNumber: "", grade: "", schoolName: "",
          gender: true, dateOfBirth: "",
          address: { details: "", ward: "", province: "" },
          parents: [{ fullName: "", phoneNumber: "" }],
          image: null,
        });
        await fetchStudents();
      } else {
        alert(res.data?.message || "Thao tác thất bại!");
      }
    } catch (err) {
      console.error("Submit Error:", err);
      // Log chi tiết lỗi từ backend nếu có
      const serverMsg = err.response?.data?.message || err.message;
      alert(`Lỗi: ${serverMsg}`);
    }
  };

  // Xóa học viên
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa học viên này không?")) return;

    try {
      const res = await axios.delete(`http://localhost:8088/v1/api/students/${id}`);

      if (res.data.errCode === 0) {
        alert("Xóa học viên thành công!");
        setStudents(students.filter((s) => s.id !== id));
      } else {
        // Nếu backend trả lỗi nghiệp vụ
        alert(res.data.message || "Không thể xóa học viên!");
      }
    } catch (err) {
      console.error("Lỗi khi xóa học viên:", err);

      // Hiển thị thông báo lỗi chi tiết nếu có từ backend
      const serverMsg = err.response?.data?.message;
      if (serverMsg) {
        alert(`Không thể xóa học viên: ${serverMsg}`);
      } else {
        alert("Lỗi kết nối khi xóa học viên!");
      }
    }
  };

  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingProvince, setLoadingProvince] = useState(false);
  const [loadingWard, setLoadingWard] = useState(false);

  const fetchProvinces = async () => {
    setLoadingProvince(true);
    try {
      const res = await fetch("https://vietnamlabs.com/api/vietnamprovince");
      const data = await res.json();
      if (data.success) setProvinces(data.data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách tỉnh:", error);
    } finally {
      setLoadingProvince(false);
    }
  };
  const fetchWardsByProvince = async (provinceName) => {
    if (!provinceName) return;
    setLoadingWard(true);
    try {
      const res = await fetch(
        `https://vietnamlabs.com/api/vietnamprovince?province=${encodeURIComponent(provinceName)}`
      );
      const data = await res.json();
      if (data.success && data.data.wards) {
        setWards(data.data.wards);
      }
    } catch (error) {
      console.error("Lỗi khi tải phường/xã:", error);
    } finally {
      setLoadingWard(false);
    }
  };

  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    page: 1,
    limit: 10,
  });

  // Xóa nhiều học viên được chọn
  const handleDeleteSelected = async () => {
    if (selected.length === 0) {
      alert("Vui lòng chọn ít nhất một học viên để xóa!");
      return;
    }

    if (!window.confirm(`Bạn có chắc muốn xóa ${selected.length} học viên đã chọn không?`)) return;

    try {
      const res = await axios.post("http://localhost:8088/v1/api/students/delete-multiple", {
        ids: selected
      });

      if (res.data.errCode === 0) {
        alert("Đã xóa các học viên được chọn!");
        setSelected([]);
        await fetchStudents();
      } else {
        alert(res.data.message || "Không thể xóa học viên!");
      }
    } catch (err) {
      const serverMsg = err.response?.data?.message;
      if (serverMsg) {
        alert(`Lỗi khi xóa: ${serverMsg}`);
      } else {
        alert("Lỗi kết nối khi xóa nhiều học viên!");
      }
    }
  };
  const handleViewDetail = async (id) => {
    try {
      const res = await axios.get(`http://localhost:8088/v1/api/students/${id}`);
      if (res.data.errCode === 0) {
        setStudentDetail(res.data.data);
        setShowDetailModal(true);
      } else {
        alert("Không tìm thấy thông tin học viên!");
      }
    } catch (err) {
      console.error("Lỗi khi xem chi tiết học viên:", err);
      alert("Lỗi kết nối khi lấy thông tin chi tiết!");
    }
  };

  // Thêm state loading cho export nếu chưa có
  const [exporting, setExporting] = useState(false);

  const handleExportStudentsExcel = async () => {
    try {
      setExporting(true); // 1. Bắt đầu loading

      const res = await axios.get(
        "http://localhost:8088/v1/api/students/export", // URL backend của bạn
        {
          params: {
            name: search || undefined,
            subject: filters.subject || undefined,
            grade: filters.grade || undefined,
            schoolName: filters.schoolName || undefined,
            gender: filters.gender || undefined,
          },
          responseType: "blob", // Quan trọng
        }
      );

      // Kiểm tra xem dữ liệu trả về có phải JSON (lỗi) hay không
      const isJson = res.headers["content-type"] && res.headers["content-type"].indexOf("application/json") !== -1;

      if (isJson) {
        // Nếu server trả về JSON lỗi dưới dạng Blob, cần đọc ra
        const reader = new FileReader();
        reader.onload = () => {
          const errorData = JSON.parse(reader.result);
          alert(`Lỗi xuất file: ${errorData.message || "Không xác định"}`);
        };
        reader.readAsText(res.data);
        return;
      }

      // 2. Nếu OK -> Tiến hành tải
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Danh_sach_hoc_vien_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();

      // Dọn dẹp
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error("Lỗi export:", err);
      alert("Có lỗi xảy ra khi kết nối tới server để xuất file.");
    } finally {
      setExporting(false); // Tắt loading
    }
  };
  // Helper xử lý ảnh
  const getImageUrl = (imagePath) => {
    // 1. Nếu không có đường dẫn -> Trả về ảnh mặc định
    if (!imagePath) return "https://via.placeholder.com/150?text=No+Image";

    // 2. Nếu đường dẫn đã là link online (ví dụ firebase) -> Giữ nguyên
    if (imagePath.startsWith("http")) return imagePath;

    // 3. Nếu là đường dẫn lưu trong DB (ví dụ: "uploads/anh1.jpg") -> Ghép với localhost
    // Lưu ý: Kiểm tra xem imagePath có dấu "/" ở đầu không để ghép cho đúng
    const baseUrl = "http://localhost:8088/"; // Port backend của bạn
    const cleanPath = imagePath.startsWith("/") ? imagePath.substring(1) : imagePath;

    return `${baseUrl}${cleanPath}`;
  };
  return (
    <div className="table-container">
      {/* Thanh trên */}
      <div className="top-bar">
        <div className="left-tools">
          {/* Nút Filter */}
          <div className="filter-wrapper" ref={filterRef}>
            <button
              className="btn-filter"
              onClick={() => setShowFilter(!showFilter)}
            >
              <CIcon icon={cilFilter} />
            </button>

            {/* Panel lọc mở ra */}
            {showFilter && (
              <div className="filter-panel-container">
                <FilterPanel
                  type="student" // loại student
                  filters={filters}
                  onChange={(newFilters) => {
                    setFilters(newFilters);
                  }}
                />
              </div>
            )}
          </div>

          {/* Ô tìm kiếm */}
          <div className="search-wrapper">

            <input
              type="text"
              placeholder="Nhập tên học viên"
              className="search-box"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="right-tools">
          {/* Xuất Excel */}
          <button className="btn-excel" onClick={handleExportStudentsExcel}>
            <CIcon icon={cilSpreadsheet} /> Xuất Excel
          </button>

          {/* Xóa tất cả học viên được chọn */}
          <button
            className="btn-delete-all"
            onClick={handleDeleteSelected}
            disabled={selected.length === 0}
          >
            <CIcon icon={cilTrash} /> Xóa tất cả
          </button>
          <button className="btn-add" onClick={handleAdd}>
            + Thêm học viên
          </button>
        </div>
      </div>


      {/* Bảng dữ liệu */}
      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : (
        <table className="customer-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  className="custom-checkbox"
                  checked={selected.length === students.length}
                  onChange={handleSelectAll}
                />
              </th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Số điện thoại</th>
              <th>Lớp</th>
              <th>Trường</th>
              <th>Giới tính</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row) => (
              <tr
                key={row.id}
                onClick={() => handleViewDetail(row.id)}
                className="row-clickable"
                style={{ cursor: "pointer" }}
              >
                <td onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    className="custom-checkbox"
                    checked={selected.includes(row.id)}
                    onChange={() => handleSelectRow(row.id)}
                  />
                </td>
                <td>{row.fullName}</td>
                <td>{row.email}</td>
                <td>{row.phoneNumber || "N/A"}</td>
                <td>{row.grade || "Chưa có"}</td>
                <td>{row.schoolName || "Chưa có"}</td>
                <td>{row.gender ? "Nam" : "Nữ"}</td>
                <td
                  className="action-cell"
                  onClick={(e) => e.stopPropagation()} // Ngăn mở modal khi click nút
                >
                  <button
                    className="btn-edit"
                    onClick={() => handleEdit(row)}
                  >
                    <CIcon icon={cilPencil} />
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(row.id)}
                  >
                    <CIcon icon={cilTrash} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>

        </table>

      )}

      {/* Phân trang nâng cao */}
      {pagination && (
        <div className="pagination">
          {/* Nút trái */}
          <button
            className="arrow"
            onClick={() =>
              setCurrentPage((prev) => Math.max(prev - 1, 1))
            }
            disabled={currentPage === 1}
          >
            &lt;
          </button>

          {/* Render số trang */}
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
            .filter((p) => {
              if (pagination.totalPages <= 5) return true; // nếu tổng trang <=5 thì hiện hết
              if (p === 1 || p === pagination.totalPages) return true; // luôn hiện trang đầu + cuối
              if (p >= currentPage - 1 && p <= currentPage + 1) return true; // hiện trang gần current
              return false;
            })
            .map((p, idx, arr) => {
              const prev = arr[idx - 1];
              return (
                <React.Fragment key={p}>
                  {/* chèn dấu ... nếu bị nhảy cách */}
                  {prev && p - prev > 1 && <span className="dots">...</span>}
                  <button
                    className={`page-btn ${currentPage === p ? "active" : ""}`}
                    onClick={() => setCurrentPage(p)}
                  >
                    {p}
                  </button>
                </React.Fragment>
              );
            })}

          {/* Nút phải */}
          <button
            className="arrow"
            onClick={() =>
              setCurrentPage((prev) =>
                Math.min(prev + 1, pagination.totalPages)
              )
            }
            disabled={currentPage === pagination.totalPages}
          >
            &gt;
          </button>
        </div>
      )}



      {/* Modal thêm/sửa học viên */}
      <CModal visible={showModal} onClose={() => setShowModal(false)} size="lg">
        <CModalHeader>
          <CModalTitle>
            {editMode ? "Cập nhật thông tin học viên" : "Thêm học viên mới"}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="p-3 rounded-lg bg-white">
            <div className="row g-4 align-items-start">
              {/* Cột trái - Ảnh đại diện */}
              <div className="col-md-4 text-center">
                <div
                  className="border rounded-3 p-3 bg-white shadow-sm"
                  style={{ minHeight: "270px" }}
                >
                  <label className="form-label fw-semibold">Ảnh đại diện</label>
                  <div className="d-flex justify-content-center">
                    <img
                      src={
                        newStudent.image
                          ? typeof newStudent.image === "string"
                            ? newStudent.image.startsWith("http")
                              ? newStudent.image
                              : `http://localhost:8088/${newStudent.image}`  // Thêm host nếu thiếu
                            : URL.createObjectURL(newStudent.image)
                          : "https://cdn-icons-png.flaticon.com/512/847/847969.png"
                      }
                      alt="Preview"
                      className="rounded-circle mb-3"
                      style={{
                        width: "130px",
                        height: "130px",
                        objectFit: "cover",
                        border: "3px solid #ddd",
                      }}
                    />

                  </div>
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    className="form-control"
                    onChange={handleImageChange}
                  />
                </div>
              </div>

              {/* Cột phải - Thông tin học viên */}
              <div className="col-md-8">
                <CForm className="row g-3">
                  <h6 className="csection-title">Thông tin cơ bản</h6>
                  <div className="col-md-6">
                    <CFormInput
                      name="fullName"
                      label="Họ và tên"
                      value={newStudent.fullName}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <CFormInput
                      name="email"
                      label="Email"
                      value={newStudent.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <CFormInput
                      name="phoneNumber"
                      label="Số điện thoại"
                      value={newStudent.phoneNumber}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <CFormInput
                      type="date"
                      name="dateOfBirth"
                      label="Ngày sinh"
                      value={newStudent.dateOfBirth}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <CFormInput
                      name="grade"
                      label="Lớp"
                      value={newStudent.grade}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <CFormInput
                      name="schoolName"
                      label="Trường"
                      value={newStudent.schoolName}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <CFormSelect
                      name="gender"
                      label="Giới tính"
                      value={newStudent.gender.toString()}
                      onChange={handleChange}
                    >
                      <option value="true">Nam</option>
                      <option value="false">Nữ</option>
                    </CFormSelect>
                  </div>

                  {/* 🏠 Địa chỉ */}
                  <div className="col-12 mt-3">
                    <h6 className="csection-title">Địa chỉ</h6>
                  </div>
                  <div className="col-md-12">
                    <CFormInput
                      name="details"
                      label="Địa chỉ chi tiết"
                      value={newStudent.address.details}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <CFormSelect
                      name="province"
                      label="Tỉnh/Thành phố"
                      value={newStudent.address.province}
                      onChange={(e) => {
                        const province = e.target.value;
                        setNewStudent({
                          ...newStudent,
                          address: { ...newStudent.address, province, ward: "" },
                        });
                        fetchWardsByProvince(province);
                      }}
                    >
                      <option value="">-- Chọn tỉnh/thành phố --</option>
                      {loadingProvince ? (
                        <option disabled>Đang tải...</option>
                      ) : (
                        provinces.map((p) => (
                          <option key={p.id} value={p.province}>
                            {p.province}
                          </option>
                        ))
                      )}
                    </CFormSelect>
                  </div>

                  <div className="col-md-6">
                    <CFormSelect
                      name="ward"
                      label="Phường/Xã"
                      value={newStudent.address.ward}
                      onChange={(e) =>
                        setNewStudent({
                          ...newStudent,
                          address: { ...newStudent.address, ward: e.target.value },
                        })
                      }
                    >
                      <option value="">-- Chọn phường/xã --</option>
                      {loadingWard ? (
                        <option disabled>Đang tải...</option>
                      ) : (
                        wards.map((w, i) => (
                          <option key={i} value={w.name}>
                            {w.name}
                          </option>
                        ))
                      )}
                    </CFormSelect>
                  </div>

                  {/* 👨‍👩‍👧 Phụ huynh */}
                  <div className="col-12 mt-3">
                    <h6 className="csection-title">Thông tin phụ huynh</h6>
                  </div>
                  <div className="col-md-6">
                    <CFormInput
                      name="parentFullName"
                      label="Họ tên phụ huynh"
                      value={newStudent.parents[0].fullName}
                      onChange={(e) =>
                        setNewStudent({
                          ...newStudent,
                          parents: [
                            { ...newStudent.parents[0], fullName: e.target.value },
                          ],
                        })
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <CFormInput
                      name="parentPhone"
                      label="SĐT phụ huynh"
                      value={newStudent.parents[0].phoneNumber}
                      onChange={(e) =>
                        setNewStudent({
                          ...newStudent,
                          parents: [
                            { ...newStudent.parents[0], phoneNumber: e.target.value },
                          ],
                        })
                      }
                    />
                  </div>
                </CForm>
              </div>
            </div>
          </div>
        </CModalBody>


        <CModalFooter className="d-flex justify-content-between">
          <CButton color="primary" onClick={handleSubmit}>
            {editMode ? "Lưu thay đổi" : "Thêm học viên"}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* 🟢 Modal xem chi tiết học viên */}
      <CModal
        visible={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        alignment="center"
        size="lg" // Đặt size lg cho vừa vặn hơn
        className="student-detail-modal"
      >
        <CModalHeader className="custom-modal-header">
          <h5 className="m-0">Thông tin chi tiết học viên</h5>
        </CModalHeader>

        <CModalBody className="p-4 bg-light">
          {studentDetail ? (
            <div className="container-fluid">
              <div className="row g-4">
                {/* Cột trái - Ảnh đại diện */}
                <div className="col-md-4 text-center">
                  <div className="card border-0 shadow-sm p-3 rounded-4 h-100">
                    <img
                      // SỬA ĐỔI: Sử dụng hàm getImageUrl đã định nghĩa ở trên
                      src={getImageUrl(studentDetail.image)}
                      alt="Student Avatar"
                      className="rounded-circle mx-auto mb-3"
                      style={{
                        width: "130px",
                        height: "130px",
                        objectFit: "cover",
                        border: "3px solid #7494ec", // Sửa lại border cho rõ nét hơn
                      }}
                      // Thêm xử lý khi ảnh lỗi
                      onError={(e) => {
                        e.target.src = "https://cdn-icons-png.flaticon.com/512/847/847969.png";
                      }}
                    />
                    <h5>{studentDetail.fullName}</h5>
                    <p className="badge bg-primary text-white">
                      {studentDetail.roleName || "Học viên"}
                    </p>
                    <hr />
                    <div className="text-start small">
                      <p className="mb-2">
                        <strong><FiPhone /> SĐT:</strong>{" "}
                        {studentDetail.phoneNumber || "Chưa có"}
                      </p>
                      <p className="mb-2">
                        <strong><FiCalendar /> Ngày sinh:</strong>{" "}
                        {studentDetail.dateOfBirth || "Chưa có"}
                      </p>
                      <p className="mb-2">
                        <strong><FiUser /> Giới tính:</strong>{" "}
                        {studentDetail.gender ? "Nam" : "Nữ"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cột phải - Thông tin chi tiết */}
                <div className="col-md-8">
                  <div className="card border-0 shadow-sm rounded-4 p-3 mb-3">
                    <h6 style={{ color: "#7494ec", fontWeight: 600 }} className="border-bottom pb-2">
                      Thông tin chung
                    </h6>
                    <table className="table table-borderless mb-0">
                      <tbody>
                        <tr>
                          <td className="fw-bold w-25">Email:</td>
                          <td>{studentDetail.email}</td>
                        </tr>
                        <tr>
                          <td className="fw-bold">Trường:</td>
                          <td>{studentDetail.schoolName || "Chưa cập nhật"}</td>
                        </tr>
                        <tr>
                          <td className="fw-bold">Khối lớp:</td>
                          <td>{studentDetail.grade || "Chưa cập nhật"}</td>
                        </tr>
                        <tr>
                          <td className="fw-bold">Địa chỉ:</td>
                          <td>
                            {studentDetail.address ? (
                              <>
                                {studentDetail.address.details || ""},{" "}
                                {studentDetail.address.ward || ""},{" "}
                                {studentDetail.address.province || ""}
                              </>
                            ) : (
                              "Chưa cập nhật"
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <h6 style={{ color: "#7494ec", fontWeight: 600 }} className="border-bottom pb-2 mt-3">
                      Thông tin phụ huynh
                    </h6>
                    {studentDetail.parents && studentDetail.parents.length > 0 ? (
                      studentDetail.parents.map((p, idx) => (
                        <div key={idx} className="alert alert-light border p-2 mb-2">
                          <strong>{p.fullName}</strong> ({p.relationship || "Phụ huynh"}){" "}
                          <br />
                          <span className="text-success">
                            <FiPhone /> {p.phoneNumber}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted fst-italic">Chưa có thông tin phụ huynh</p>
                    )}
                  </div>

                  <div className="card border-0 shadow-sm rounded-4 p-3">
                    <h6 style={{ color: "#7494ec", fontWeight: 600 }} className="border-bottom pb-2">
                      Môn học đã đăng ký
                    </h6>
                    {studentDetail.subjects?.length > 0 ? (
                      <ul className="list-group list-group-flush">
                        {studentDetail.subjects.map((subj) => (
                          <li
                            key={subj.id}
                            className="list-group-item d-flex justify-content-between align-items-center"
                          >
                            <span>
                              <strong>{subj.name}</strong> – Lớp {subj.grade}
                            </span>
                            <span className="text-muted small">
                              {new Date(subj.enrollmentDate).toLocaleDateString("vi-VN")}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted fst-italic mb-0">Chưa đăng ký môn học nào.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center p-5">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-2">Đang tải thông tin...</p>
            </div>
          )}
        </CModalBody>

        <CModalFooter className="bg-white border-top-0">
          <CButton
            color="primary"
            size="sm"
            onClick={() => {
              setShowDetailModal(false);
              handleEdit(studentDetail);
            }}
          >
            <CIcon icon={cilPencil} className="me-1" /> Chỉnh sửa
          </CButton>
          <CButton color="secondary" size="sm" onClick={() => setShowDetailModal(false)}>
            Đóng
          </CButton>
        </CModalFooter>
      </CModal>

    </div>
  );
}
