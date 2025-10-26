import React, { useEffect, useState } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

const ProtectedRoute = ({ children }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const res = await axios.get("http://localhost:8088/v1/api/auth/me", {
          withCredentials: true,
        });
        if (res.data?.user) {
          dispatch({ type: "auth/setUser", payload: res.data.user });
          setAuthorized(true);
        } else {
          setAuthorized(false);
        }
      } catch (err) {
        console.warn("Token không hợp lệ hoặc hết hạn:", err);
        localStorage.removeItem("token");
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    if (!user) verifyUser();
    else {
      setAuthorized(true);
      setLoading(false);
    }
  }, [user]);

  if (loading) return null; // hoặc spinner loading

  return authorized ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
