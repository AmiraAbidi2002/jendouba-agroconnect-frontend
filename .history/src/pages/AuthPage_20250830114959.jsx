// AuthPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { loginRequest, registerRequest } from "../api/authService";
import { jwtDecode } from "jwt-decode"; // Decode JWT token
import MapPicker from "../components/MapPicker"; // Location picker component
import "./AuthPage.css"; // Styles for auth pages

/**
 * AuthPage component
 * Handles Login and Registration with 3D flip animation
 * Includes input validation, error handling, and mobile responsiveness.
 */
export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine initial mode (login or register)
  const initialMode = location.state?.mode !== "register";
  const role = location.state?.role || "BUYER";

  const [isSignIn, setIsSignIn] = useState(initialMode);

  // Form data state
  const [formData, setFormData] = useState({
    user_name: "",
    email: "",
    password: "",
    location: "",
  });

  // Error messages state
  const [errors, setErrors] = useState({});

  // Sync isSignIn with initialMode changes
  useEffect(() => setIsSignIn(initialMode), [initialMode]);

  // Update location from MapPicker
  const handleLocationPick = (url) => {
    setFormData((prev) => ({ ...prev, location: url }));
  };

  /**
   * Validate form inputs
   * @returns {boolean} true if valid
   */
  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";

    // Password validation
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    // Additional validation for registration
    if (!isSignIn) {
      if (!formData.user_name) newErrors.user_name = "Name is required";
      if (!formData.location) newErrors.location = "Location is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Toggle between login and register
  const toggleMode = () => {
    setFormData({ user_name: "", email: "", password: "", location: "" });
    setErrors({});
    setIsSignIn(!isSignIn);
  };

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit handler for login/register
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (isSignIn) {
        const token = await loginRequest(formData.email, formData.password);
        if (!token) {
          alert("Login failed: Empty token.");
          return;
        }
        const decoded = jwtDecode(token);
        localStorage.setItem("token", token);

        // Redirect based on user type
        const userType = decoded.user_type;
        navigate(userType === "FARMER" ? "/dashboard/farmer" : "/dashboard/buyer");
      } else {
        await registerRequest({ ...formData, user_type: role });
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
      <div className="auth-card">
        <div className={`auth-inner ${isSignIn ? "show-login" : "show-register"}`}>
          
          {/* Login Face */}
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

          {/* Register Face */}
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
    </div>
  );
}
