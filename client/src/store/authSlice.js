// src/store/authSlice.js

import { createSlice } from '@reduxjs/toolkit'

const initialState = {
   user: JSON.parse(localStorage.getItem("user")) || null,
    isLoading: false, 
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Khi đăng nhập thành công
    loginSuccess: (state, action) => {
      state.user = action.payload;
      state.isLoading = false;
      localStorage.setItem("user", JSON.stringify(action.payload));
    },

    // Khi đăng xuất
    logout: (state) => {
      state.user = null;
      state.isLoading = false;
       localStorage.removeItem("user"); 
    },
    //  Set thủ công trạng thái loading
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    // Action mới để cập nhật user
    setUser: (state, action) => {
      state.user = action.payload;
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
  },
})

export const { loginSuccess, logout, setLoading, setUser } = authSlice.actions;
export default authSlice.reducer
