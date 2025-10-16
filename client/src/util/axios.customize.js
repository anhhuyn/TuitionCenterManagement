import axios from 'axios';

// Set config defaults when creating the instance
const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true
});

// Alter defaults after instance has been created
// Add a request interceptor
instance.interceptors.request.use(function (config) {
  // Do something before request is sent
  //config.headers.Authorization = `Bearer ${localStorage.getItem("access_token")}`;
  return config;
}, function (error) {
  // Do something with request error
  return Promise.reject(error);
});

// Add a response interceptor
instance.interceptors.response.use(
  function (response) {
    if (response && response.data) return response.data;
    return response;
  },
  function (error) {
    // Giữ nguyên error để frontend catch được
    return Promise.reject(error);
  }
);


export default instance;
