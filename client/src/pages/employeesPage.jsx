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
import Layout from "../components/layout/Layout";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        const response = await axios.get(
          "http://localhost:8088/v1/api/employees"
        );
        if (response.data.errCode === 0) {
          setTeachers(response.data.data);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        setError("Không thể kết nối đến server. Vui lòng thử lại sau.");
        console.error("Lỗi khi fetch data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

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

  // filter theo search
  const filteredTeachers = teachers.filter(
    (t) =>
      t.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      t.email?.toLowerCase().includes(search.toLowerCase()) ||
      t.phoneNumber?.includes(search)
  );

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
  const handleEdit = (teacher) => {
    setEditMode(true);
    setCurrentId(teacher.id);
    setNewEmployee({
      ...teacher,
      password: "", // không hiển thị mật khẩu cũ
      address: teacher.address || { details: "", ward: "", province: "" },
    });
    setShowModal(true);
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
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      Object.keys(newEmployee).forEach((key) => {
        if (key === "address") {
          Object.keys(newEmployee.address).forEach((addrKey) => {
            formData.append(`address[${addrKey}]`, newEmployee.address[addrKey]);
          });
        } else {
          formData.append(key, newEmployee[key]);
        }
      });

      let response;
      if (editMode && currentId) {
        response = await axios.put(
          `http://localhost:8088/v1/api/employees/${currentId}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      } else {
        response = await axios.post(
          "http://localhost:8088/v1/api/employees",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      }

    if (response.data.errCode === 0) {
      alert(editMode ? "Cập nhật nhân viên thành công!" : "Thêm nhân viên thành công!");

      // ✅ Refetch lại toàn bộ danh sách từ backend
      const refreshed = await axios.get("http://localhost:8088/v1/api/employees");
      if (refreshed.data.errCode === 0) {
        setTeachers(refreshed.data.data);
      }

      setShowModal(false);
    } else {
      alert(response.data.message);
    }

    } catch (err) {
      alert("Có lỗi xảy ra khi lưu nhân viên!");
      console.error(err);
    }
  };
// Xóa nhân viên
const handleDelete = async (id) => {
  if (!window.confirm("Bạn có chắc chắn muốn xóa nhân viên này không?")) return;

  try {
    const response = await axios.delete(`http://localhost:8088/v1/api/employees/${id}`);
    if (response.data.errCode === 0) {
      alert("Xóa nhân viên thành công!");
      // Cập nhật lại state teachers và selected
      setTeachers(teachers.filter((t) => t.id !== id));
      setSelected(selected.filter((s) => s !== id));
    } else {
      alert(response.data.message);
    }
  } catch (err) {
    console.error(err);
    alert("Có lỗi xảy ra khi xóa nhân viên!");
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
              {showFilter && <FilterPanel />}
            </div>

            <div className="search-wrapper">
              <CIcon icon={cilSearch} className="search-icon" />
              <input
                type="text"
                placeholder="Tra cứu nhân viên"
                className="search-box"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="right-tools">
            <button className="btn-excel">
              <CIcon icon={cilSpreadsheet} /> Xuất Excel
            </button>
            <button className="btn-import">
              <CIcon icon={cilCloudUpload} /> Import
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
              <th>Hình ảnh</th>
              <th>Họ và Tên</th>
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
                <tr key={teacher.id}>
                  <td>
                    <input
                      type="checkbox"
                      className="custom-checkbox"
                      checked={selected.includes(teacher.id)}
                      onChange={() => handleSelectRow(teacher.id)}
                    />
                  </td>
                  <td className="product-cell">
                    {teacher.image ? (
                      <img
                        src={`${import.meta.env.VITE_BACKEND_URL}/${teacher.image}`}
                        alt={teacher.fullName}
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <CIcon icon={cilUser} size="lg" />
                    )}
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
                      className="btn-detail"
                      onClick={() => {
                        setDetailEmployee(teacher);
                        setShowDetailModal(true);
                      }}
                    >
                      <CIcon icon={cilUser} />
                    </button>
                    <button className="btn-edit" onClick={() => handleEdit(teacher)}>
                      <CIcon icon={cilPencil} />
                    </button>
                    <button className="btn-delete" onClick={() => handleDelete(teacher.id)}>
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
      </div>

      {/* Modal thêm/sửa nhân viên */}
      <CModal visible={showModal} onClose={() => setShowModal(false)} size="lg">
        <CModalHeader>
          <CModalTitle>
            {editMode ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm className="row g-3">
            {/* Hình đại diện */}
            <div className="col-12 mb-3">
              <label className="form-label">Hình đại diện</label>
              <input
                type="file"
                name="image"
                className="form-control"
                onChange={handleImageChange}
              />
            </div>

            {/* Họ tên & Email */}
            <div className="col-md-6">
              <CFormInput
                required
                name="fullName"
                label="Họ tên"
                value={newEmployee.fullName}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6">
              <CFormInput
                required
                name="email"
                label="Địa chỉ Email"
                value={newEmployee.email}
                onChange={handleChange}
              />
            </div>

            {/* SĐT & Mật khẩu */}
            <div className="col-md-6">
              <CFormInput
                required
                name="phoneNumber"
                label="Số điện thoại"
                value={newEmployee.phoneNumber}
                onChange={handleChange}
              />
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

            {/* Ngày sinh & Giới tính */}
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
                value={newEmployee.gender?.toString()}   // ép thành "true"/"false"
                onChange={handleChange}
              >
                <option value="true">Nam</option>
                <option value="false">Nữ</option>
              </CFormSelect>

            </div>

            {/* Chuyên môn & Vai trò */}
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

            {/* Địa chỉ */}
            <div className="col-12">
              <h6>Địa chỉ</h6>
            </div>
            <div className="col-md-12">
              <CFormInput
                name="details"
                label="Địa chỉ chi tiết"
                value={newEmployee.address.details}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6">
              <CFormInput
                name="ward"
                label="Phường/Xã"
                value={newEmployee.address.ward}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6">
              <CFormInput
                name="province"
                label="Tỉnh/Thành phố"
                value={newEmployee.address.province}
                onChange={handleChange}
              />
            </div>
          </CForm>
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
>
  <CModalHeader>
    <CModalTitle>Chi tiết nhân viên</CModalTitle>
  </CModalHeader>
  <CModalBody>
    {detailEmployee && (
      <div className="cv-detail">
        {/* Bố cục 2 cột */}
        <div className="cv-left">
          {detailEmployee.image ? (
            <img
              src={`${import.meta.env.VITE_BACKEND_URL}/${detailEmployee.image}`}
              alt={detailEmployee.fullName}
              className="cv-avatar"
            />
          ) : (
            <div className="cv-avatar-placeholder">No Image</div>
          )}

          <h4>{detailEmployee.fullName}</h4>
          <p><b>Email:</b> {detailEmployee.email}</p>
          <p><b>SĐT:</b> {detailEmployee.phoneNumber}</p>
          <p><b>Vai trò:</b> {detailEmployee.roleName}</p>
        </div>

        <div className="cv-right">
          <div className="detail-section">
            <h6>Thông tin cá nhân</h6>
            <p><b>Ngày sinh:</b> {detailEmployee.dateOfBirth}</p>
            <p><b>Giới tính:</b> {detailEmployee.gender ? "Nam" : "Nữ"}</p>
            <p>
              <b>Địa chỉ:</b> {detailEmployee.address?.details},{" "}
              {detailEmployee.address?.ward},{" "}
              {detailEmployee.address?.province}
            </p>
          </div>

          <div className="detail-section">
            <h6>Chuyên môn</h6>
            <p>{detailEmployee.specialty || "—"}</p>
          </div>
        </div>
      </div>
    )}
  </CModalBody>
  <CModalFooter>
    <CButton
      color="primary"
      onClick={() => {
        setShowDetailModal(false);
        handleEdit(detailEmployee);
      }}
    >
      Chỉnh sửa
    </CButton>
    <CButton color="secondary" onClick={() => setShowDetailModal(false)}>
      Đóng
    </CButton>
  </CModalFooter>
</CModal>




    </>
  );
};

export default TeacherManagement;
