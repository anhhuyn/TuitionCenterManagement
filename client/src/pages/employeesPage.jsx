// src/views/employees/Employees.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../styles/CustomerTable.css";
import { CIcon } from "@coreui/icons-react";
import {
  cilFilter,
  cilSpreadsheet,
  cilPencil,
  cilTrash,
  cilSearch,
  cilCloudUpload,
  cilUser,
} from "@coreui/icons";
import FilterPanel from "../components/modal/FilterPanel.jsx";
import "../components/modal/SearchBox.css";
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

const TeacherManagement = () => {
  const [teachers, setTeachers] = useState([]);
  // Sắp xếp theo tên (true = A→Z, false = Z→A)
  const [sortAsc, setSortAsc] = useState(true);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //mới thêm
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10); // số nhân viên mỗi trang
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });

  // state filter gửi lên backend
  const [filters, setFilters] = useState({
    name: "",
    gender: "",
    specialty: ""
  });


  // search & filter
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const filterRef = useRef(null);

  // modal thêm/sửa nhân viên
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // modal xem chi tiết
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailEmployee, setDetailEmployee] = useState(null);

  const [newEmployee, setNewEmployee] = useState({
    email: "",
    password: "",
    fullName: "",
    phoneNumber: "",
    gender: true,
    image: null,
    roleId: "R1",
    dateOfBirth: "",
    specialty: "",
    address: {
      details: "",
      ward: "",
      province: "",
    },
  });

// fetch dữ liệu
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true); // Đặt loading true khi bắt đầu
        
        // Tạo params chuẩn để loại bỏ các giá trị null/undefined/rỗng
        const params = new URLSearchParams();
        params.append("page", page);
        params.append("limit", limit);
        
        if (filters.name) params.append("name", filters.name);
        if (filters.gender) params.append("gender", filters.gender);
        
        // Chỉ append chuyên môn nếu có giá trị
        if (filters.specialty) params.append("specialty", filters.specialty);

        // Gọi API với params đã xử lý
        const response = await axios.get(
          `http://localhost:8088/v1/api/teachers?${params.toString()}`
        );

        if (response.data.errCode === 0) {
          setTeachers(response.data.data);
          setPagination(response.data.pagination);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        console.error("Fetch error:", err); // Log lỗi ra console để debug
        setError("Không thể kết nối đến server.");
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, [page, limit, filters]); // Giữ nguyên dependency

  // click ngoài filter -> đóng panel
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

  // checkbox select
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelected(teachers.map((t) => t.id));
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
// 👇 1. Thêm hàm xử lý ảnh (để hiển thị ảnh từ localhost)
const getImageUrl = (imagePath) => {
  if (!imagePath) return "https://cdn-icons-png.flaticon.com/512/847/847969.png";
  if (imagePath.startsWith("http")) return imagePath;
  return `http://localhost:8088/${imagePath}`;
};

