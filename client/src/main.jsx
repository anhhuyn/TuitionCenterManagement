// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/global.css'
import { AuthWrapper } from './components/context/auth.context.jsx'
//import '@coreui/coreui/dist/css/coreui.min.css'

// 🟢 Thêm các dòng sau:
import { Provider } from 'react-redux'
import store from './store/store.js'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>        {/* 🟢 Bọc App trong Provider */}
      <AuthWrapper>
        <App />
      </AuthWrapper>
    </Provider>
  </React.StrictMode>
)
