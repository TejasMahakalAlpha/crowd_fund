// src/admin/Login.jsx
import React, { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API, { AdminApi } from "../services/api";

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setError("");
  //   try {
  //     // const res = await axios.post(
  //     //   `${import.meta.env.VITE_API_BASE_URL}/api/admin/login`,
  //     //   formData,
  //     //   { headers: { "Content-Type": "application/json" } }
  //     // );
  //     const res = await API.post(`api/admin/login`, formData);
  //     // ✅ Save token
  //     localStorage.setItem("adminToken", res.data.token);
  //     login(res.data.token);

  //     navigate("/admin/dashboard");
  //   } catch (err) {
  //     setError(err.response?.data?.message || "Login failed");
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const token = btoa(`${formData.username}:${formData.password}`); // Base64 encode
      const res = await API.get("/admin/events", {
        headers: {
          Authorization: `Basic ${token}`,
        },
      });

      localStorage.setItem("adminToken", token);
      login(token);

      navigate("/admin/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid credentials or server error");
    }
  };



  return (
    <div className="login-container" style={{ padding: "2rem", textAlign: "center" }}>
      <h2>Admin Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ maxWidth: "400px", margin: "0 auto" }}>
        <input
          type="text"
          name="username" // ✅ correct
          placeholder="Admin username"
          value={formData.username}
          onChange={handleChange}
          required
          style={{ width: "100%", padding: "10px", marginBottom: "1rem" }}
        />
        <input
          type="password"
          name="password"
          placeholder="Admin Password"
          value={formData.password}
          onChange={handleChange}
          required
          style={{ width: "100%", padding: "10px", marginBottom: "1rem" }}
        />
        <button type="submit" style={{ padding: "10px 20px" }}>Login</button>
      </form>
    </div>
  );
};

export default Login;
