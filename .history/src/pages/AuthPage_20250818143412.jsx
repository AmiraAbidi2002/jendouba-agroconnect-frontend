import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { loginRequest } from "../api/AuthService";
import { registerRequest } from "../api/AuthService";   // tu créer ce service
import jwtDecode from "jwt-decode";
import "./AuthPage.css";

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const initialMode = location.state?.mode === "register" ? false : true;
  const [isSignIn, setIsSignIn] = useState(initialMode);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: ""
  });

  const role = location.state?.role || "buyer";

  useEffect(() => setIsSignIn(initialMode), [initialMode]);

  const toggleMode = () => {
    setFormData({ fullName: "", email: "", password: "" });
    setIsSignIn(!isSignIn);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isSignIn) {
        // login
        const token = await loginRequest(formData.email, formData.password);
        localStorage.setItem("token", token);

        const decoded = jwtDecode(token);
        const userType = decoded.user_type; 

        if (userType === "farmer") navigate("/farmer");
        else navigate("/buyer");
      } else {
        // register
        await registerRequest({
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
          user_type: role,
        });
        alert("Account created! You can now login.");
        toggleMode();
      }
    } catch (err) {
      alert("Authentication failed");
    }
  };

  const handleBackHome = () => navigate("/");

  return (
    <div
      className="auth-container min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/jendouba.jpg')" }}
    >
      <div className={`auth-card ${isSignIn ? "show-login" : "show-register"}`}>
        {/* Login form */}
        <div className="auth-face auth-front">
          <h2 className="text-2xl font-bold mb-4">Login</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="input-field"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="input-field"
              required
            />
            <button type="submit" className="btn-primary">Login</button>
          </form>
          <p className="mt-2 text-sm">
            No account? <span className="text-blue-500 cursor-pointer" onClick={toggleMode}>Register</span>
          </p>
          <button onClick={handleBackHome} className="btn-back mt-4">Back to Home</button>
        </div>

        {/* Register form */}
        <div className="auth-face auth-back">
          <h2 className="text-2xl font-bold mb-4">Register</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              className="input-field"
              required
            />
            <input
              type="text"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="input-field"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="input-field"
              required
            />
            <button type="submit" className="btn-primary">Register</button>
          </form>
          <p className="mt-2 text-sm">
            Already have an account? <span className="text-blue-500 cursor-pointer" onClick={toggleMode}>Login</span>
          </p>
          <button onClick={handleBackHome} className="btn-back mt-4">Back to Home</button>
        </div>
      </div>
    </div>
  );
}
