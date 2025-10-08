import React, { useEffect, useState, useRef } from "react";
import "../styles/Profile.css";
import Layout from "../components/layout/Layout";
import OtpModal from "../components/modal/OtpModal";
import ConfirmModal from "../components/modal/ConfirmModal";
import { useDispatch } from "react-redux";
import { setUser as setUserRedux } from "../store/authSlice";
import {
  cilPencil,
  cilUser,
  cilEnvelopeClosed,
  cilPhone,
  cilBirthdayCake,
  cilHome,
  cilBriefcase,
  cilWc,
} from "@coreui/icons";
import CIcon from "@coreui/icons-react";
import { getUserApi, updateProfileApi, updateImageApi } from "../util/api";
import SubmitButton from "../components/button/SubmitButton";

const ProfileCard = ({ icon, title, value, editable, onChange, type = "text" }) => (
  <div className="profile-card">
    <div className="profile-card-header">
      <CIcon icon={icon} className="profile-icon" />
      <h4>{title}</h4>
    </div>
    {editable ? (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="profile-input"
      />
    ) : (
      <p>{value}</p>
    )}
  </div>
);

const Profile = () => {
  const [user, setUser] = useState(null);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [isOtpModalVisible, setIsOtpModalVisible] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const fileInputRef = useRef(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [selectedImage, setSelectedImage] = useState(null);
  const [isConfirmImageModalVisible, setIsConfirmImageModalVisible] = useState(false);


  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getUserApi();

        if (res && res.user) {
          setUser(res.user);
        } else {
          setError("Không lấy được thông tin user");
        }
      } catch (err) {
        setError("Lỗi khi tải dữ liệu");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleEditCover = () => {
    if (!isEditing) {
      // Bắt đầu chỉnh sửa
      setFormData({
        fullName: user.fullName || user.name || "",
        email: user.email || "",
        gender: user.gender,
        phoneNumber: user.phoneNumber || "",
        address: user.address || "",
        roleId: user.roleId || "",
      });
    }
    setIsEditing(!isEditing); // Toggle chế độ edit
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpdate = async () => {
    try {
      const data = await updateProfileApi(formData);
      if (data.requireOtp) {
        // Yêu cầu nhập OTP để xác thực email mới
        setPendingEmail(formData.email);
        setIsOtpModalVisible(true);
      } else {
        setUser(data.user || data);
        setIsEditing(false);
      }
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || error.message || "Lỗi không xác định";
      alert("Cập nhật thất bại: " + msg);
    }
  };

  const handleOtpVerifySuccess = async () => {
    setIsOtpModalVisible(false);
    setIsEditing(false);
    setPendingEmail("");

    // Tải lại dữ liệu user mới nhất
    try {
      const res = await getUserApi();
      if (res.user) setUser(res.user);
    } catch (error) {
      console.error("Lỗi tải lại dữ liệu user sau khi verify OTP:", error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedImage(file); // Lưu file tạm
    setIsConfirmImageModalVisible(true); // Hiện modal xác nhận
  };

  const confirmUploadImage = async () => {
    if (!selectedImage) return;

    try {
      await updateImageApi(selectedImage);

      const res = await getUserApi();
      if (res && res.user) {
        setUser(res.user);
        dispatch(setUserRedux(res.user));
      }

      setSelectedImage(null);
      setIsConfirmImageModalVisible(false);
    } catch (err) {
      console.error("Lỗi khi tải ảnh:", err);
      alert("Tải ảnh thất bại. Vui lòng thử lại.");
    }
  };


  if (loading)
    return (
      <Layout>
        <p>Đang tải thông tin...</p>
      </Layout>
    );
  if (error)
    return (
      <Layout>
        <p>{error}</p>
      </Layout>
    );
  if (!user)
    return (
      <Layout>
        <p>Không có dữ liệu người dùng</p>
      </Layout>
    );

  const isManager = user.roleId === "R0";

  return (
    <Layout>
      {/* Cover */}
      <div className="profile-cover">
        <div className="profile-cover-header">
          <h2 className="profile-title">My Profile</h2>
          <button className="edit-cover-btn" onClick={handleEditCover}>
            <CIcon icon={cilPencil} size="lg" />
          </button>
        </div>

        {/* Avatar */}
        <div className="profile-avatar-container">
          <div className="profile-avatar">
            <img
              src={
                user.image
                  ? `${backendUrl}${user.image}`
                  : "https://bom.edu.vn/public/upload/2024/12/1avatar-meo-cute-1.webp"
              }
              alt="avatar"
            />
            <button
              className="upload-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              <CIcon icon={cilPencil} size="lg" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
          </div>

        </div>
      </div>

      {/* Thông tin */}
      <div className="profile-wrapper">
        {/* Cột trái */}
        <div className="profile-left">
          <ProfileCard
            icon={cilUser}
            title="Họ tên"
            value={isEditing ? formData.fullName : user.fullName || user.name || "Chưa có tên"}
            editable={isEditing}
            onChange={(val) => handleInputChange("fullName", val)}
          />

          <ProfileCard
            icon={cilEnvelopeClosed}
            title="Email"
            value={isEditing ? formData.email : user.email || "Chưa có email"}
            editable={isEditing}
            onChange={(val) => handleInputChange("email", val)}
          />

          <div className="profile-card">
            <div className="profile-card-header">
              <CIcon icon={cilWc} className="profile-icon" />
              <h4>Giới tính</h4>
            </div>
            {isEditing ? (
              <select
                className="profile-input"
                value={
                  formData.gender === true
                    ? "male"
                    : formData.gender === false
                      ? "female"
                      : "undefined"
                }
                onChange={(e) => {
                  const val = e.target.value;
                  handleInputChange(
                    "gender",
                    val === "male" ? true : val === "female" ? false : null
                  );
                }}
              >
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="undefined">Không xác định</option>
              </select>
            ) : (
              <p>
                {user.gender === true
                  ? "Nam"
                  : user.gender === false
                    ? "Nữ"
                    : "Chưa xác định"}
              </p>
            )}
          </div>


          {!isManager && (
            <ProfileCard
              icon={cilPhone}
              title="Số điện thoại"
              value={
                isEditing ? formData.phoneNumber : user.phoneNumber || "Chưa có số điện thoại"
              }
              editable={isEditing}
              onChange={(val) => handleInputChange("phoneNumber", val)}
            />
          )}
        </div>

        {/* Cột phải */}
        <div className="profile-right">
          <div className="profile-card">
            <div className="profile-card-header">
              <CIcon icon={cilBriefcase} className="profile-icon" />
              <h4>Chức vụ</h4>
            </div>
            {isEditing ? (
              <select
                className="profile-input"
                value={formData.roleId}
                onChange={(e) => handleInputChange("roleId", e.target.value)}
              >
                <option value="R0">Quản lý</option>
                <option value="R1">Giáo Viên</option>
                <option value="R2">Học sinh</option>
              </select>
            ) : (
              <p>
                {{
                  R0: "Quản lý",
                  R1: "Giáo Viên",
                  R2: "Học sinh",
                }[user.roleId] || "Chưa có vai trò"}
              </p>
            )}
          </div>


          {isManager ? (
            <ProfileCard
              icon={cilPhone}
              title="Số điện thoại"
              value={
                isEditing ? formData.phoneNumber : user.phoneNumber || "Chưa có số điện thoại"
              }
              editable={isEditing}
              onChange={(val) => handleInputChange("phoneNumber", val)}
            />
          ) : (
            <>
              <ProfileCard
                icon={cilHome}
                title="Địa chỉ"
                value={isEditing ? formData.address : user.address || "Chưa có địa chỉ"}
                editable={isEditing}
                onChange={(val) => handleInputChange("address", val)}
              />

              <ProfileCard
                icon={cilBirthdayCake}
                title="Ngày sinh"
                value={isEditing ? formData.dob : user.dob || "Chưa có ngày sinh"}
                editable={isEditing}
                onChange={(val) => handleInputChange("dob", val)}
                type="date"
              />
            </>
          )}
          {/* Nút cập nhật */}
          {isEditing && (
            <div style={{ textAlign: "center", margin: "20px" }}>
              <SubmitButton onClick={() => setIsConfirmVisible(true)}>
                Cập nhật
              </SubmitButton>
            </div>
          )}
        </div>

      </div>

      {/* Hiển thị modal OTP nếu cần */}
      {isOtpModalVisible && (
        <OtpModal
          email={pendingEmail}
          onVerifySuccess={handleOtpVerifySuccess}
          onClose={() => setIsOtpModalVisible(false)}
        />
      )}

      {isConfirmVisible && (
        <ConfirmModal
          title="Xác nhận cập nhật"
          message="Bạn có chắc chắn muốn lưu các thay đổi không?"
          cancelText="Hủy"
          confirmText="Xác nhận"
          onCancel={() => setIsConfirmVisible(false)}
          onConfirm={() => {
            setIsConfirmVisible(false);
            handleUpdate();
          }}
        />
      )}
      {isConfirmImageModalVisible && (
        <ConfirmModal
          title="Xác nhận cập nhật ảnh đại diện"
          message="Bạn có chắc chắn muốn thay đổi ảnh đại diện không?"
          cancelText="Hủy"
          confirmText="Xác nhận"
          onCancel={() => {
            setIsConfirmImageModalVisible(false);
            setSelectedImage(null);
          }}
          onConfirm={confirmUploadImage}
        />
      )}


    </Layout>
  );
};

export default Profile;
