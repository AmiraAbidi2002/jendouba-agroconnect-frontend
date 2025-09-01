// AuthPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { loginRequest, registerRequest } from "../api/authService";
import { jwtDecode } from "jwt-decode"; // Decode JWT token after login
import MapPicker from "../components/MapPicker"; // Component to pick location on map
import "./AuthPage.css"; // Styles for auth page

export default function AuthPage() {
  const navigate = useNavigate(); // Navigation hook to redirect
  const location = useLocation(); // Get state passed from HomePage

  // Determine initial mode (login or register) based on navigation state
  const initialMode = location.state?.mode === "register" ? false : true;
  const role = location.state?.role || "BUYER"; // Default role if not provided

  // State for toggling between Login and Register
  const [isSignIn, setIsSignIn] = useState(initialMode);

  // Form state: stores input values
  const [formData, setFormData] = useState({
    user_name: "",
    email: "",
    password: "",
    location: "", // Will hold location URL from MapPicker
  });

  // Form validation errors
  const [errors, setErrors] = useState({});

  // Keep isSignIn in sync if initialMode changes
  useEffect(() => setIsSignIn(initialMode), [initialMode]);

  // Callback function triggered by MapPicker component
  const handleLocationPick = (url) => {
    setFormData((prev) => ({ ...prev, location: url }));
  };

  // Validate form fields before submission
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

    setErrors(newErrors); // Update error state
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  // Toggle between login and register modes
  const toggleMode = () => {
    // Reset form fields when switching modes
    setFormData({ user_name: "", email: "", password: "", location: "" });
    setIsSignIn(!isSignIn);
  };

  // Update form state on input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission for login or register
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form before sending request
    if (!validateForm()) return;

    try {
      if (isSignIn) {
        // LOGIN process
        const token = await loginRequest(formData.email, formData.password);

        if (!token) {
          alert("Login failed: Empty token. Check your password.");
          return;
        }

        const decoded = jwtDecode(token); // Decode JWT token
        localStorage.setItem("token", token); // Save token in localStorage

        // Redirect based on user type
        const userType = decoded.user_type;
        if (userType === "FARMER") navigate("/dashboard/farmer");
        else navigate("/dashboard/buyer");
      } else {
        // REGISTER process
        await registerRequest({
          user_name: formData.user_name,
          email: formData.email,
          password: formData.password,
          location: formData.location, // Map location URL
          user_type: role,
        });

        alert("Account created! You can now login.");
        toggleMode(); // Switch to login after registration
      }
    } catch (err) {
      // Handle errors from API
      console.error("Auth error:", err.response?.data || err.message);
      alert(
        `Authentication failed: ${err.response?.data?.message || err.message}`
      );
    }
  };

  // Go back to HomePage
  const handleBackHome = () => navigate("/");

  return (
    <div
      className="auth-container min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/crops.jpg')" }} // Background image
    >
      <div className="auth-card">
        {/* Inner container for 3D flip animation */}
        <div className={`auth-inner ${isSignIn ? "show-login" : "show-register"}`}>
          
          {/* LOGIN FACE */}
          <div className="auth-face auth-front">
            <h2 className="text-2xl font-bold mb-4">Login</h2>

            {/* Login form */}
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
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password}</p>
              )}

              <button type="submit" className="btn-primary">
                Login
              </button>
            </form>

            {/* Switch to Register */}
            <p className="mt-2 text-sm">
              No account?{" "}
              <span className="text-blue-500 cursor-pointer" onClick={toggleMode}>
                Register
              </span>
            </p>

            {/* Back to Home button */}
            <button onClick={handleBackHome} className="btn-back mt-4">
              Back to Home
            </button>
          </div>

          {/* REGISTER FACE */}
          <div className="auth-face auth-back">
            <h2 className="text-2xl font-bold mb-4">Register</h2>

            {/* Registration form */}
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
              {errors.user_name && (
                <p className="text-red-500 text-sm">{errors.user_name}</p>
              )}

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
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password}</p>
              )}

              {/* MapPicker for location */}
              <div className="space-y-2">
                <label className="block font-semibold">Location</label>
                <MapPicker onChange={handleLocationPick} />
                {errors.location && (
                  <p className="text-red-500 text-sm">{errors.location}</p>
                )}
              </div>

              <button type="submit" className="btn-primary">
                Register
              </button>
            </form>

            {/* Switch to Login */}
            <p className="mt-2 text-sm">
              Already have an account?{" "}
              <span className="text-blue-500 cursor-pointer" onClick={toggleMode}>
                Login
              </span>
            </p>

            {/* Back to Home button */}
            <button onClick={handleBackHome} className="btn-back mt-4">
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
