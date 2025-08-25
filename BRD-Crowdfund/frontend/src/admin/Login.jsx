// src/admin/Login.jsx
import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { AdminApi } from "../services/api";

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const basicToken = btoa(`${formData.username}:${formData.password}`);
      localStorage.setItem("adminToken", basicToken); // Store token immediately

      // Attempt to make an authenticated request to a protected admin endpoint to verify credentials.
      // This will use the token just stored in localStorage.
      await AdminApi.getAllEvents(); // Frontend will attempt to hit BASE_URL/admin/events

      // If the above request succeeds (does not throw), then login is successful.
      login(basicToken);
      navigate("/admin/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      localStorage.removeItem("adminToken"); // Clear invalid token if login failed

      if (err.response) {
        if (err.response.status === 401 || err.response.status === 403) {
          setError("Invalid username or password."); //
        } else if (err.response.status === 404) {
          setError("Admin API endpoint for events not found. Check backend configuration/URL for /admin/events."); //
        } else {
          setError(`Server error: ${err.response.status} ${err.response.statusText || 'Unknown error'}`);
        }
      } else if (err.request) {
        setError("Network error: Could not reach the server.");
      } else {
        setError(err.message || "An unexpected error occurred during login.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" style={{ padding: "2rem", textAlign: "center" }}>
      <h2>Admin Login</h2>
      {error && <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ maxWidth: "400px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <input
          type="text"
          name="username"
          placeholder="Admin username"
          value={formData.username}
          onChange={handleChange}
          required
          disabled={loading}
          autoComplete="username" // Corrected DOM property
          style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }}
        />
        <input
          type="password"
          name="password"
          placeholder="Admin Password"
          value={formData.password}
          onChange={handleChange}
          required
          disabled={loading}
          autoComplete="current-password" // Corrected DOM property
          style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }}
        />
        <button type="submit" disabled={loading} style={{ padding: "10px 20px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;