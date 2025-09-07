// src/store/store.js
import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice' // ✅ Đường dẫn đúng

const uiInitialState = {
  sidebarShow: true,
  sidebarUnfoldable: false,
  theme: 'light',
}

const uiReducer = (state = uiInitialState, action) => {
  switch (action.type) {
    case 'set':
      return { ...state, ...action.payload }
    default:
      return state
  }
}

const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
  },
})

export default store