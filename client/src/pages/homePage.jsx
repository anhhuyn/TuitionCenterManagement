import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getAuthMe } from "../util/api.js";
import Layout from "../components/layout/Layout";

const HomePage = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:8088/v1/api/auth/me", {
          withCredentials: true, 
        });
        setUser(res.data.user); 
      } catch (err) {
        console.error("Token hết hạn hoặc không hợp lệ", err);
        navigate("/login"); 
      }
    };

    fetchUser();
  }, []);

  if (!user) return null; // Loading

 return (
    <Layout>
      {/* Đây là children, sẽ hiển thị trong <main> của Layout */}
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h1>Chào mừng, {user.fullName}</h1>
        <p>Email của bạn: {user.email}</p>
      </div>
    </Layout>
  );
};

export default HomePage;
