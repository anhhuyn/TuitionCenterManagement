import { createContext, useState } from 'react';

// Tạo một Context với giá trị mặc định
export const AuthContext = createContext({
  isAuthenticated: false,
  user: {
    email: "",
    name: ""
  },
  appLoading: true,
});

export const AuthWrapper = (props) => {
  // Khai báo state để lưu trạng thái xác thực và thông tin user
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    user: {
      email: "",
      name: ""
    }
  });

  // State để quản lý trạng thái load của ứng dụng
  const [appLoading, setAppLoading] = useState(true);

  return (
    // Cung cấp các giá trị auth, setAuth, appLoading, setAppLoading cho các component con có thể dùng
    <AuthContext.Provider value={{
      auth, setAuth, appLoading, setAppLoading
    }}>
      {props.children}
    </AuthContext.Provider>
  );
}
