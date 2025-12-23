import React from "react";
import {
  CAvatar,
  CBadge,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from "@coreui/react";
import {
  cilBell,
  cilCreditCard,
  cilCommentSquare,
  cilEnvelopeOpen,
  cilFile,
  cilLockLocked,
  cilTask,
  cilUser,
  cilAccountLogout,
} from "@coreui/icons";
import CIcon from "@coreui/icons-react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

import avatar8 from "../../../assets/images/avatars/8.jpg";
import { logout } from "../../../store/authSlice"; // Redux action

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const AppHeaderDropdown = () => {
  const user = useSelector((state) => state.auth.user);
  const isLoading = useSelector((state) => state.auth.isLoading);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 🧩 Xử lý Logout
  const handleLogout = async () => {
    try {
      // Gọi API logout để xóa cookie token
      await axios.post(
        `http://localhost:8088/v1/api/logout`,
        {},
        { withCredentials: true } // ✅ phải có để gửi cookie
      );

      // Xóa thông tin user trong Redux
      dispatch(logout());

      // Điều hướng về trang login
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("❌ Lỗi khi logout:", error);
      // Dù có lỗi vẫn clear client state
      dispatch(logout());
      navigate("/login", { replace: true });
    }
  };

  if (isLoading || !user) return null;

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
        <CAvatar src={user?.image ? `${backendUrl}${user.image}` : avatar8} size="md" />
      </CDropdownToggle>

      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownHeader className="bg-body-secondary fw-semibold mb-2">
          {user?.fullName}
        </CDropdownHeader>


        <CDropdownItem>
          <Link
            to="/admin/profile"
            className="d-flex align-items-center"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <CIcon icon={cilUser} className="me-2" />
            Thông tin tài khoản
          </Link>
        </CDropdownItem>

        <CDropdownItem>
          <Link
            to="/forgot-password"
            state={{ mode: "change" }}
            className="d-flex align-items-center"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <CIcon icon={cilLockLocked} className="me-2" />
            Đổi mật khẩu
          </Link>
        </CDropdownItem>

        <CDropdownDivider />

        {/* --- Đăng xuất --- */}
        <CDropdownItem onClick={handleLogout} style={{ cursor: "pointer" }}>
          <CIcon icon={cilAccountLogout} className="me-2" />
          Đăng xuất
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  );
};

export default AppHeaderDropdown;
