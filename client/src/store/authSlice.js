// src/store/authSlice.js

import { createSlice } from '@reduxjs/toolkit'

const initialState = {
   user: JSON.parse(localStorage.getItem("user")) || null,
    isLoading: true, 
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // ✅ Khi đăng nhập thành công
    loginSuccess: (state, action) => {
      state.user = action.payload;
      state.isLoading = false;
      localStorage.setItem("user", JSON.stringify(action.payload));
    },

    // ✅ Khi đăng xuất
    logout: (state) => {
      state.user = null;
      state.isLoading = false;
       localStorage.removeItem("user"); 
    },
    // ✅ Set thủ công trạng thái loading
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
})

// 👉 Export action để sử dụng trong component
export const { loginSuccess, logout, setLoading } = authSlice.actions;

// 👉 Export reducer để kết hợp vào store
export default authSlice.reducer
