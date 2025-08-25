import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { loginRequest } from "../api/authService";
import { registerRequest } from "../api/authService";   
import { jwtDecode } from "jwt-decode";
import "./AuthPage.css";

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const initialMode = location.state?.mode === "register" ? false : true;
  const [isSignIn, setIsSignIn] = useState(initialMode);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    location: ""
  });

  const role = location.state?.role || "buyer";

  const [errors, setErrors] = useState({});

  const validateForm = () => {
  const newErrors = {};

  if (!formData.email) {
    newErrors.email = "Email is required";
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    newErrors.email = "Email is invalid";
  }

  if (!formData.password) {
    newErrors.password = "Password is required";
  } else if (formData.password.length < 6) {
    newErrors.password = "Password must be at least 6 characters";
  }

  if (!isSignIn) {
    
    if (!formData.fullName) {
      newErrors.fullName = "Full Name is required";
    } else if (formData.fullName.length < 3) {
      newErrors.fullName = "Full Name must be at least 3 characters";
    }
    if (!formData.location) {
    newErrors.location = "Location is required";
  }

  if (!formData.email) {
    newErrors.email = "Email is required";
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    newErrors.email = "Email is invalid";
  }

  if (!formData.password) {
    newErrors.password = "Password is required";
  } else if (formData.password.length < 6) {
    newErrors.password = "Password must be at least 6 characters";
  }

  }

  setErrors(newErrors);

  return Object.keys(newErrors).length === 0; 
};


  useEffect(() => setIsSignIn(initialMode), [initialMode]);

  const toggleMode = () => {
    setFormData({ fullName: "", email: "", password: "" ,location: ""});
    setIsSignIn(!isSignIn);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if(!validateForm()) return;

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
          user_name: formData.fullName,
          email: formData.email,
          password: formData.password,
          location: formData.location,
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
            {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName}</p>}
            
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

              
              <input type="text"name="location"placeholder="Location"value={formData.location} onChange={handleChange} className="input-field" required
              />
              {errors.location && <p className="text-red-500 text-sm">{errors.location}</p>}


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
