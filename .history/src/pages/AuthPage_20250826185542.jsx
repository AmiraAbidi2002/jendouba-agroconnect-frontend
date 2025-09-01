import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { loginRequest, registerRequest } from "../api/authService";
import { jwtDecode } from "jwt-decode";
import "./AuthPage.css";
import MapPicker from "../components/MapPicker";

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();

  //  login ou register
  const initialMode = location.state?.mode === "register" ? false : true;
  const role = location.state?.role || "BUYER";

  const [isSignIn, setIsSignIn] = useState(initialMode);
  const [formData, setFormData] = useState({
    user_name: "",
    email: "",
    password: "",
    location: "", //  MapPicker
  });
  const [errors, setErrors] = useState({});

  useEffect(() => setIsSignIn(initialMode), [initialMode]);

  // Callback  MapPicker
  const handleLocationPick = (url) => {
    setFormData((s) => ({ ...s, location: url }));
  };

  // Validation 
  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";

    if (!isSignIn) {
      if (!formData.user_name) newErrors.user_name = "Name is required";
      if (!formData.location) newErrors.location = "Location is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const toggleMode = () => {
    setFormData({ user_name: "", email: "", password: "", location: "" });
    setIsSignIn(!isSignIn);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (isSignIn) {
        // LOGIN
        const token = await loginRequest(formData.email, formData.password);
        if (!token) {
          alert("Login failed: Empty token .Check your password");
          return;
        }

        const decoded = jwtDecode(token);
        localStorage.setItem("token", token);

        const userType = decoded.user_type;
        if (userType === "FARMER") navigate("/dashboard/farmer");
        else navigate("/dashboard/buyer");
      } else {
        // REGISTER
        await registerRequest({
          user_name: formData.user_name,
          email: formData.email,
          password: formData.password,
          location: formData.location, // Leaflet location
          user_type: role,
        });
        alert("Account created! You can now login.");
        toggleMode();
      }
    } catch (err) {
      console.error("Auth error:", err.response?.data || err.message);
      alert(`Authentication failed: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleBackHome = () => navigate("/");

  return (
    <div
      className="auth-container min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/crops.jpg')" }}
    >
      <div className={`auth-card ${isSignIn ? "show-login" : "show-register"}`}>

        {/* LOGIN */}
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
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="input-field"
              required
            />
            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}

            <button type="submit" className="btn-primary">Login</button>
          </form>
          <p className="mt-2 text-sm">
            No account? <span className="text-blue-500 cursor-pointer" onClick={toggleMode}>Register</span>
          </p>
          <button onClick={handleBackHome} className="btn-back mt-4">Back to Home</button>
        </div>

        {/* REGISTER */}
        <div className="auth-face auth-back">
          <h2 className="text-2xl font-bold mb-4">Register</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              name="user_name"
              placeholder="Name"
              value={formData.user_name}
              onChange={handleChange}
              className="input-field"
              required
            />
            {errors.user_name && <p className="text-red-500 text-sm">{errors.user_name}</p>}

            <input
              type="text"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="input-field"
              required
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="input-field"
              required
            />
            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}

            <div className="space-y-2">
              <label className="block font-semibold">Location</label>
              <MapPicker onChange={handleLocationPick} />
              {errors.location && <p className="text-red-500 text-sm">{errors.location}</p>}
            </div>

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