// 👇 2. Thêm hàm click vào dòng (để mở modal chi tiết)
const handleRowClick = (teacher) => {
  setDetailEmployee(teacher);
  setShowDetailModal(true);
};
  // Hàm tách họ, tên lót, tên
  const splitNameParts = (fullName = "") => {
    const parts = fullName.trim().split(/\s+/);
    const name = parts[parts.length - 1] || ""; // tên cuối
    const middle = parts.slice(1, parts.length - 1).join(" "); // tên lót
    const last = parts[0] || ""; // họ
    return { name, middle, last };
  };

  // filter theo search
  const filteredTeachers = teachers
    .filter(
      (t) =>
        t.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        t.email?.toLowerCase().includes(search.toLowerCase()) ||
        t.phoneNumber?.includes(search)
    )
    .sort((a, b) => {
      const nameA = splitNameParts(a.fullName);
      const nameB = splitNameParts(b.fullName);

      const compare =
        nameA.name.localeCompare(nameB.name, "vi", { sensitivity: "base" }) ||
        nameA.middle.localeCompare(nameB.middle, "vi", { sensitivity: "base" }) ||
        nameA.last.localeCompare(nameB.last, "vi", { sensitivity: "base" });

      // Nếu sortAsc = true → A-Z, ngược lại Z-A
      return sortAsc ? compare : -compare;
    });


  // handle modal form
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (["details", "ward", "province"].includes(name)) {
      // xử lý riêng cho address
      setNewEmployee({
        ...newEmployee,
        address: { ...newEmployee.address, [name]: value },
      });
    } else if (name === "gender") {
      // gender: convert string "true"/"false" -> boolean
      setNewEmployee({
        ...newEmployee,
        gender: value === "true",
      });
    } else if (name === "roleId") {
      // roleId giữ nguyên string
      setNewEmployee({
        ...newEmployee,
        roleId: value,
      });
    } else {
      // các field khác
      setNewEmployee({ ...newEmployee, [name]: value });
    }
  };


  const handleImageChange = (e) => {
    setNewEmployee({ ...newEmployee, image: e.target.files[0] });
  };

  // mở modal sửa nhân viên
  const handleEdit = async (teacher) => {
    setEditMode(true);
    setCurrentId(teacher.id);
    setNewEmployee({
      ...teacher,
      password: "",
      address: teacher.address || { details: "", ward: "", province: "" },
    });
    setShowModal(true);

    await fetchProvinces();
    if (teacher.address?.province) {
      await fetchWardsByProvince(teacher.address.province);
    }
  };

  // mở modal thêm mới
  const handleAdd = () => {
    setEditMode(false);
    setCurrentId(null);
    setNewEmployee({
      email: "",
      password: "",
      fullName: "",
      phoneNumber: "",
      gender: true,
      image: null,
      roleId: "R1",
      dateOfBirth: "",
      specialty: "",
      address: { details: "", ward: "", province: "" },
    });
    setShowModal(true);
    fetchProvinces();
  };

  const handleSubmit = async () => {
  try {
    const formData = new FormData();
    
    // 1. Append các trường cơ bản
    formData.append("fullName", newEmployee.fullName);
    formData.append("email", newEmployee.email);
    formData.append("phoneNumber", newEmployee.phoneNumber);
    formData.append("specialty", newEmployee.specialty);
    formData.append("gender", newEmployee.gender);
    formData.append("dateOfBirth", newEmployee.dateOfBirth || "");
    formData.append("roleId", "R1"); // Role Teacher
    
    // Gửi password nếu có nhập (hoặc backend tự set default)
    if (newEmployee.password) {
        formData.append("password", newEmployee.password);
    } else if (!editMode) {
        formData.append("password", "123456"); // Default cho tạo mới
    }

    // 2. SỬA QUAN TRỌNG: Append Address dùng dấu chấm (.)
    if (newEmployee.address) {
      formData.append("address.details", newEmployee.address.details || "");
      formData.append("address.ward", newEmployee.address.ward || "");
      formData.append("address.province", newEmployee.address.province || "");
    }

    // 3. Append Image
    if (newEmployee.image instanceof File) {
      formData.append("file", newEmployee.image);
    }

    // --- GỌI API (Sửa URL thành /teachers) ---
    let response;
    if (editMode && currentId) {
      response = await axios.put(
        `http://localhost:8088/v1/api/teachers/${currentId}`, // SỬA
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
    } else {
      response = await axios.post(
        "http://localhost:8088/v1/api/teachers", // SỬA
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
    }

    if (response.data.errCode === 0) {
      alert(editMode ? "Cập nhật thành công!" : "Thêm thành công!");
      
      // Load lại danh sách
      const refreshed = await axios.get(
        `http://localhost:8088/v1/api/teachers?page=${page}&limit=${limit}` // SỬA
      );
      if (refreshed.data.errCode === 0) {
        setTeachers(refreshed.data.data);
      }
      setShowModal(false);
    } else {
      alert(response.data.message);
    }

  } catch (err) {
    console.error(err);
    alert("Có lỗi xảy ra!");
  }
};
  // Xóa nhân viên
const handleDelete = async (id) => {
  if (!window.confirm("Bạn có chắc chắn muốn xóa?")) return;
  try {
    // SỬA: /employees -> /teachers
    const response = await axios.delete(`http://localhost:8088/v1/api/teachers/${id}`);
    if (response.data.errCode === 0) {
      alert("Xóa thành công!");
      setTeachers(teachers.filter((t) => t.id !== id));
      setSelected(selected.filter((s) => s !== id));
    } else {
      alert(response.data.message);
    }
  } catch (err) {
    alert("Lỗi khi xóa!");
  }
};

// Xóa nhiều
const handleDeleteMultiple = async () => {
  if (selected.length === 0) return alert("Vui lòng chọn nhân viên!");
  if (!window.confirm(`Xóa ${selected.length} nhân viên đã chọn?`)) return;

  try {
    // SỬA: /employees -> /teachers
    const response = await axios.post(
      "http://localhost:8088/v1/api/teachers/delete-multiple",
      { ids: selected }
    );

    if (response.data.errCode === 0) {
      alert(response.data.message);
      setTeachers(teachers.filter((t) => !selected.includes(t.id)));
      setSelected([]);
    } else {
      alert(response.data.message);
    }
  } catch (error) {
    alert("Lỗi khi xóa nhiều!");
  }
};

  const handleExportExcel = async () => {
    try {
      // SỬA: URL đúng là /teachers/export (không có /excel)
      const res = await axios.get("http://localhost:8088/v1/api/teachers/export", {
        params: {
          name: filters.name || undefined,
          specialty: filters.specialty || undefined,
          gender: filters.gender || undefined,
        },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Danh_sach_giao_vien_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert("⚠️ Xuất Excel thất bại!");
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

  


  return (
    <>
      <div className="table-container">
        {/* Thanh trên */}
        <div className="top-bar">
          <div className="left-tools">
            <div className="filter-wrapper" ref={filterRef}>
              <button
                className="btn-filter"
                onClick={() => setShowFilter(!showFilter)}
              >
                <CIcon icon={cilFilter} />
              </button>
              {showFilter && (
                <div className="filter-panel-container">
                  <FilterPanel
                    type="employee"
                    filters={filters}
                    onChange={(newFilters) => {
                      setFilters(newFilters);
                      setPage(1); // reset về trang 1 khi filter thay đổi
                    }}
                  />
                </div>
              )}
            </div>


            <div className="search-wrapper">
              
              <input
                type="text"
                placeholder="Tra cứu nhân viên"
                className="search-box"
                value={filters.name}
                onChange={(e) => {
                  setFilters({ ...filters, name: e.target.value });
                  setPage(1);
                }}
              />
            </div>

          </div>

          <div className="right-tools">
            <button className="btn-excel" onClick={handleExportExcel}>
              <CIcon icon={cilSpreadsheet} /> Xuất Excel
            </button>
            <button
              className={`btn-delete-all ${selected.length > 0 ? "active" : "disabled"}`}
              onClick={handleDeleteMultiple}
              disabled={selected.length === 0}
            >
              <CIcon icon={cilTrash} /> Xóa tất cả
            </button>

            <button className="btn-add" onClick={handleAdd}>
              + Thêm nhân viên
            </button>
          </div>
        </div>

        {/* Bảng */}
        <table className="customer-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  className="custom-checkbox"
                  checked={selected.length === teachers.length}
                  onChange={handleSelectAll}
                />
              </th>

              <th
                style={{ cursor: "pointer", userSelect: "none" }}
                onClick={() => setSortAsc(!sortAsc)}
              >
                Họ và Tên {sortAsc ? "▲" : "▼"}
              </th>
              <th>Email</th>
              <th>Số điện thoại</th>
              <th>Giới tính</th>
              <th>Ngày sinh</th>
              <th>Chuyên môn</th>
              <th>Vai trò</th>
              <th>Chức năng</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="10" className="text-center">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="10" className="text-center text-danger">
                  {error}
                </td>
              </tr>
            ) : filteredTeachers.length > 0 ? (
              filteredTeachers.map((teacher) => (
                <tr
                  key={teacher.id}
                  onClick={(e) => {
                    // tránh click vào checkbox hoặc nút chức năng bị trigger row click
                    if (
                      e.target.closest("button") ||
                      e.target.closest("input[type='checkbox']")
                    ) return;
                    handleRowClick(teacher);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <td>
                    <input
                      type="checkbox"
                      className="custom-checkbox"
                      checked={selected.includes(teacher.id)}
                      onChange={() => handleSelectRow(teacher.id)}
                    />
                  </td>
                  <td>{teacher.fullName}</td>
                  <td>{teacher.email}</td>
                  <td>{teacher.phoneNumber}</td>
                  <td>{teacher.gender ? "Nam" : "Nữ"}</td>
                  <td>{teacher.dateOfBirth}</td>
                  <td>{teacher.specialty}</td>
                  <td>{teacher.roleName}</td>
                  <td className="action-cell">
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(teacher)}
                    >
                      <CIcon icon={cilPencil} />
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(teacher.id)}
                    >
                      <CIcon icon={cilTrash} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="text-center">
                  Không có dữ liệu nhân viên.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {/* Phân trang */}
        {pagination && (
          <div className="pagination">
            {/* Nút trái */}
            <button
              className="arrow"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
            >
              &lt;
            </button>

            {/* Render số trang */}
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter((p) => {
                if (pagination.totalPages <= 5) return true; // nếu tổng trang <= 5 thì hiện hết
                if (p === 1 || p === pagination.totalPages) return true; // luôn hiện trang đầu + cuối
                if (p >= page - 1 && p <= page + 1) return true; // hiện trang xung quanh current
                return false;
              })
              .map((p, idx, arr) => {
                const prev = arr[idx - 1];
                return (
                  <React.Fragment key={p}>
                    {/* Chèn dấu ... nếu bị nhảy cách */}
                    {prev && p - prev > 1 && <span className="dots">...</span>}
                    <button
                      className={`page-btn ${page === p ? "active" : ""}`}
                      onClick={() => setPage(p)}
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
                setPage((prev) => Math.min(prev + 1, pagination.totalPages))
              }
              disabled={page === pagination.totalPages}
            >
              &gt;
            </button>
          </div>

        )}

      </div>

      {/* Modal thêm/sửa nhân viên */}
      <CModal visible={showModal} onClose={() => setShowModal(false)} size="lg">
        <CModalHeader>
          <CModalTitle>
            {editMode ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="row">
            {/* Cột trái: Ảnh đại diện */}
            <div className="col-md-3 d-flex flex-column align-items-center">
              <label className="fw-bold mb-2">Ảnh đại diện</label>
              <div className="avatar-upload border rounded-circle d-flex align-items-center justify-content-center mb-2" style={{ width: "120px", height: "120px", overflow: "hidden" }}>
                {newEmployee.image ? (
                  <img
                    src={
                      typeof newEmployee.image === "string"
                        ? `${import.meta.env.VITE_BACKEND_URL}/${newEmployee.image}`
                        : URL.createObjectURL(newEmployee.image)
                    }
                    alt="Avatar"
                    className="w-100 h-100"
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <div className="text-muted small text-center">Chưa có ảnh</div>
                )}
              </div>
              <input
                type="file"
                name="image"
                className="form-control"
                onChange={handleImageChange}
              />
            </div>

            {/* Cột phải: Thông tin */}
            <div className="col-md-9">
              {/* Thông tin cơ bản */}
              <h6 className="fw-bold text-primary mt-2">Thông tin cơ bản</h6>
              <div className="row">
                <div className="col-md-6">
                  <CFormInput
                    required
                    name="fullName"
                    label="Họ và tên"
                    value={newEmployee.fullName}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6">
                  <CFormInput
                    required
                    name="email"
                    label="Email"
                    value={newEmployee.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6">
                  <CFormInput
                    name="phoneNumber"
                    label="Số điện thoại"
                    value={newEmployee.phoneNumber}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6">
                  <CFormInput
                    type="date"
                    name="dateOfBirth"
                    label="Ngày sinh"
                    value={newEmployee.dateOfBirth}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6">
                  <CFormSelect
                    name="gender"
                    label="Giới tính"
                    value={newEmployee.gender?.toString()}
                    onChange={handleChange}
                  >
                    <option value="true">Nam</option>
                    <option value="false">Nữ</option>
                  </CFormSelect>
                </div>
                <div className="col-md-6">
                  <CFormInput
                    type="password"
                    name="password"
                    label="Mật khẩu"
                    value={newEmployee.password}
                    onChange={handleChange}
                    placeholder={editMode ? "Để trống nếu không đổi" : ""}
                  />
                </div>
              </div>

              {/* Địa chỉ */}
              <h6 className="fw-bold text-primary mt-3">Địa chỉ</h6>
              <div className="row">
                <div className="col-md-12">
                  <CFormInput
                    name="details"
                    label="Địa chỉ chi tiết"
                    value={newEmployee.address.details}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6">
                  <CFormSelect
                    name="province"
                    label="Tỉnh/Thành phố"
                    value={newEmployee.address.province}
                    onChange={(e) => {
                      const province = e.target.value;
                      setNewEmployee({
                        ...newEmployee,
                        address: { ...newEmployee.address, province, ward: "" },
                      });
                      fetchWardsByProvince(province);
                    }}
                  >
                    <option value="">-- Chọn tỉnh/thành phố --</option>
                    {provinces.map((p) => (
                      <option key={p.id} value={p.province}>{p.province}</option>
                    ))}
                  </CFormSelect>
                </div>
                <div className="col-md-6">
                  <CFormSelect
                    name="ward"
                    label="Phường/Xã"
                    value={newEmployee.address.ward}
                    onChange={(e) =>
                      setNewEmployee({
                        ...newEmployee,
                        address: { ...newEmployee.address, ward: e.target.value },
                      })
                    }
                  >
                    <option value="">-- Chọn phường/xã --</option>
                    {wards.map((w, i) => (
                      <option key={i} value={w.name}>{w.name}</option>
                    ))}
                  </CFormSelect>
                </div>
              </div>

              {/* Chuyên môn & Vai trò */}
              <h6 className="fw-bold text-primary mt-3">Thông tin công việc</h6>
              <div className="row">
                <div className="col-md-6">
                  <CFormInput
                    name="specialty"
                    label="Chuyên môn"
                    value={newEmployee.specialty}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6">
                  <CFormSelect
                    name="roleId"
                    label="Vai trò"
                    value={newEmployee.roleId}
                    onChange={handleChange}
                  >
                    <option value="R0">Admin</option>
                    <option value="R1">Teacher</option>
                    <option value="R2">Student</option>
                  </CFormSelect>
                </div>
              </div>
            </div>
          </div>
        </CModalBody>

        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowModal(false)}>
            Hủy
          </CButton>
          <CButton color="primary" onClick={handleSubmit}>
            {editMode ? "Cập nhật" : "Lưu"}
          </CButton>
        </CModalFooter>
      </CModal>

      <CModal
        visible={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        size="lg"
        alignment="center"
        className="employee-detail-modal"
      >
        <CModalHeader className="custom-modal-header">
          <CModalTitle>Thông tin chi tiết nhân viên</CModalTitle>
        </CModalHeader>

        <CModalBody className="bg-light">
          {detailEmployee ? (
            <div className="p-4">
              <div className="row g-4">
                {/* Cột trái - Ảnh và thông tin cơ bản */}
                <div className="col-md-4 text-center">
                  <div className="card shadow-sm border-0 rounded-4 p-3">
                    <img
                      src={
                        detailEmployee.image
                          ? `${import.meta.env.VITE_BACKEND_URL}/${detailEmployee.image}`
                          : "https://cdn-icons-png.flaticon.com/512/847/847969.png"
                      }
                      alt={detailEmployee.fullName}
                      className="rounded-circle mx-auto mb-3"
                      style={{
                        width: "140px",
                        height: "140px",
                        objectFit: "cover",
                        border: "0px solid #7494ec",
                      }}
                    />
                    <h5 >
                      {detailEmployee.fullName}
                    </h5>
                    <p className="text-muted small">
                      {detailEmployee.roleName || "Nhân viên"}
                    </p>
                  </div>
                </div>

                {/* Cột phải - Thông tin chi tiết */}
                <div className="col-md-8">
                  {/* Thông tin cá nhân */}
                  <div className="card shadow-sm border-0 rounded-4 p-3 mb-3">
                     <h6 style={{ color: '#7494ec', fontWeight: 600 }}>Thông tin cá nhân</h6>
                    <div className="row mb-2">
                      <div className="col-sm-6">
                        <strong>Email:</strong> {detailEmployee.email || "—"}
                      </div>
                      <div className="col-sm-6">
                        <strong>SĐT:</strong> {detailEmployee.phoneNumber || "—"}
                      </div>
                    </div>
                    <div className="row mb-2">
                      <div className="col-sm-6">
                        <strong>Ngày sinh:</strong> {detailEmployee.dateOfBirth || "—"}
                      </div>
                      <div className="col-sm-6">
                        <strong>Giới tính:</strong>{" "}
                        {detailEmployee.gender ? "Nam" : "Nữ"}
                      </div>
                    </div>
                    <div className="mb-2">
                      <strong>Địa chỉ:</strong>{" "}
                      {detailEmployee.address
                        ? `${detailEmployee.address.details}, ${detailEmployee.address.ward}, ${detailEmployee.address.province}`
                        : "—"}
                    </div>
                  </div>

                  {/* Chuyên môn */}
                  <div className="card shadow-sm border-0 rounded-4 p-3">
                    <h6 style={{ color: '#7494ec', fontWeight: 600 }}>Chuyên môn</h6>
                    <p className="mb-0">
                      {detailEmployee.specialty ? (
                        <span>{detailEmployee.specialty}</span>
                      ) : (
                        <span className="text-muted fst-italic">
                          Chưa có thông tin chuyên môn
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p>Đang tải thông tin...</p>
          )}
        </CModalBody>

        <CModalFooter className="bg-white border-top-0">
          <CButton style={{ backgroundColor: '#7494ec', borderColor: '#7494ec', color: 'white' }} size="sm"
            color="success"
            variant="outline"
            onClick={() => {
              setShowDetailModal(false);
              handleEdit(detailEmployee);
            }}
          >
            Chỉnh sửa
          </CButton>
          <CButton style={{ backgroundColor: '#89898aff', borderColor: '#7494ec', color: 'white' }} size="sm" onClick={() => setShowDetailModal(false)}>
            Đóng
          </CButton>
        </CModalFooter>
      </CModal>




    </>
  );
};

export default TeacherManagement;
